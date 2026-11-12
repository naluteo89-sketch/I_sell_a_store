package com.isellastore.order.repository;

import com.isellastore.order.domain.StoreOrder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreOrderRepository extends JpaRepository<StoreOrder, Long> {
    Optional<StoreOrder> findByOrderNo(String orderNo);
}
