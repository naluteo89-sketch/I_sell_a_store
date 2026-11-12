package com.isellastore.sourcing.service;

import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 상품 수집 규칙 (외부 호출 없는 순수 함수 → 단위 테스트 대상) */
public final class SourcingRules {

    private SourcingRules() {}

    /** 가격을 찾지 못한 상품에 임시로 붙이는 테스트 가격 (규칙 적용 안 함 → 눈에 띄게) */
    public static final long TEST_PRICE = 7_701;

    /** 설명란 금액으로 인정하는 범위 (구독자 수·연도 같은 숫자 오인 방지) */
    private static final long MIN_PRICE = 1_000;
    private static final long MAX_PRICE = 10_000_000;

    /**
     * 판매가 규칙. 원래 가격을 그대로 쓰지 않는다.
     * - 1만원 미만: 100원 단위로 올림  (4,350 → 4,400)
     * - 1만원 이상: 1,000원 단위로 올림 (23,450 → 24,000)
     * - 이미 그 단위로 딱 떨어지면 +1,000원 (4,000 → 5,000, 23,000 → 24,000)
     */
    public static long salePrice(long sourcePrice) {
        if (sourcePrice <= 0) throw new IllegalArgumentException("가격이 0원 이하입니다: " + sourcePrice);
        long unit = sourcePrice < 10_000 ? 100 : 1_000;
        if (sourcePrice % unit == 0) return sourcePrice + 1_000;
        return (sourcePrice / unit + 1) * unit;
    }

    /** 영상 ID로 만드는 썸네일 주소 (API 데이터가 아니라 보관기한과 무관) */
    public static String thumbnailUrl(String videoId) {
        return "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
    }

    // ───────── 설명란 → 가격 ─────────

    /** 129,000원 / 129000원 / ₩129,000 */
    private static final Pattern WON = Pattern.compile("(\\d{1,3}(?:,\\d{3})+|\\d+)\\s*원|₩\\s*(\\d{1,3}(?:,\\d{3})+|\\d+)");
    /** 12만9천원 / 12만 9천원 / 39.9만원 / 3만원대 */
    private static final Pattern MAN = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*만\\s*(?:(\\d)\\s*천)?\\s*원");

    /**
     * 영상 설명란에서 처음 나오는 금액. 없으면 null.
     * 예: "▶ 가격: 129,000원" → 129000, "12만9천원" → 129000
     */
    public static Long priceFrom(String description) {
        if (description == null || description.isBlank()) return null;
        record Hit(int at, long value) {}
        List<Hit> hits = new ArrayList<>();

        Matcher m = WON.matcher(description);
        while (m.find()) {
            String digits = (m.group(1) != null ? m.group(1) : m.group(2)).replace(",", "");
            if (digits.length() <= 9) hits.add(new Hit(m.start(), Long.parseLong(digits)));
        }
        Matcher k = MAN.matcher(description);
        while (k.find()) {
            long v = Math.round(Double.parseDouble(k.group(1)) * 10_000)
                    + (k.group(2) == null ? 0 : Long.parseLong(k.group(2)) * 1_000);
            hits.add(new Hit(k.start(), v));
        }
        return hits.stream()
                .filter(h -> inRange(h.value()))
                .min(Comparator.comparingInt(Hit::at))
                .map(Hit::value)
                .orElse(null);
    }

    private static boolean inRange(long v) {
        return v >= MIN_PRICE && v <= MAX_PRICE;
    }

    // ───────── 설명란 → 제품 목록 ─────────

    /** 설명란에서 찾은 제품 1개. price 가 null 이면 가격 없이 링크만 있던 제품 */
    public record Found(String name, Long price) {}

    private static final int MAX_PER_VIDEO = 10;
    private static final Pattern URL = Pattern.compile("https?://\\S+");
    private static final Pattern TIMESTAMP = Pattern.compile("\\b\\d{1,2}:\\d{2}\\b");
    /** 제품명이 아닌 줄 (안내·광고·채널 소개) */
    private static final Pattern NOT_PRODUCT = Pattern.compile(
            "(?i)할인|쿠폰|배송|구독|협찬|광고|문의|이메일|email|instagram|인스타|채널|비즈니스|business|원고료|파트너스|수수료|" +
            "정보|가격|사이즈표|키\\s*\\d|몸무게|페이스북|facebook|블로그|카페|유튜브|youtube|틱톡|tiktok|트위터|카카오|오픈채팅|" +
            "홈페이지|한\\s*번에|모아\\s*보기|바로\\s*가기|보러\\s*가기|전체\\s*보기|추천템");
    /** 문장 (후기·설명) — 제품명이 아님: "~에요", "~합니다", "ㅋㅋ" */
    private static final Pattern SENTENCE = Pattern.compile("(요|니다|[ㅋㅎ]+|다)(?=$|[\\s.!~,])");
    private static final Pattern HANGUL = Pattern.compile("[가-힣]");
    /** 가격 덩어리: [74,000원 → 44,400원, 40% 할인] / (19,900원) / 6만원대 / 29,900원 */
    private static final Pattern PRICE_PART = Pattern.compile(
            "[\\[(（][^\\])）]*(?:원|₩|%)[^\\])）]*[\\])）]|(?:₩\\s*)?\\d[\\d,.]*\\s*(?:만\\s*(?:\\d\\s*천\\s*)?)?원\\s*대?|₩\\s*\\d[\\d,]*|→|\\d+\\s*%");

