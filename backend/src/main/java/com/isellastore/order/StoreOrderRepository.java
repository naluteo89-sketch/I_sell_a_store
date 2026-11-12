package com.isellastore.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreOrderRepository extends JpaRepository<StoreOrder, Long> {
    Optional<StoreOrder> findByOrderNo(String orderNo);
}
