package com.isellastore.catalog;

import java.util.List;

/** 한 페이지 결과 + 전체 개수 (전체 개수는 X-Total-Count 헤더로 내려간다) */
public record CatalogPage<T>(List<T> items, long total, int page, int size) {}
