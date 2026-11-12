package com.isellastore.site.dto;

import com.isellastore.global.config.StoreProperties;

/** 프론트가 읽는 브랜드·기능 구성 (API 키 등 비밀값 제외) */
public record SiteInfo(StoreProperties.Brand brand, StoreProperties.Features features) {
}
