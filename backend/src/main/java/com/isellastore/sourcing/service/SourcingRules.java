package com.isellastore.sourcing.service;

import com.isellastore.global.market.Market;

import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 상품 수집 규칙 (외부 호출 없는 순수 함수 → 단위 테스트 대상).
 * 한국 유튜버(KR)는 원화·한국어, 영미권 유튜버(US)는 달러·영어 설명란을 읽는다.
 */
public final class SourcingRules {

    private SourcingRules() {}

    /** 가격을 찾지 못한 상품에 임시로 붙이는 테스트 가격 (규칙 적용 안 함 → 눈에 띄게) */
    public static final long TEST_PRICE = 7_701;

    /**
     * 판매가 규칙 (원화). 원래 가격을 그대로 쓰지 않는다.
     * - 1만원 미만: 100원 단위로 올림  (4,350 → 4,400)
     * - 1만원 이상: 1,000원 단위로 올림 (23,450 → 24,000)
     * - 이미 그 단위로 딱 떨어지면 +1,000원 (4,000 → 5,000, 23,000 → 24,000)
     */
    public static long salePrice(long sourcePriceKrw) {
        if (sourcePriceKrw <= 0) throw new IllegalArgumentException("가격이 0원 이하입니다: " + sourcePriceKrw);
        long unit = sourcePriceKrw < 10_000 ? 100 : 1_000;
        if (sourcePriceKrw % unit == 0) return sourcePriceKrw + 1_000;
        return (sourcePriceKrw / unit + 1) * unit;
    }

