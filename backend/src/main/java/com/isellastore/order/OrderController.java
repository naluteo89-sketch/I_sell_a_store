package com.isellastore.order;

import com.isellastore.config.StoreProperties;
import com.isellastore.payment.PaymentGateway;
import com.isellastore.product.Product;
import com.isellastore.product.ProductRepository;
import com.isellastore.product.ProductVariant;
import com.isellastore.product.ProductVariantRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final StoreOrderRepository orders;
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final PaymentGateway payment;
    private final StoreProperties props;

    public OrderController(StoreOrderRepository orders, ProductRepository products, ProductVariantRepository variants,
                           PaymentGateway payment, StoreProperties props) {
        this.orders = orders;
        this.products = products;
        this.variants = variants;
        this.payment = payment;
        this.props = props;
    }

    /** variantId 는 옵션 상품일 때 필수 */
    public record ItemForm(@NotNull Long productId, Long variantId, @Min(1) @Max(99) int quantity) {}

    public record ShippingForm(
            @NotBlank @Size(max = 100) String recipientName,
            @NotBlank @Pattern(regexp = "^[0-9\\-+ ]{8,20}$", message = "연락처 형식이 올바르지 않습니다") String phone,
            @Size(max = 10) String zipcode,
            @NotBlank @Size(max = 255) String address1,
            @Size(max = 255) String address2,
            @Size(max = 255) String memo
    ) {}

    public record OrderForm(@NotNull @Valid ShippingForm shipping, @NotEmpty @Size(max = 50) List<@Valid ItemForm> items) {}

    public record PayForm(@NotBlank @Size(max = 30) String method) {}

    /** 주문서 생성. 금액은 브라우저가 보낸 값이 아니라 서버의 상품·조합 가격으로 계산한다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public OrderDto create(@Valid @RequestBody OrderForm form) {
        List<OrderItem> items = new ArrayList<>();
        for (ItemForm i : form.items()) {
            Product p = products.findById(i.productId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> bad("판매하지 않는 상품입니다: " + i.productId()));
            ProductVariant v = null;
            if (p.hasVariants()) {
                if (i.variantId() == null) throw bad("옵션을 선택해 주세요: " + p.getName());
                v = variants.findById(i.variantId())
                        .filter(x -> x.getProduct().getId().equals(p.getId()) && x.isActive())
                        .orElseThrow(() -> bad("선택할 수 없는 옵션입니다: " + p.getName()));
                if (v.getStock() < i.quantity()) throw conflict("재고가 부족합니다: " + p.getName() + " (" + v.label() + ")");
            } else if (p.getStock() < i.quantity()) {
                throw conflict("재고가 부족합니다: " + p.getName());
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
    @PostMapping("/{orderNo}/pay")
    @Transactional
    public OrderDto pay(@PathVariable String orderNo, @Valid @RequestBody PayForm form) {
        if (!props.features().payment()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 기능이 꺼져 있습니다");
        }
        StoreOrder order = find(orderNo);
        Payment pay;
        try {
            pay = order.startPayment(form.method());
        } catch (IllegalStateException e) {
            throw conflict(e.getMessage());
        }

        for (OrderItem item : order.getItems()) {
            int updated = item.getVariant() != null
                    ? variants.decreaseStock(item.getVariant().getId(), item.getQuantity())
                    : item.getProduct() == null ? 0 : products.decreaseStock(item.getProduct().getId(), item.getQuantity());
            if (updated == 0) {
                throw conflict("재고가 부족합니다: " + item.getProductName()
                        + (item.getOptionLabel() == null ? "" : " (" + item.getOptionLabel() + ")"));
            }
        }

        var result = payment.pay(new PaymentGateway.PaymentRequest(
                order.getOrderNo(), order.getTotalAmount(), form.method(), order.getShipping().getRecipientName()));
        if (!result.success()) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, result.message());
        }
        pay.succeed(result.transactionId());
        order.markPaid();
        return OrderDto.from(order);
    }

    /**
     * 주문 조회. 주문번호만으로는 개인정보(이름·연락처·주소)를 보여주지 않는다.
     * 주문할 때 입력한 연락처가 맞아야 조회되고, 틀리면 "없음"으로 응답한다 (존재 여부도 숨김).
     */
    @GetMapping("/{orderNo}")
    @Transactional(readOnly = true)
    public OrderDto get(@PathVariable String orderNo, @RequestParam String phone) {
        StoreOrder order = find(orderNo);
        if (order.getShipping() == null || !order.getShipping().phoneMatches(phone)) {
            throw notFound();
        }
        return OrderDto.from(order);
    }

    private StoreOrder find(String orderNo) {
        return orders.findByOrderNo(orderNo).orElseThrow(this::notFound);
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "주문을 찾을 수 없습니다");
    }

    private static ResponseStatusException bad(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }

    private static ResponseStatusException conflict(String m) {
        return new ResponseStatusException(HttpStatus.CONFLICT, m);
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
