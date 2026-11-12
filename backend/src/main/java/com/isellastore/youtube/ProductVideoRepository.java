package com.isellastore.youtube;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ProductVideoRepository extends JpaRepository<ProductVideo, Long> {

    /** 고정 영상 먼저, 그다음 검색 순위 */
    @Query("select pv from ProductVideo pv join fetch pv.video where pv.product.id = :productId " +
           "order by pv.pinned desc, pv.rankNo asc, pv.id asc")
    List<ProductVideo> findAllForProduct(@Param("productId") Long productId);

    /** 보관 기한이 지난 자동검색 결과 연결 삭제 (고정·제외 표시가 없는 것만) */
    @Modifying
    @Query("delete from ProductVideo pv where pv.source = :source " +
           "and pv.pinned = false and pv.excluded = false " +
           "and pv.video in (select v from YoutubeVideo v where v.fetchedAt < :before)")
    int deleteExpiredLinks(@Param("source") ProductVideo.Source source, @Param("before") Instant before);

    default int deleteExpiredSearchLinks(Instant before) {
        return deleteExpiredLinks(ProductVideo.Source.SEARCH, before);
    }
}
