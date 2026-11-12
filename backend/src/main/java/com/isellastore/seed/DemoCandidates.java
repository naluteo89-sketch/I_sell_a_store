package com.isellastore.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;

/** resources/demo/candidates.json 읽기 */
@Component
public class DemoCandidates {

    public record Candidate(String name, long price, String description) {}

    public record CategoryCandidates(String slug, String name, List<Candidate> candidates) {}

    public record File(List<CategoryCandidates> categories) {}

    private final ObjectMapper mapper;

    public DemoCandidates(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public List<CategoryCandidates> load() {
        try (InputStream in = new ClassPathResource("demo/candidates.json").getInputStream()) {
            return mapper.readerFor(File.class)
                    .without(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                    .<File>readValue(in)
                    .categories();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
