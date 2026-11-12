package com.isellastore.global.config;

import org.apache.commons.logging.Log;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 이 컴퓨터의 키 파일(기본 C:/keydata, 환경변수 KEY_DIR 로 변경)에서 API 키를 읽는다.
 * 파일 형식: 한 줄에 `이름 = 값` (따옴표 있어도 되고 없어도 됨, # 주석 무시)
 *
 *   youtube.py : youtubekey  → YOUTUBE_API_KEY
 *
 * 우선순위가 가장 낮다 → 같은 이름의 환경변수가 있으면 환경변수를 쓴다.
 * 키 값은 로그에 남기지 않는다. 폴더가 없으면 아무 일도 하지 않는다 (다른 컴퓨터 등).
 */
public class LocalKeyFiles implements EnvironmentPostProcessor {

    private static final String DEFAULT_DIR = "C:/keydata";
    private static final Pattern ASSIGN = Pattern.compile("^\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.*?)\\s*$");

    private record Mapping(String file, String variable, String property) {}

    private static final List<Mapping> MAPPINGS = List.of(
            new Mapping("youtube.py", "youtubekey", "YOUTUBE_API_KEY")
    );

    private final Log log;

    public LocalKeyFiles(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(LocalKeyFiles.class);
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        String dirName = env.getProperty("KEY_DIR", DEFAULT_DIR);
        Path dir = Path.of(dirName);
        if (!Files.isDirectory(dir)) return;

        Map<String, Object> found = new HashMap<>();
        for (Mapping m : MAPPINGS) {
            String value = read(dir.resolve(m.file()), m.variable());
            if (value != null && !value.isBlank()) {
                found.put(m.property(), value);
                log.info("키 파일에서 " + m.property() + " 읽음 (" + m.file() + ")");
            }
        }
        if (!found.isEmpty()) {
            env.getPropertySources().addLast(new MapPropertySource("localKeyFiles", found));
        }
    }

    private String read(Path file, String variable) {
        if (!Files.isRegularFile(file)) return null;
        try {
            for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                String l = line.replace("\uFEFF", "");
                if (l.trim().startsWith("#")) continue;
                Matcher m = ASSIGN.matcher(l);
                if (m.matches() && m.group(1).equals(variable)) return unquote(m.group(2));
            }
        } catch (IOException e) {
            log.warn("키 파일을 읽지 못했습니다: " + file.getFileName());
        }
        return null;
    }

    private static String unquote(String v) {
        int hash = v.indexOf(" #");
        if (hash >= 0) v = v.substring(0, hash).trim();
        if (v.length() >= 2 && (v.startsWith("\"") && v.endsWith("\"") || v.startsWith("'") && v.endsWith("'"))) {
            v = v.substring(1, v.length() - 1);
        }
        return v.trim();
    }
}
