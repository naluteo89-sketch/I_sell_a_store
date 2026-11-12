package com.isellastore.product.dto;

import com.isellastore.product.domain.Category;
import com.isellastore.product.domain.Product;
import com.isellastore.product.domain.ProductOptionValue;
import com.isellastore.product.domain.ProductVariant;

import java.util.List;

/** 쇼핑몰 화면용 상품 정보 */
public record ProductDto(
        Long id,
        String name,
        String description,
        long price,
        int stock,
        String imageUrl,
        String categorySlug,
        String categoryName,
        List<Attribute> attributes,
        List<Option> options,
        List<Variant> variants
) {
    public record Attribute(String name, String value) {}

    public record OptionValue(Long id, String name) {}

    public record Option(Long id, String name, List<OptionValue> values) {}

    /** price = 기본가 + 추가금 (실제 단가) */
    public record Variant(Long id, String sku, String label, List<Long> optionValueIds,
                          long additionalPrice, long price, int stock) {}

    public static ProductDto from(Product p) {
        Category c = p.getCategory();
        return new ProductDto(
                p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.totalStock(), p.getImageUrl(),
                c == null ? null : c.getSlug(),
                c == null ? null : c.getName(),
                p.getAttributes().stream().map(a -> new Attribute(a.getName(), a.getValue())).toList(),
                p.getOptions().stream()
                        .map(o -> new Option(o.getId(), o.getName(),
                                o.getValues().stream().map(v -> new OptionValue(v.getId(), v.getName())).toList()))
                        .toList(),
                p.getVariants().stream()
                        .filter(ProductVariant::isActive)
                        .map(v -> new Variant(v.getId(), v.getSku(), v.label(),
                                v.sortedValues().stream().map(ProductOptionValue::getId).toList(),
                                v.getAdditionalPrice(), v.unitPrice(), v.getStock()))
                        .toList()
        );
    }
}
