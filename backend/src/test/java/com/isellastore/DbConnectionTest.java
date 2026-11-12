package com.isellastore;

import com.isellastore.admin.domain.AdminUser;
import com.isellastore.admin.repository.AdminUserRepository;
import com.isellastore.order.domain.OrderItem;
import com.isellastore.order.domain.OrderShipping;
import com.isellastore.order.domain.Payment;
import com.isellastore.order.domain.StoreOrder;
import com.isellastore.order.repository.StoreOrderRepository;
import com.isellastore.product.domain.Product;
import com.isellastore.product.domain.ProductOption;
import com.isellastore.product.domain.ProductVariant;
import com.isellastore.product.dto.ProductForm;
import com.isellastore.product.repository.CategoryRepository;
import com.isellastore.product.repository.ProductRepository;
import com.isellastore.product.repository.ProductVariantRepository;
import com.isellastore.product.service.ProductAssembler;
import com.isellastore.youtube.dto.VideoInfo;
import com.isellastore.youtube.service.ProductVideoService;

import com.isellastore.order.*;
import com.isellastore.product.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DB 연결 + 정규화 모델·테이블 일치 테스트 (schema.sql v2 기준).
 *
 * - ddl-auto=validate : 엔티티와 my_db 테이블 구조가 다르면 테스트가 시작조차 안 되고 어디가 다른지 알려준다.
 * - @Transactional    : 테스트에서 저장한 데이터는 끝나면 모두 되돌린다 (DB에 흔적 안 남음).
 *
 * 실행: STS에서 이 파일 우클릭 → Run As → JUnit Test
 */
@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=validate")
@Transactional
class DbConnectionTest {

    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager em;
    @Autowired CategoryRepository categories;
    @Autowired ProductRepository products;
    @Autowired ProductVariantRepository variants;
    @Autowired ProductAssembler assembler;
    @Autowired ProductVideoService videoService;
    @Autowired StoreOrderRepository orders;
    @Autowired AdminUserRepository admins;

    /** 색상 2 × 사이즈 2 = 조합 4개짜리 상품 폼 */
    private ProductForm sweatshirtForm(List<ProductForm.OptionForm> options, List<ProductForm.VariantForm> variantForms) {
        return new ProductForm("테스트 맨투맨", "설명", 39_000, 0, null, "fashion", null,
                List.of(new ProductForm.AttributeForm("소재", "면 100%")),
                options, variantForms);
    }

    private static ProductForm.VariantForm variant(String color, String size, long extra, int stock) {
        return new ProductForm.VariantForm(Map.of("색상", color, "사이즈", size), extra, stock, null, null);
    }

    private Product saveSweatshirt() {
        var form = sweatshirtForm(
                List.of(new ProductForm.OptionForm("색상", List.of("블랙", "화이트")),
                        new ProductForm.OptionForm("사이즈", List.of("M", "L"))),
                List.of(variant("블랙", "M", 0, 10), variant("블랙", "L", 2_000, 5),
                        variant("화이트", "M", 0, 3), variant("화이트", "L", 2_000, 0)));
        Product p = products.saveAndFlush(assembler.create(form));
        em.clear(); // 캐시 말고 DB에서 다시 읽기
        return products.findById(p.getId()).orElseThrow();
    }

    @Test
    void 연결된_DB가_my_db_이다() {
        assertEquals("my_db", jdbc.queryForObject("SELECT DATABASE()", String.class));
    }

    @Test
    void 기본_카테고리_4개가_있다() {
        assertTrue(categories.count() >= 4);
        assertTrue(categories.findBySlug("fashion").isPresent());
    }

    @Test
    void 상품을_사양_옵션_조합과_함께_저장하고_읽는다() {
        Product p = saveSweatshirt();

        assertEquals(1, p.getAttributes().size());
        assertEquals("면 100%", p.getAttributes().get(0).getValue());
        assertEquals(List.of("색상", "사이즈"), p.getOptions().stream().map(ProductOption::getName).toList());
        assertEquals(4, p.getVariants().size());
        assertEquals(18, p.totalStock()); // 10 + 5 + 3 + 0

        ProductVariant blackL = p.getVariants().stream()
                .filter(v -> v.label().equals("블랙 / L")).findFirst().orElseThrow();
        assertEquals(41_000, blackL.unitPrice()); // 기본가 39,000 + 추가금 2,000
    }

