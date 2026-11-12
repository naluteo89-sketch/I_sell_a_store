package com.isellastore.product.controller;

import com.isellastore.product.dto.AdminProductDto;
import com.isellastore.product.dto.ProductForm;
import com.isellastore.product.service.ProductAdminService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 상품 API.
 * TODO(보안 작업): 관리자 로그인(Spring Security) 붙이기 전까지는 운영 서버에 공개하지 말 것.
 */
@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final ProductAdminService service;

    public ProductAdminController(ProductAdminService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminProductDto> all() {
        return service.all();
    }

    @GetMapping("/{id}")
    public AdminProductDto one(@PathVariable Long id) {
        return service.one(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductDto create(@Valid @RequestBody ProductForm form) {
        return service.create(form);
    }

    @PutMapping("/{id}")
    public AdminProductDto update(@PathVariable Long id, @Valid @RequestBody ProductForm form) {
        return service.update(id, form);
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable Long id) {
        service.setActive(id, false);
    }

    @PostMapping("/{id}/activate")
    public void activate(@PathVariable Long id) {
        service.setActive(id, true);
    }
}
