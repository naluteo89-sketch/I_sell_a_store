package com.isellastore.order.service;

import com.isellastore.global.config.StoreProperties;
import com.isellastore.global.error.ApiException;
import com.isellastore.order.domain.OrderItem;
import com.isellastore.order.domain.OrderShipping;
import com.isellastore.order.domain.Payment;
import com.isellastore.order.domain.StoreOrder;
import com.isellastore.order.dto.OrderDto;
import com.isellastore.order.dto.OrderForm;
import com.isellastore.order.repository.StoreOrderRepository;
import com.isellastore.payment.PaymentGateway;
import com.isellastore.product.domain.Product;
import com.isellastore.product.domain.ProductVariant;
import com.isellastore.product.repository.ProductRepository;
import com.isellastore.product.repository.ProductVariantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/** 주문 생성·결제·조회 */
@Service
public class OrderService {

    private final StoreOrderRepository orders;
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final PaymentGateway payment;
    private final StoreProperties props;

    public OrderService(StoreOrderRepository orders, ProductRepository products, ProductVariantRepository variants,
                        PaymentGateway payment, StoreProperties props) {
        this.orders = orders;
        this.products = products;
        this.variants = variants;
        this.payment = payment;
        this.props = props;
    }

    /** 주문서 생성. 금액은 브라우저가 보낸 값이 아니라 서버의 상품·조합 가격으로 계산한다. */
    @Transactional
    public OrderDto create(OrderForm form) {
        List<OrderItem> items = new ArrayList<>();
        for (OrderForm.ItemForm i : form.items()) {
            Product p = products.findById(i.productId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> ApiException.badRequest("판매하지 않는 상품입니다: " + i.productId()));
            ProductVariant v = null;
            if (p.hasVariants()) {
                if (i.variantId() == null) throw ApiException.badRequest("옵션을 선택해 주세요: " + p.getName());
                v = variants.findById(i.variantId())
                        .filter(x -> x.getProduct().getId().equals(p.getId()) && x.isActive())
                        .orElseThrow(() -> ApiException.badRequest("선택할 수 없는 옵션입니다: " + p.getName()));
                if (v.getStock() < i.quantity()) {
                    throw ApiException.conflict("재고가 부족합니다: " + p.getName() + " (" + v.label() + ")");
                }
            } else if (p.getStock() < i.quantity()) {
                throw ApiException.conflict("재고가 부족합니다: " + p.getName());
            }
            items.add(new OrderItem(p, v, i.quantity()));
        }
        StoreOrder order = new StoreOrder(items);
        var s = form.shipping();
        order.setShipping(new OrderShipping(s.recipientName().trim(), s.phone().trim(), blankToNull(s.zipcode()),
                s.address1().trim(), blankToNull(s.address2()), blankToNull(s.memo())));
        return OrderDto.from(orders.save(order));
    }

    /**
     * 결제. 재고를 먼저 원자적으로 차감한 뒤(동시 결제로 재고가 음수가 되지 않음) 결제사를 호출한다.
     * 재고가 모자라거나 결제가 실패하면 트랜잭션 전체가 되돌려진다.
     */
    @Transactional
    public OrderDto pay(String orderNo, String method) {
        if (!props.features().payment()) throw ApiException.forbidden("결제 기능이 꺼져 있습니다");
        StoreOrder order = find(orderNo);
        Payment pay;
        try {
            pay = order.startPayment(method);
        } catch (IllegalStateException e) {
            throw ApiException.conflict(e.getMessage());
        }

        for (OrderItem item : order.getItems()) {
            int updated = item.getVariant() != null
                    ? variants.decreaseStock(item.getVariant().getId(), item.getQuantity())
                    : item.getProduct() == null ? 0 : products.decreaseStock(item.getProduct().getId(), item.getQuantity());
            if (updated == 0) {
                throw ApiException.conflict("재고가 부족합니다: " + item.getProductName()
                        + (item.getOptionLabel() == null ? "" : " (" + item.getOptionLabel() + ")"));
            }
        }

        var result = payment.pay(new PaymentGateway.PaymentRequest(
                order.getOrderNo(), order.getTotalAmount(), method, order.getShipping().getRecipientName()));
        if (!result.success()) {
            throw new ApiException(org.springframework.http.HttpStatus.PAYMENT_REQUIRED, result.message());
        }
        pay.succeed(result.transactionId());
        order.markPaid();
        return OrderDto.from(order);
    }

    /**
     * 주문 조회. 주문할 때 입력한 연락처가 맞아야 보여준다.
     * 틀리면 "없음"으로 응답해 주문 존재 여부도 숨긴다.
     */
    @Transactional(readOnly = true)
    public OrderDto get(String orderNo, String phone) {
        StoreOrder order = find(orderNo);
        if (order.getShipping() == null || !order.getShipping().phoneMatches(phone)) throw notFound();
        return OrderDto.from(order);
    }

    private StoreOrder find(String orderNo) {
        return orders.findByOrderNo(orderNo).orElseThrow(OrderService::notFound);
    }

    private static ApiException notFound() {
        return ApiException.notFound("주문을 찾을 수 없습니다");
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
