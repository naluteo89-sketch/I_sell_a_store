package com.isellastore.order;

import jakarta.persistence.*;

/** 주문 배송지 (주문과 1:1, order_id 가 기본키) */
@Entity
public class OrderShipping {

    @Id
    private Long orderId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private StoreOrder order;

    @Column(nullable = false, length = 100)
    private String recipientName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 10)
    private String zipcode;

    @Column(nullable = false)
    private String address1;

    private String address2;

    private String memo;

    protected OrderShipping() {}

    public OrderShipping(String recipientName, String phone, String zipcode,
                         String address1, String address2, String memo) {
        this.recipientName = recipientName;
        this.phone = phone;
        this.zipcode = zipcode;
        this.address1 = address1;
        this.address2 = address2;
        this.memo = memo;
    }

    void attachTo(StoreOrder order) {
        this.order = order;
    }

    /** 숫자만 비교 (010-1234-5678 == 01012345678) */
    public boolean phoneMatches(String input) {
        if (input == null) return false;
        return digits(phone).equals(digits(input)) && !digits(input).isEmpty();
    }

    private static String digits(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    public Long getOrderId() { return orderId; }
    public String getRecipientName() { return recipientName; }
    public String getPhone() { return phone; }
    public String getZipcode() { return zipcode; }
    public String getAddress1() { return address1; }
    public String getAddress2() { return address2; }
    public String getMemo() { return memo; }
}