    /** 설명란 금액(KR=원, US=센트) → 원화. 달러는 환율로 바꾼다 */
    public static long toKrw(Market market, long sourceAmount, long usdKrwRate) {
        return market == Market.US ? Math.round(sourceAmount * usdKrwRate / 100.0) : sourceAmount;
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
    /** $29.99 / US$ 1,299 / 49.99 USD / 20 dollars */
    private static final Pattern USD = Pattern.compile(
            "(?:US)?\\$\\s*(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.(\\d{1,2}))?" +
            "|(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.(\\d{1,2}))?\\s*(?:USD|usd|dollars?)\\b");

    /** 한국어 설명란 기본 */
    public static Long priceFrom(String description) {
        return priceFrom(description, Market.KR);
    }

    /**
     * 설명란에서 처음 나오는 금액. 없으면 null. 단위: KR = 원, US = 센트
     * 예: "가격: 129,000원" → 129000 (KR), "Sony WH-1000XM5 ($348)" → 34800 (US)
     */
    public static Long priceFrom(String description, Market market) {
        if (description == null || description.isBlank()) return null;
        record Hit(int at, long value) {}
        List<Hit> hits = new ArrayList<>();
        if (market == Market.US) {
            Matcher m = USD.matcher(description);
            while (m.find()) {
                boolean prefix = m.group(1) != null;
                String whole = (prefix ? m.group(1) : m.group(3)).replace(",", "");
                String cents = prefix ? m.group(2) : m.group(4);
                if (whole.length() > 7) continue;
                long c = Long.parseLong(whole) * 100 + (cents == null ? 0 : Long.parseLong((cents + "0").substring(0, 2)));
                hits.add(new Hit(m.start(), c));
            }
        } else {
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
        }
        return hits.stream()
                .filter(h -> inRange(h.value(), market))
                .min(Comparator.comparingInt(Hit::at))
                .map(Hit::value)
                .orElse(null);
    }

    /** 구독자 수·연도 같은 숫자 오인 방지: KR 1천원~1천만원, US $1~$10,000 */
    private static boolean inRange(long v, Market market) {
        return market == Market.US ? v >= 100 && v <= 1_000_000 : v >= 1_000 && v <= 10_000_000;
    }

    // ───────── 설명란 → 제품 목록 ─────────

    /** 설명란에서 찾은 제품 1개. price: 설명란 금액(KR=원, US=센트), null 이면 가격 없이 링크만 있던 제품 */
    public record Found(String name, Long price) {}

    private static final int MAX_PER_VIDEO = 10;
    private static final Pattern URL = Pattern.compile("https?://\\S+");
    private static final Pattern TIMESTAMP = Pattern.compile("\\b\\d{1,2}:\\d{2}\\b");

    /** 쇼핑몰 이름·"링크"만 있는 줄 ("Amazon: https://…", "무신사 https://…") */
    private static final Pattern STORE_ONLY = Pattern.compile(
            "(?i)^(?:my\\s+)?(?:amazon|walmart|target|ebay|best\\s*buy|etsy|sephora|ulta|nordstrom|shop|store|website|merch|" +
            "link|links|here|shop\\s+here|buy\\s+here|무신사|쿠팡|29cm|지그재그|에이블리|네이버|스마트스토어|구매\\s*링크|링크)" +
            "(?:\\s+(?:link|links|store|storefront|page|shop|here))?$");

    // 한국어 (KR)
    /** 제품명이 아닌 줄 (안내·광고·채널 소개) */
    private static final Pattern NOT_PRODUCT_KO = Pattern.compile(
            "(?i)할인|쿠폰|배송|구독|협찬|광고|문의|이메일|email|instagram|인스타|채널|비즈니스|business|원고료|파트너스|수수료|" +
            "정보|가격|사이즈표|키\\s*\\d|몸무게|페이스북|facebook|블로그|카페|유튜브|youtube|틱톡|tiktok|트위터|카카오|오픈채팅|" +
            "홈페이지|한\\s*번에|모아\\s*보기|바로\\s*가기|보러\\s*가기|전체\\s*보기|추천템");
    /** 문장 (후기·설명) — 제품명이 아님: "~에요", "~합니다", "ㅋㅋ" */
    private static final Pattern SENTENCE_KO = Pattern.compile("(요|니다|[ㅋㅎ]+|다)(?=$|[\\s.!~,])");
    private static final Pattern HANGUL = Pattern.compile("[가-힣]");
    /** 가격 덩어리: [74,000원 → 44,400원, 40% 할인] / (19,900원) / 6만원대 / 29,900원 */
    private static final Pattern PRICE_PART_KO = Pattern.compile(
            "[\\[(（][^\\])）]*(?:원|₩|%)[^\\])）]*[\\])）]|(?:₩\\s*)?\\d[\\d,.]*\\s*(?:만\\s*(?:\\d\\s*천\\s*)?)?원\\s*대?|₩\\s*\\d[\\d,]*|→|\\d+\\s*%");

    // 영어 (US)
    private static final Pattern NOT_PRODUCT_EN = Pattern.compile(
            "(?i)\\b(?:discount|coupon|promo|code|shipping|subscribe|sponsor(?:ed)?|affiliate|commission|instagram|tiktok|" +
            "twitter|facebook|patreon|e-?mail|business|inquir\\w*|contact|newsletter|podcast|disclaimer|social|follow|" +
            "chapters?|timestamps?|price|sale|deal|giveaway|channel|playlist)\\b");
    /** 문장·안내 — "I love this", "Use my code", "Check out" */
    private static final Pattern SENTENCE_EN = Pattern.compile(
            "(?i)\\b(?:i|i'm|i've|you|your|we|our|my|this video|check out|click|let me know|thank(?:s| you))\\b|[!?]$");
    private static final Pattern LATIN = Pattern.compile("[A-Za-z].*[A-Za-z]");
    /** 가격 덩어리: ($348) / [was $59.99, now $39.99] / $29.99 / 20% off */
    private static final Pattern PRICE_PART_EN = Pattern.compile(
            "[\\[(][^\\])]*(?:\\$|%|USD)[^\\])]*[\\])]|(?:US)?\\$\\s*\\d[\\d,]*(?:\\.\\d{1,2})?|" +
            "\\d[\\d,]*(?:\\.\\d{1,2})?\\s*(?:USD|dollars?)\\b|→|->|\\d+\\s*%\\s*(?:off)?");

    /** 한국어 설명란 기본 */
    public static List<Found> productsFrom(String description) {
        return productsFrom(description, Market.KR);
    }

    /**
     * 영상 설명란 → 소개된 제품 목록 (최대 10개).
     * - 가격이 있는 줄: 그 줄의 나머지(없으면 바로 윗줄)가 제품명, 첫 금액이 가격
     *     "3. 져지배럴레그팬츠 - 49,900원" → (져지배럴레그팬츠, 49900)
     *     "Sony WH-1000XM5 ($348): https://amzn.to/x" → (Sony WH-1000XM5, 34800)
     * - 가격 없이 같은 줄에 링크: 링크 앞부분이 제품명 (가격 null)
     *     "Dyson Airwrap Complete: https://amzn.to/y" → (Dyson Airwrap Complete, null)
     * - 가격 없이 바로 다음 줄이 링크인 줄: 제품명만 (가격 null)
     *     "무신사 스탠다드 캐시미어 코트" 다음 줄 "https://..." → (무신사 스탠다드 캐시미어 코트, null)
     */
    public static List<Found> productsFrom(String description, Market market) {
        if (description == null || description.isBlank()) return List.of();
        Pattern pricePart = market == Market.US ? PRICE_PART_EN : PRICE_PART_KO;
        List<String> lines = description.lines().map(String::strip).toList();
        Map<String, Found> out = new LinkedHashMap<>();
        for (int i = 0; i < lines.size() && out.size() < MAX_PER_VIDEO; i++) {
            String line = lines.get(i);
            if (line.isEmpty() || isUrlOnly(line)) continue;
            Long price = priceFrom(line, market);
            String name;
            if (price != null) {
                name = cleanName(pricePart.matcher(line).replaceAll(" "));
                if (!looksLikeName(name, market)) name = previousName(lines, i, market);
            } else if (URL.matcher(line).find()) {
                name = cleanName(line.substring(0, firstUrlAt(line)));
            } else if (nextIsUrl(lines, i)) {
                name = cleanName(line);
            } else {
                continue;
            }
            if (!looksLikeName(name, market)) continue;
            // "제품명 / 링크 / 가격" 순서면 먼저 가격 없이 들어간 것을 가격으로 채운다
            Found before = out.get(name);
            if (before == null || (before.price() == null && price != null)) out.put(name, new Found(name, price));
        }
        return List.copyOf(out.values());
    }

    private static int firstUrlAt(String line) {
        Matcher m = URL.matcher(line);
        return m.find() ? m.start() : line.length();
    }

    /** 가격만 있는 줄일 때 바로 위의 제품명 줄 (링크·가격 줄은 건너뜀, 2줄까지) */
    private static String previousName(List<String> lines, int i, Market market) {
        for (int j = i - 1; j >= Math.max(0, i - 2); j--) {
            String l = lines.get(j);
            if (l.isEmpty() || isUrlOnly(l)) continue;
            if (priceFrom(l, market) != null) return null; // 윗줄도 가격 줄이면 다른 제품
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
        t = t.replaceAll("^\\s*#?\\d{1,2}\\s*(?:위\\s*[.)]?|[.)])\\s*", ""); // "1. " "2) " "5위. " "#1."
        t = t.replaceAll("[^\\p{L}\\p{N}\\s()+&/.,'-]", " ");          // 이모지·장식 기호
        t = t.replaceAll("\\s+", " ").trim();
        t = t.replaceAll("^[\\s\\-–:/.,]+|[\\s\\-–:/.,]+$", "");      // 앞뒤 구분자
        return t.length() > 100 ? t.substring(0, 100).trim() : t;
    }

    private static boolean looksLikeName(String name, Market market) {
        if (name == null || name.length() < 2) return false;
        if (!name.matches(".*\\p{L}.*\\p{L}.*")) return false;   // 글자 2개 이상
        if (TIMESTAMP.matcher(name).find()) return false;          // "00:27 아우터"
        if (STORE_ONLY.matcher(name).matches()) return false;      // "Amazon", "무신사 링크"
        if (market == Market.US) {
            if (!LATIN.matcher(name).find()) return false;
            String[] words = name.split("\\s+");
            if (words.length < 2) return false;                   // "Stanley", "rem1" 같은 한 단어
            if (name.equals(name.toUpperCase()) && words.length <= 2) return false; // "NAVY BLUE" 색상 줄
            if (NOT_PRODUCT_EN.matcher(name).find()) return false;
            if (SENTENCE_EN.matcher(name).find()) return false;
            return name.length() <= 80 && words.length <= 12;
        }
        if (!HANGUL.matcher(name).find()) return false;            // "NAVY", "rem1" 같은 색상·코드 줄
        if (NOT_PRODUCT_KO.matcher(name).find()) return false;
        if (SENTENCE_KO.matcher(name).find()) return false;
        return name.length() <= 60 && name.split("\\s+").length <= 15;
    }
}
