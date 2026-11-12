package com.isellastore.product;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductController(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return categories.findAllByOrderBySortOrderAsc();
    }

    /**
     * 상품 목록.
     * @param category 카테고리 slug
     * @param q        검색어 (상품명·설명)
     * @param sort     new(기본) | priceAsc | priceDesc | name
     */
    @GetMapping("/products")
    public List<ProductDto> list(@RequestParam(required = false) String category,
                                 @RequestParam(required = false) String q,
                                 @RequestParam(defaultValue = "new") String sort) {
        List<Product> found = (category == null || category.isBlank())
                ? products.findByActiveTrueOrderByCreatedAtDesc()
                : products.findByActiveTrueAndCategorySlugOrderByCreatedAtDesc(category);

        Stream<Product> stream = found.stream();
        if (q != null && !q.isBlank()) {
            String needle = q.trim().toLowerCase(Locale.ROOT);
            stream = stream.filter(p -> contains(p.getName(), needle) || contains(p.getDescription(), needle));
        }
        Comparator<Product> order = switch (sort) {
            case "priceAsc" -> Comparator.comparingLong(Product::getPrice);
            case "priceDesc" -> Comparator.comparingLong(Product::getPrice).reversed();
            case "name" -> Comparator.comparing(Product::getName);
            default -> null; // 이미 최신순
        };
        if (order != null) stream = stream.sorted(order);
        return stream.map(ProductDto::from).toList();
    }

    @GetMapping("/products/{id}")
    public ProductDto detail(@PathVariable Long id) {
        return ProductDto.from(findActive(id));
    }

    /** 같은 카테고리의 다른 상품 (상세 페이지 하단) */
    @GetMapping("/products/{id}/related")
    public List<ProductDto> related(@PathVariable Long id, @RequestParam(defaultValue = "4") int limit) {
        Product p = findActive(id);
        if (p.getCategory() == null) return List.of();
        return products.findByActiveTrueAndCategorySlugOrderByCreatedAtDesc(p.getCategory().getSlug()).stream()
                .filter(other -> !other.getId().equals(id))
                .limit(Math.max(0, Math.min(limit, 12)))
                .map(ProductDto::from)
                .toList();
    }

    private Product findActive(Long id) {
        return products.findActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품이 없습니다"));
    }

    private static boolean contains(String text, String needle) {
        return text != null && text.toLowerCase(Locale.ROOT).contains(needle);
    }
}
