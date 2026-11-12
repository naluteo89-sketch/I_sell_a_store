package com.isellastore.youtube.dto;

import java.util.List;

/** 관리자 영상 큐레이션. null 인 항목은 바꾸지 않는다. */
public record CurationForm(List<String> pinnedVideoIds, List<String> excludedVideoIds, Boolean hidden) {
}