    @Test
    void 상품을_수정해도_남은_조합의_ID가_유지된다() {
        Product p = saveSweatshirt();
        Long blackMId = p.getVariants().stream().filter(v -> v.label().equals("블랙 / M")).findFirst().orElseThrow().getId();

        // 사이즈 L 삭제, 블랙 M 재고 10 → 7
        assembler.apply(p, sweatshirtForm(
                List.of(new ProductForm.OptionForm("색상", List.of("블랙", "화이트")),
                        new ProductForm.OptionForm("사이즈", List.of("M"))),
                List.of(variant("블랙", "M", 0, 7), variant("화이트", "M", 0, 3))));
        products.saveAndFlush(p);
        em.clear();

        Product reloaded = products.findById(p.getId()).orElseThrow();
        assertEquals(2, reloaded.getVariants().size());
        ProductVariant blackM = reloaded.getVariants().stream()
                .filter(v -> v.label().equals("블랙 / M")).findFirst().orElseThrow();
        assertEquals(blackMId, blackM.getId(), "과거 주문이 끊기지 않도록 같은 조합은 ID 유지");
        assertEquals(7, blackM.getStock());
    }

    @Test
    void 재고는_원자적으로_차감되고_모자라면_차감되지_않는다() {
        Product p = saveSweatshirt();
        Long whiteM = p.getVariants().stream().filter(v -> v.label().equals("화이트 / M")).findFirst().orElseThrow().getId();

        assertEquals(0, variants.decreaseStock(whiteM, 5)); // 재고 3개인데 5개 → 실패
        assertEquals(1, variants.decreaseStock(whiteM, 3)); // 3개 → 성공
        em.clear();
        assertEquals(0, variants.findById(whiteM).orElseThrow().getStock());
    }

    @Test
    void 유튜브_영상을_저장하고_고정_제외가_반영된다() {
        Product p = saveSweatshirt();
        videoService.store(p, List.of(
                new VideoInfo("aaaaaaaaaaa", "영상 A", "채널", null, 300),
                new VideoInfo("bbbbbbbbbbb", "영상 B", "채널", null, 200),
                new VideoInfo("ccccccccccc", "영상 C", "채널", null, 100)));

        videoService.curate(p.getId(), List.of("ccccccccccc"), List.of("bbbbbbbbbbb"), null);
        em.flush();
        em.clear();

        List<String> shown = videoService.videosFor(p.getId()).stream().map(VideoInfo::videoId).toList();
        assertEquals(List.of("ccccccccccc", "aaaaaaaaaaa"), shown, "고정 C가 맨 앞, 제외 B는 빠짐");
    }

    @Test
    void 주문_배송지_결제를_함께_저장한다() {
        Product p = saveSweatshirt();
        ProductVariant blackL = p.getVariants().stream()
                .filter(v -> v.label().equals("블랙 / L")).findFirst().orElseThrow();

        StoreOrder order = new StoreOrder(List.of(new OrderItem(p, blackL, 2)));
        order.setShipping(new OrderShipping("홍길동", "010-1234-5678", "06000", "서울시 강남구", "101호", null));
        order.startPayment("CARD").succeed("MOCK-TEST");
        order.markPaid();
        orders.saveAndFlush(order);
        em.clear();

        StoreOrder loaded = orders.findByOrderNo(order.getOrderNo()).orElseThrow();
        assertEquals(82_000, loaded.getTotalAmount()); // 41,000 × 2
        assertEquals("블랙 / L", loaded.getItems().get(0).getOptionLabel());
        assertTrue(loaded.getShipping().phoneMatches("01012345678"));
        assertFalse(loaded.getShipping().phoneMatches("01099999999"));
        assertEquals(Payment.Status.PAID, loaded.getPayments().get(0).getStatus());
        assertTrue(loaded.getOrderNo().matches("ORD-\\d{8}-[A-Z2-9]{10}"));
    }

    @Test
    void 관리자_계정을_저장한다() {
        admins.saveAndFlush(new AdminUser("test-admin", "$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdu"));
        assertTrue(admins.findByUsername("test-admin").isPresent());
    }
}
