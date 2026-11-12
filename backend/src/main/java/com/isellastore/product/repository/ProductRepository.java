package com.isellastore.product.repository;

import com.isellastore.product.domain.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrueOrderByCreatedAtDesc();

    List<Product> findByActiveTrueAndCategorySlugOrderByCreatedAtDesc(String slug);

    List<Product> findByDemoTrue();

    boolean existsByName(String name);

    /**
     * 옵션 없는 상품 재고를 원자적으로 차감. 재고가 모자라면 0을 반환한다.
     * (동시에 여러 명이 결제해도 재고가 음수가 되지 않음)
     */
    @Modifying
    @Query("update Product p set p.stock = p.stock - :qty where p.id = :id and p.stock >= :qty")
    int decreaseStock(@Param("id") Long id, @Param("qty") int qty);
}
