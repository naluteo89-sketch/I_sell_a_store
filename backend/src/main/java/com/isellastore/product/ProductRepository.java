package com.isellastore.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByCreatedAtDesc();
    List<Product> findByActiveTrueAndCategorySlugOrderByCreatedAtDesc(String slug);
    boolean existsByName(String name);

    /** 판매 중인 상품만 */
    default Optional<Product> findActive(Long id) {
        return findById(id).filter(Product::isActive);
    }

    /** 판매 여부와 관계없이 조회, 없으면 404 (관리자용) */
    default Product getOrNotFound(Long id) {
        return findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품이 없습니다"));
    }
}
