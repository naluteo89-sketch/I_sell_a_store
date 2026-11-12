package com.isellastore.product.controller;

import com.isellastore.product.domain.Category;
import com.isellastore.product.dto.ProductDto;
import com.isellastore.product.service.ProductQueryService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 쇼핑몰 상품 조회 API (요청 → 서비스 호출 → 응답만 담당) */
@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductQueryService service;

    public ProductController(ProductQueryService service) {
        this.service = service;
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return service.categories();
    }

    @GetMapping("/products")
    public List<ProductDto> list(@RequestParam(required = false) String category,
                                 @RequestParam(required = false) String q,
                                 @RequestParam(defaultValue = "new") String sort) {
        return service.list(category, q, sort);
    }

    @GetMapping("/products/{id}")
    public ProductDto detail(@PathVariable Long id) {
        return service.detail(id);
    }

    @GetMapping("/products/{id}/related")
    public List<ProductDto> related(@PathVariable Long id, @RequestParam(defaultValue = "4") int limit) {
        return service.related(id, limit);
    }
}
