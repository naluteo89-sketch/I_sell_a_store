package com.isellastore.catalog;

import com.isellastore.global.market.Market;
import com.isellastore.product.domain.Product;
import com.isellastore.product.dto.ProductDto;
import com.isellastore.product.repository.ProductRepository;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/** SQL 로 고른 상품 id 들을 그 순서 그대로 기존 ProductDto 로 바꾼다 (옵션·조합은 batch fetch 로 묶어서 조회) */
@Component
class ProductLoader {

    private final ProductRepository products;

    ProductLoader(ProductRepository products) {
        this.products = products;
    }

    /** 호출하는 쪽에서 @Transactional(readOnly = true) 로 감싸야 지연 로딩이 된다 */
    Map<Long, ProductDto> load(Collection<Long> ids, Market market) {
        if (ids.isEmpty()) return Map.of();
        Map<Long, Product> byId = products.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        Map<Long, ProductDto> out = new LinkedHashMap<>();
        for (Long id : ids) {
            Product p = byId.get(id);
            if (p != null) out.put(id, ProductDto.from(p, market));
        }
        return out;
    }
}
