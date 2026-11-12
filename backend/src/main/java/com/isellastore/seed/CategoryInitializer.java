package com.isellastore.seed;

import com.isellastore.product.Category;
import com.isellastore.product.CategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** 서버 시작 시 후보 파일의 카테고리가 없으면 만들어 둔다. 상품은 만들지 않는다. */
@Component
public class CategoryInitializer implements ApplicationRunner {

    private final DemoCandidates candidates;
    private final CategoryRepository categories;

    public CategoryInitializer(DemoCandidates candidates, CategoryRepository categories) {
        this.candidates = candidates;
        this.categories = categories;
    }

    @Override
    public void run(ApplicationArguments args) {
        int order = 0;
        for (var c : candidates.load()) {
            int sort = order++;
            if (categories.findBySlug(c.slug()).isEmpty()) {
                categories.save(new Category(c.slug(), c.name(), sort));
            }
        }
    }
}
