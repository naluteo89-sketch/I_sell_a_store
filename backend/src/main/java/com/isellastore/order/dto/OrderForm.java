package com.isellastore.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/** 주문서 생성 요청 */
public record OrderForm(
        @NotNull @Valid ShippingForm shipping,
        @NotEmpty @Size(max = 50) List<@Valid ItemForm> items
) {
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
}
