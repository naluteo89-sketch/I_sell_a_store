package com.isellastore.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

/**
 * 관리자 상품 등록·수정 폼.
 *
 * 예) 색상 2개 × 사이즈 2개
 * {
 *   "name": "오버핏 맨투맨", "price": 39000, "categorySlug": "fashion",
 *   "attributes": [{"name": "소재", "value": "면 100%"}],
 *   "options":    [{"name": "색상", "values": ["블랙", "화이트"]}, {"name": "사이즈", "values": ["M", "L"]}],
 *   "variants":   [{"options": {"색상": "블랙", "사이즈": "M"}, "additionalPrice": 0, "stock": 10}, ...]
 * }
 * options 가 비어 있으면 옵션 없는 상품이고, stock 이 재고가 된다.
 */
public record ProductForm(
        @NotBlank String name,
        String description,
        @Min(0) long price,
        @Min(0) int stock,
        String imageUrl,
        String categorySlug,
        String youtubeKeyword,
        List<@Valid AttributeForm> attributes,
        List<@Valid OptionForm> options,
        List<@Valid VariantForm> variants
) {
    public record AttributeForm(@NotBlank @Size(max = 100) String name, @NotBlank @Size(max = 500) String value) {}

    public record OptionForm(@NotBlank @Size(max = 100) String name, List<@NotBlank @Size(max = 100) String> values) {}

    public record VariantForm(Map<String, String> options, long additionalPrice, @Min(0) int stock,
                              String sku, Boolean active) {}

    public List<AttributeForm> attributesOrEmpty() { return attributes == null ? List.of() : attributes; }
    public List<OptionForm> optionsOrEmpty() { return options == null ? List.of() : options; }
    public List<VariantForm> variantsOrEmpty() { return variants == null ? List.of() : variants; }
}
