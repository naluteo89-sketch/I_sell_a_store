package com.isellastore.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /** 조합 재고를 원자적으로 차감. 재고가 모자라면 0을 반환한다. */
    @Modifying
    @Query("update ProductVariant v set v.stock = v.stock - :qty where v.id = :id and v.active = true and v.stock >= :qty")
    int decreaseStock(@Param("id") Long id, @Param("qty") int qty);
}
