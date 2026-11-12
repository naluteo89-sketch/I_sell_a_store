package com.isellastore.youtube.dto;

import java.time.Instant;
import java.util.List;

/** 관리자 화면용: 검색 원본 + 고정·제외 상태 + 실제 노출 목록 */
public record AdminVideoView(
        String keyword,
        Instant fetchedAt,
        List<String> pinnedVideoIds,
        List<String> excludedVideoIds,
        boolean hidden,
        List<VideoInfo> searchResults,
        List<VideoInfo> displayed,
        boolean apiKeyConfigured
) {
}
