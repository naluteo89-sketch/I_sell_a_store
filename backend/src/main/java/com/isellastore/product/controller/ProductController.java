package com.isellastore.product.controller;

import com.isellastore.catalog.CatalogPage;
import com.isellastore.catalog.ProductCard;
import com.isellastore.catalog.ProductCatalogService;
import com.isellastore.global.market.Market;
import com.isellastore.product.domain.Category;
import com.isellastore.product.dto.ProductDto;
import com.isellastore.product.service.ProductQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 방문자용 상품 API.
 * 목록은 ProductCatalogService(SQL 정렬·검색·페이지 나눔), 상세·연관은 기존 ProductQueryService.
 */
@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductQueryService service;
    private final ProductCatalogService catalog;

    public ProductController(ProductQueryService service, ProductCatalogService catalog) {
        this.service = service;
        this.catalog = catalog;
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return service.categories();
    }

    /**
     * 상품 목록. 응답 본문은 예전처럼 배열이고, 전체 개수는 X-Total-Count 헤더로 준다.
     * page 는 1부터, size 는 최대 100 (기본 40).
     */
    @GetMapping("/products")
    public ResponseEntity<List<ProductCard>> list(@RequestParam(name = "lang", defaultValue = "ko") String lang,
                                                  @RequestParam(name = "category", required = false) String category,
                                                  @RequestParam(name = "q", required = false) String q,
                                                  @RequestParam(name = "sort", defaultValue = "new") String sort,
                                                  @RequestParam(name = "page", defaultValue = "1") int page,
                                                  @RequestParam(name = "size", defaultValue = "40") int size) {
        CatalogPage<ProductCard> result = catalog.list(Market.fromLang(lang), category, q, sort, page, size);
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(result.total()))
                .header("Access-Control-Expose-Headers", "X-Total-Count")
                .body(result.items());
    }

    @GetMapping("/products/{id}")
    public ProductDto detail(@PathVariable("id") Long id,
                             @RequestParam(name = "lang", defaultValue = "ko") String lang) {
        return service.detail(Market.fromLang(lang), id);
    }

    @GetMapping("/products/{id}/related")
    public List<ProductDto> related(@PathVariable("id") Long id,
                                    @RequestParam(name = "lang", defaultValue = "ko") String lang,
                                    @RequestParam(name = "limit", defaultValue = "4") int limit) {
        return service.related(Market.fromLang(lang), id, limit);
    }
}
