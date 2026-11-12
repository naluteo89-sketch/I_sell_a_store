package com.isellastore.youtube;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ProductVideoCacheRepository extends JpaRepository<ProductVideoCache, Long> {

    /** 갱신 대상: 오래된 순 */
    List<ProductVideoCache> findByFetchedAtBeforeOrderByFetchedAtAsc(Instant before);

    /** 상품은 있는데 아직 검색한 적 없는 캐시 */
    List<ProductVideoCache> findByFetchedAtIsNull();
}
