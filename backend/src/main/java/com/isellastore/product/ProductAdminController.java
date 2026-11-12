package com.isellastore.product;

import com.isellastore.youtube.ProductVideoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * 관리자용 상품 API.
 * TODO(보안 작업): 관리자 로그인(Spring Security) 붙이기 전까지는 운영 서버에 공개하지 말 것.
 */
@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final ProductRepository products;
    private final ProductAssembler assembler;
    private final ProductVideoService videos;

    public ProductAdminController(ProductRepository products, ProductAssembler assembler, ProductVideoService videos) {
        this.products = products;
        this.assembler = assembler;
        this.videos = videos;
    }

    /** 관리자 목록용: 판매 중지·데모 여부와 유튜브 검색어 포함 */
    public record AdminProductDto(ProductDto product, boolean active, boolean demo,
                                  String youtubeKeyword, String effectiveKeyword) {}

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminProductDto> all() {
        return products.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toAdmin)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public AdminProductDto one(@PathVariable Long id) {
        return toAdmin(find(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AdminProductDto create(@Valid @RequestBody ProductForm form) {
        Product p = products.save(assembler.create(form));
        videos.updateKeyword(p, form.youtubeKeyword());
        // 상품 등록 시점에 한 번만 검색해 영상 목록을 만든다 (방문자 조회로는 검색하지 않음)
        videos.refreshQuietly(p);
        return toAdmin(p);
    }

    @PutMapping("/{id}")
    @Transactional
    public AdminProductDto update(@PathVariable Long id, @Valid @RequestBody ProductForm form) {
        Product p = find(id);
        assembler.apply(p, form);
        videos.updateKeyword(p, form.youtubeKeyword());
        products.flush();
        return toAdmin(p);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deactivate(@PathVariable Long id) {
        find(id).setActive(false);
    }

    @PostMapping("/{id}/activate")
    @Transactional
    public void activate(@PathVariable Long id) {
        find(id).setActive(true);
    }

    private AdminProductDto toAdmin(Product p) {
        var setting = videos.settingOf(p.getId());
        return new AdminProductDto(ProductDto.from(p), p.isActive(), p.isDemo(),
                setting == null ? null : setting.getKeyword(), videos.keywordFor(p));
    }

    private Product find(Long id) {
        return products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