    /**
     * 영상 설명란 → 소개된 제품 목록 (최대 10개).
     * - 가격이 있는 줄: 그 줄의 나머지(없으면 바로 윗줄)가 제품명, 첫 금액이 가격
     *     "3. 져지배럴레그팬츠 - 49,900원" → (져지배럴레그팬츠, 49900)
     * - 가격 없이 바로 다음 줄이 링크인 줄: 제품명만 (가격 null)
     *     "무신사 스탠다드 캐시미어 코트" 다음 줄 "https://..." → (무신사 스탠다드 캐시미어 코트, null)
     */
    public static List<Found> productsFrom(String description) {
        if (description == null || description.isBlank()) return List.of();
        List<String> lines = description.lines().map(String::strip).toList();
        Map<String, Found> out = new LinkedHashMap<>();
        for (int i = 0; i < lines.size() && out.size() < MAX_PER_VIDEO; i++) {
            String line = lines.get(i);
            if (line.isEmpty() || isUrlOnly(line)) continue;
            Long price = priceFrom(line);
            String name;
            if (price != null) {
                name = cleanName(PRICE_PART.matcher(line).replaceAll(" "));
                if (!looksLikeName(name)) name = previousName(lines, i);
            } else if (nextIsUrl(lines, i)) {
                name = cleanName(line);
            } else {
                continue;
            }
            if (!looksLikeName(name)) continue;
            // "제품명 / 링크 / 가격" 순서면 먼저 가격 없이 들어간 것을 가격으로 채운다
            Found before = out.get(name);
            if (before == null || (before.price() == null && price != null)) out.put(name, new Found(name, price));
        }
        return List.copyOf(out.values());
    }

    /** 가격만 있는 줄일 때 바로 위의 제품명 줄 (링크·가격·타임스탬프 줄은 건너뜀, 2줄까지) */
    private static String previousName(List<String> lines, int i) {
        for (int j = i - 1; j >= Math.max(0, i - 2); j--) {
            String l = lines.get(j);
            if (l.isEmpty() || isUrlOnly(l)) continue;
            if (priceFrom(l) != null) return null; // 윗줄도 가격 줄이면 다른 제품
            return cleanName(l);
        }
        return null;
    }

    private static boolean nextIsUrl(List<String> lines, int i) {
        for (int j = i + 1; j < lines.size(); j++) {
            if (lines.get(j).isEmpty()) continue;
            return isUrlOnly(lines.get(j));
        }
        return false;
    }

    private static boolean isUrlOnly(String line) {
        return URL.matcher(line).replaceAll("").replaceAll("[\\s:：▶►👉🔗-]", "").isEmpty();
    }

    /** 번호·기호·링크·이모지 제거, 앞뒤 구분자 정리 */
    private static String cleanName(String s) {
        String t = HtmlUtils.htmlUnescape(s);
        t = URL.matcher(t).replaceAll(" ");
        t = t.replaceAll("^\\s*(?:\\d{1,2}:)?\\d{1,2}:\\d{2}\\s*", "");      // 챕터 시간 "02:36 " "1:02:36 "
        t = t.replaceAll("^\\s*\\d{1,2}\\s*(?:위\\s*[.)]?|[.)])\\s*", "");  // "1. " "2) " "5위. "
        t = t.replaceAll("[^\\p{L}\\p{N}\\s()+&/.,'-]", " ");          // 이모지·장식 기호
        t = t.replaceAll("\\s+", " ").trim();
        t = t.replaceAll("^[\\s\\-–:/.,]+|[\\s\\-–:/.,]+$", "");      // 앞뒤 구분자
        return t.length() > 100 ? t.substring(0, 100).trim() : t;
    }

    private static boolean looksLikeName(String name) {
        if (name == null || name.length() < 2) return false;
        if (!name.matches(".*\\p{L}.*\\p{L}.*")) return false;   // 글자 2개 이상
        if (TIMESTAMP.matcher(name).find()) return false;          // "00:27 아우터"
        if (!HANGUL.matcher(name).find()) return false;            // "NAVY", "rem1" 같은 색상·코드 줄
        if (NOT_PRODUCT.matcher(name).find()) return false;
        if (SENTENCE.matcher(name).find()) return false;
        return name.length() <= 60 && name.split("\\s+").length <= 15;
    }
}
