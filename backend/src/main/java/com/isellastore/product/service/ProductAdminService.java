package com.isellastore.product.service;

import com.isellastore.global.error.ApiException;
import com.isellastore.product.domain.Product;
import com.isellastore.product.dto.AdminProductDto;
import com.isellastore.product.dto.ProductDto;
import com.isellastore.product.dto.ProductForm;
import com.isellastore.product.repository.ProductRepository;
import com.isellastore.youtube.service.ProductVideoService;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 관리자 상품 등록·수정·판매 상태 변경 */
@Service
public class ProductAdminService {

    private final ProductRepository products;
    private final ProductAssembler assembler;
    private final ProductVideoService videos;

    public ProductAdminService(ProductRepository products, ProductAssembler assembler, ProductVideoService videos) {
        this.products = products;
        this.assembler = assembler;
        this.videos = videos;
    }

    @Transactional(readOnly = true)
    public List<AdminProductDto> all() {
        return products.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream().map(this::toAdmin).toList();
    }

    @Transactional(readOnly = true)
    public AdminProductDto one(Long id) {
        return toAdmin(find(id));
    }

    @Transactional
    public AdminProductDto create(ProductForm form) {
        Product p = products.save(assembler.create(form));
        videos.updateKeyword(p, form.youtubeKeyword());
        // 상품 등록 시점에 한 번만 검색해 영상 목록을 만든다 (방문자 조회로는 검색하지 않음)
        videos.refreshQuietly(p);
        return toAdmin(p);
    }

    @Transactional
    public AdminProductDto update(Long id, ProductForm form) {
        Product p = find(id);
        assembler.apply(p, form);
        videos.updateKeyword(p, form.youtubeKeyword());
        products.flush();
        return toAdmin(p);
    }

    @Transactional
    public void setActive(Long id, boolean active) {
        find(id).setActive(active);
    }

    private AdminProductDto toAdmin(Product p) {
        var setting = videos.settingOf(p.getId());
        return new AdminProductDto(ProductDto.from(p), p.isActive(), p.isDemo(),
                setting == null ? null : setting.getKeyword(), videos.keywordFor(p));
    }

    private Product find(Long id) {
        return products.findById(id).orElseThrow(() -> ApiException.notFound("상품이 없습니다"));
    }
}
