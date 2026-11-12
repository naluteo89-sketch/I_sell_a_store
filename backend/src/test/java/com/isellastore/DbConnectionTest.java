package com.isellastore;

import com.isellastore.order.OrderItem;
import com.isellastore.order.StoreOrder;
import com.isellastore.order.StoreOrderRepository;
import com.isellastore.product.CategoryRepository;
import com.isellastore.product.Product;
import com.isellastore.product.ProductRepository;
import com.isellastore.youtube.ProductVideoCache;
import com.isellastore.youtube.ProductVideoCacheRepository;
import com.isellastore.youtube.VideoInfo;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DB 연결 + 모델·테이블 일치 테스트.
 *
 * - ddl-auto=validate : 엔티티와 my_db 테이블 구조가 다르면 테스트가 시작조차 안 되고 어디가 다른지 알려준다.
 * - @Transactional    : 테스트에서 저장한 데이터는 끝나면 모두 되돌린다 (DB에 흔적 안 남음).
 *
 * 실행: STS에서 이 파일 우클릭 → Run As → JUnit Test
 *       또는 backend 폴더에서 mvn test -Dtest=DbConnectionTest
 */
@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=validate")
@Transactional
class DbConnectionTest {

    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager em;
    @Autowired CategoryRepository categories;
    @Autowired ProductRepository products;
    @Autowired ProductVideoCacheRepository videoCaches;
    @Autowired StoreOrderRepository orders;

    @Test
    void 연결된_DB가_my_db_이다() {
        assertEquals("my_db", jdbc.queryForObject("SELECT DATABASE()", String.class));
    }

    @Test
    void 기본_카테고리_4개가_있다() {
        assertTrue(categories.count() >= 4);
        assertTrue(categories.findBySlug("fashion").isPresent());
        assertTrue(categories.findBySlug("digital").isPresent());
    }

    @Test
    void 상품을_JSON_속성과_함께_저장하고_읽는다() {
        var fashion = categories.findBySlug("fashion").orElseThrow();
        Product p = new Product("연결 테스트 상품", "테스트", 12_000, 5, fashion);
        p.getMetadata().put("색상", "블랙");
        p.getMetadata().put("사이즈", List.of("S", "M", "L"));
        products.saveAndFlush(p);
        em.clear(); // 캐시 말고 DB에서 다시 읽기

        Product loaded = products.findById(p.getId()).orElseThrow();
        assertEquals("연결 테스트 상품", loaded.getName());
        assertEquals("블랙", loaded.getMetadata().get("색상"));
        assertEquals("fashion", loaded.getCategory().getSlug());
    }

    @Test
    void 유튜브_영상_캐시를_저장하고_읽는다() {
        var fashion = categories.findBySlug("fashion").orElseThrow();
        Product p = products.saveAndFlush(new Product("영상 테스트 상품", null, 1_000, 1, fashion));

        ProductVideoCache cache = new ProductVideoCache(p.getId());
        cache.updateSearchResult("영상 테스트 리뷰",
                List.of(new VideoInfo("dQw4w9WgXcQ", "테스트 영상", "테스트 채널", null, 123L)));
        cache.setPinnedVideoIds(List.of("dQw4w9WgXcQ"));
        videoCaches.saveAndFlush(cache);
        em.clear();

        ProductVideoCache loaded = videoCaches.findById(p.getId()).orElseThrow();
        assertEquals(1, loaded.getVideos().size());
        assertEquals("테스트 영상", loaded.getVideos().get(0).title());
        assertEquals(List.of("dQw4w9WgXcQ"), loaded.getPinnedVideoIds());
    }

    @Test
    void 주문과_주문상품을_함께_저장한다() {
        StoreOrder order = new StoreOrder("홍길동", "010-0000-0000", "서울",
                List.of(new OrderItem(1L, "테스트 상품", 10_000, 2)));
        orders.saveAndFlush(order);
        em.clear();

        StoreOrder loaded = orders.findByOrderNo(order.getOrderNo()).orElseThrow();
        assertEquals(20_000, loaded.getTotalAmount());
        assertEquals(1, loaded.getItems().size());
        assertEquals("PENDING", loaded.getStatus().name());
    }
}
