package com.isellastore.youtube.repository;

import com.isellastore.youtube.domain.YoutubeVideo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface YoutubeVideoRepository extends JpaRepository<YoutubeVideo, String> {

    List<YoutubeVideo> findByFetchedAtBefore(Instant before);

    /** 어떤 상품에도 연결되지 않은 영상 정리 */
    @Modifying
    @Query("delete from YoutubeVideo v where not exists (select 1 from ProductVideo pv where pv.video = v)")
    int deleteOrphans();
}
