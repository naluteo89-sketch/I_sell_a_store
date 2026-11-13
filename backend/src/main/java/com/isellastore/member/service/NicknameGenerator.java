package com.isellastore.member.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.List;
import java.util.function.Predicate;

/**
 * 가입 때 쓰는 자동 닉네임: 형용사 + 동물 + 숫자 4자리 (예: 포근한고래4821, CalmWhale4821).
 * 조합 수 20 × 20 × 9000 = 360만 개라 겹칠 일이 드물고, 겹치면 다시 뽑는다. DB 에도 UNIQUE 가 걸려 있다.
 */
@Component
public class NicknameGenerator {

    private static final List<String> KO_ADJ = List.of(
            "포근한", "상냥한", "느긋한", "반짝이는", "용감한", "다정한", "산뜻한", "명랑한", "차분한", "씩씩한",
            "말랑한", "따뜻한", "부지런한", "엉뚱한", "싱그러운", "행복한", "새침한", "듬직한", "재빠른", "졸린");
    private static final List<String> KO_NOUN = List.of(
            "고래", "수달", "판다", "여우", "토끼", "펭귄", "다람쥐", "고양이", "강아지", "부엉이",
            "햄스터", "코알라", "돌고래", "사슴", "미어캣", "알파카", "해달", "참새", "거북이", "너구리");
    private static final List<String> EN_ADJ = List.of(
            "Calm", "Kind", "Brave", "Sunny", "Gentle", "Lucky", "Merry", "Quiet", "Swift", "Cozy",
            "Bright", "Happy", "Jolly", "Mellow", "Witty", "Breezy", "Bold", "Fuzzy", "Nimble", "Sleepy");
    private static final List<String> EN_NOUN = List.of(
            "Whale", "Otter", "Panda", "Fox", "Bunny", "Penguin", "Squirrel", "Cat", "Puppy", "Owl",
            "Hamster", "Koala", "Dolphin", "Deer", "Meerkat", "Alpaca", "Seal", "Sparrow", "Turtle", "Raccoon");

    private static final int MAX_TRIES = 20;
    private final SecureRandom random = new SecureRandom();

    /** @param taken 이미 쓰인 닉네임인지 확인하는 함수 (repository::existsByNickname) */
    public String generate(String lang, Predicate<String> taken) {
        boolean en = "en".equals(lang);
        for (int i = 0; i < MAX_TRIES; i++) {
            String candidate = pick(en ? EN_ADJ : KO_ADJ) + pick(en ? EN_NOUN : KO_NOUN) + (1000 + random.nextInt(9000));
            if (!taken.test(candidate)) return candidate;
        }
        throw new IllegalStateException("닉네임 생성 실패");
    }

    private String pick(List<String> words) {
        return words.get(random.nextInt(words.size()));
    }
}
