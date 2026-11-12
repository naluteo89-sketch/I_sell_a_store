package com.isellastore.product;

import com.isellastore.youtube.ProductVideoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * 관리자용 상품 API.
 * TODO: 관리자 인증(Spring Security) 붙이기 전까지는 운영 서버에 공개하지 말 것.
 */
@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final ProductVideoService videos;

    public ProductAdminController(ProductRepository products, CategoryRepository categories,
                                  ProductVideoService videos) {
        this.products = products;
        this.categories = categories;
        this.videos = videos;
    }

    public record ProductForm(
            @NotBlank String name,
            String description,
            @Min(0) long price,
            @Min(0) int stock,
            String imageUrl,
            String categorySlug,
            Map<String, Object> metadata,
            String youtubeKeyword
    ) {}

    /** 관리자 목록용: 판매 중지 상품과 유튜브 검색어까지 포함 */
    public record AdminProductDto(ProductDto product, boolean active, String youtubeKeyword, String effectiveKeyword) {}

    @GetMapping
    public List<AdminProductDto> all() {
        return products.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(p -> new AdminProductDto(ProductDto.from(p), p.isActive(), p.getYoutubeKeyword(),
                        videos.keywordFor(p)))
                .toList();
    }

    @PostMapping("/{id}/activate")
    @Transactional
    public void activate(@PathVariable Long id) {
        setActive(id, true);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ProductDto create(@Valid @RequestBody ProductForm form) {
        Product p = products.save(apply(new Product(), form));
        // 상품 등록 시점에 한 번만 검색해 캐시를 만든다 (방문자 조회로는 검색하지 않음)
        videos.refreshQuietly(p);
        return ProductDto.from(p);
    }

    @PutMapping("/{id}")
    @Transactional
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductForm form) {
        return ProductDto.from(apply(products.getOrNotFound(id), form));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deactivate(@PathVariable Long id) {
        setActive(id, false);
    }

    private void setActive(Long id, boolean active) {
        products.findById(id).ifPresent(p -> p.setActive(active));
    }

    /** 등록·수정 공통: 폼 값을 상품에 옮겨 담는다 */
    private Product apply(Product p, ProductForm form) {
        p.setName(form.name());
        p.setDescription(form.description());
        p.setPrice(form.price());
        p.setStock(form.stock());
        p.setCategory(category(form.categorySlug()));
        p.setImageUrl(form.imageUrl());
        p.setYoutubeKeyword(form.youtubeKeyword());
        if (form.metadata() != null) {
            p.setMetadata(form.metadata());
        }
        return p;
    }

    private Category category(String slug) {
        if (slug == null || slug.isBlank()) return null;
        return categories.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "없는 카테고리: " + slug));
    }
}
