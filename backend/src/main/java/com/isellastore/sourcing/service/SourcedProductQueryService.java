package com.isellastore.sourcing.service;

import com.isellastore.global.market.Market;
import com.isellastore.sourcing.dto.AdminSourcedItemDto;
import com.isellastore.sourcing.dto.SourcedItemDto;
import com.isellastore.sourcing.repository.SourcedProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 수집한 상품 목록 조회 (DB만 읽음, 외부 API 호출 없음) */
@Service
@Transactional(readOnly = true)
public class SourcedProductQueryService {

    private final SourcedProductRepository sourced;

    public SourcedProductQueryService(SourcedProductRepository sourced) {
        this.sourced = sourced;
    }

    public List<SourcedItemDto> forStore(Market market) {
        return sourced.findByProductActiveTrueOrderByCreatedAtDesc().stream()
                .filter(s -> s.getProduct().soldIn(market))
                .map(s -> SourcedItemDto.from(s, market))
                .toList();
    }

    public List<AdminSourcedItemDto> forAdmin() {
        return sourced.findAllByOrderByCreatedAtDesc().stream().map(AdminSourcedItemDto::from).toList();
    }
}
