package com.isellastore.order;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record OrderDto(
        String orderNo,
        OrderStatus status,
        long totalAmount,
        Instant createdAt,
        Shipping shipping,
        List<Item> items,
        PaymentInfo payment
) {
    public record Shipping(String recipientName, String phone, String zipcode,
                           String address1, String address2, String memo) {}

    public record Item(Long productId, Long variantId, String productName, String optionLabel,
                       long unitPrice, int quantity) {}

    public record PaymentInfo(String method, Payment.Status status, String transactionId, Instant paidAt) {}

    public static OrderDto from(StoreOrder o) {
        OrderShipping s = o.getShipping();
        Payment last = o.getPayments().stream().max(Comparator.comparing(Payment::getRequestedAt)).orElse(null);
        return new OrderDto(
                o.getOrderNo(), o.getStatus(), o.getTotalAmount(), o.getCreatedAt(),
                s == null ? null : new Shipping(s.getRecipientName(), s.getPhone(), s.getZipcode(),
                        s.getAddress1(), s.getAddress2(), s.getMemo()),
                o.getItems().stream().map(i -> new Item(
                        i.getProduct() == null ? null : i.getProduct().getId(),
                        i.getVariant() == null ? null : i.getVariant().getId(),
                        i.getProductName(), i.getOptionLabel(), i.getUnitPrice(), i.getQuantity())).toList(),
                last == null ? null : new PaymentInfo(last.getMethod(), last.getStatus(),
                        last.getTransactionId(), last.getPaidAt())
        );
    }
}
