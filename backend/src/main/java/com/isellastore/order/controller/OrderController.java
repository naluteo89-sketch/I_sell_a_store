package com.isellastore.order.controller;

import com.isellastore.order.dto.OrderDto;
import com.isellastore.order.dto.OrderForm;
import com.isellastore.order.dto.PayForm;
import com.isellastore.order.service.OrderService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** 주문 API (요청 → 서비스 호출 → 응답만 담당) */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto create(@Valid @RequestBody OrderForm form) {
        return service.create(form);
    }

    @PostMapping("/{orderNo}/pay")
    public OrderDto pay(@PathVariable String orderNo, @Valid @RequestBody PayForm form) {
        return service.pay(orderNo, form.method());
    }

    @GetMapping("/{orderNo}")
    public OrderDto get(@PathVariable String orderNo, @RequestParam String phone) {
        return service.get(orderNo, phone);
    }
}
