package com.isellastore.order;

import com.isellastore.config.StoreProperties;
import com.isellastore.payment.PaymentGateway;
import com.isellastore.product.Product;
import com.isellastore.product.ProductRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
    private final PaymentGateway payment;
    private final StoreProperties props;

    public OrderController(StoreOrderRepository orders, ProductRepository products,
                           PaymentGateway payment, StoreProperties props) {
        this.orders = orders;
        this.products = products;
        this.payment = payment;
        this.props = props;
    }

    public record ItemForm(@NotNull Long productId, @Min(1) int quantity) {}

    public record OrderForm(
            @NotBlank String buyerName,
            @NotBlank String phone,
            @NotBlank String address,
            @NotEmpty List<@Valid ItemForm> items
    ) {}

    public record PayForm(@NotBlank String method) {}

    /** 주문서 생성. 금액은 브라우저가 보낸 값이 아니라 서버의 상품 가격으로 계산한다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public StoreOrder create(@Valid @RequestBody OrderForm form) {
        List<OrderItem> items = new ArrayList<>();
        for (ItemForm i : form.items()) {
            Product p = products.findActive(i.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "없는 상품: " + i.productId()));
            if (p.getStock() < i.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "재고 부족: " + p.getName());
            }
            items.add(new OrderItem(p.getId(), p.getName(), p.getPrice(), i.quantity()));
        }
        return orders.save(new StoreOrder(form.buyerName(), form.phone(), form.address(), items));
    }

    @PostMapping("/{orderNo}/pay")
    @Transactional
    public StoreOrder pay(@PathVariable String orderNo, @Valid @RequestBody PayForm form) {
        if (!props.features().payment()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 기능이 꺼져 있습니다");
        }
        StoreOrder order = find(orderNo);
        var result = payment.pay(new PaymentGateway.PaymentRequest(
                order.getOrderNo(), order.getTotalAmount(), form.method(), order.getBuyerName()));
        if (!result.success()) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, result.message());
        }
        for (OrderItem item : order.getItems()) {
            products.findById(item.getProductId()).ifPresent(p -> p.decreaseStock(item.getQuantity()));
        }
        order.markPaid(form.method(), result.transactionId());
        return order;
    }

    @GetMapping("/{orderNo}")
    @Transactional(readOnly = true)
    public StoreOrder get(@PathVariable String orderNo) {
        return find(orderNo);
    }

    private StoreOrder find(String orderNo) {
        return orders.findByOrderNo(orderNo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "주문이 없습니다"));
    }
}
