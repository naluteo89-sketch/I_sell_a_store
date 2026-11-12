package com.isellastore.sourcing.repository;

import com.isellastore.sourcing.domain.SourcedProduct;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SourcedProductRepository extends JpaRepository<SourcedProduct, Long> {

    boolean existsByVideoId(String videoId);

    /** 프론트용: 판매 중인 상품만, 최신순 */
    @EntityGraph(attributePaths = {"product", "product.category"})
    List<SourcedProduct> findByProductActiveTrueOrderByCreatedAtDesc();

    /** 관리자용: 전체, 최신순 */
    @EntityGraph(attributePaths = {"product", "product.category"})
    List<SourcedProduct> findAllByOrderByCreatedAtDesc();
}
