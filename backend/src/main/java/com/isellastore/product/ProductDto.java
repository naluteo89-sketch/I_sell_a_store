package com.isellastore.product;

import java.util.Map;

public record ProductDto(
        Long id,
        String name,
        String description,
        long price,
        int stock,
        String imageUrl,
        String categorySlug,
        String categoryName,
        Map<String, Object> metadata
) {
    public static ProductDto from(Product p) {
        Category c = p.getCategory();
        return new ProductDto(
                p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStock(),
                p.getImageUrl(),
                c == null ? null : c.getSlug(),
                c == null ? null : c.getName(),
                p.getMetadata()
        );
    }
}
