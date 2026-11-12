package com.isellastore.product.service;

import com.isellastore.global.error.ApiException;
import com.isellastore.product.domain.Category;
import com.isellastore.product.domain.Product;
import com.isellastore.product.domain.ProductAttribute;
import com.isellastore.product.domain.ProductOption;
import com.isellastore.product.domain.ProductOptionValue;
import com.isellastore.product.domain.ProductVariant;
import com.isellastore.product.dto.ProductForm;
import com.isellastore.product.repository.CategoryRepository;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 관리자 폼 → 상품 엔티티 반영.
 * 옵션·선택지·조합은 이름(조합은 "옵션=값" 묶음)으로 기존 행과 맞춰 갱신한다.
 * → 수정할 때마다 ID가 바뀌지 않아서, 과거 주문(order_item.variant_id)이 끊기지 않는다.
 */
@Component
public class ProductAssembler {

    private final CategoryRepository categories;

    public ProductAssembler(CategoryRepository categories) {
        this.categories = categories;
    }

    public Product create(ProductForm form) {
        Product p = new Product(form.name(), form.description(), form.price(), form.stock(), category(form.categorySlug()));
        apply(p, form);
        return p;
    }

    public void apply(Product p, ProductForm form) {
        p.setName(form.name().trim());
        p.setDescription(form.description());
        p.setPrice(form.price());
        p.setStock(form.stock());
        p.setImageUrl(blankToNull(form.imageUrl()));
        p.setCategory(category(form.categorySlug()));
        applyAttributes(p, form.attributesOrEmpty());
        applyOptions(p, form.optionsOrEmpty());
        applyVariants(p, form.variantsOrEmpty());
    }

    // ───────── 사양 ─────────

    private void applyAttributes(Product p, List<ProductForm.AttributeForm> forms) {
        Map<String, ProductAttribute> existing = p.getAttributes().stream()
                .collect(Collectors.toMap(ProductAttribute::getName, Function.identity(), (a, b) -> a));
        Set<String> keep = new HashSet<>();
        int order = 0;
        for (var f : forms) {
            String name = f.name().trim();
            if (!keep.add(name)) continue; // 같은 이름 중복 입력 무시
            ProductAttribute a = existing.get(name);
            if (a == null) a = p.addAttribute(name, f.value().trim());
            a.update(f.value().trim(), order++);
        }
        p.getAttributes().removeIf(a -> !keep.contains(a.getName()));
    }

    // ───────── 옵션·선택지 ─────────

    private void applyOptions(Product p, List<ProductForm.OptionForm> forms) {
        Map<String, ProductOption> existing = p.getOptions().stream()
                .collect(Collectors.toMap(ProductOption::getName, Function.identity(), (a, b) -> a));
        Set<String> keepOptions = new HashSet<>();
        int optionOrder = 0;
        for (var f : forms) {
            String name = f.name().trim();
            List<String> values = f.values() == null ? List.of()
                    : f.values().stream().map(String::trim).filter(s -> !s.isEmpty()).distinct().toList();
            if (values.isEmpty() || !keepOptions.add(name)) continue;

            ProductOption option = existing.get(name);
            if (option == null) option = p.addOption(name);
            option.setSortOrder(optionOrder++);

            Map<String, ProductOptionValue> existingValues = option.getValues().stream()
                    .collect(Collectors.toMap(ProductOptionValue::getName, Function.identity(), (a, b) -> a));
            int valueOrder = 0;
            for (String v : values) {
                ProductOptionValue value = existingValues.get(v);
                if (value == null) value = option.addValue(v);
                value.setSortOrder(valueOrder++);
            }
            Set<String> keepValues = new HashSet<>(values);
            Set<ProductOptionValue> removed = option.getValues().stream()
                    .filter(v -> !keepValues.contains(v.getName())).collect(Collectors.toSet());
            detachFromVariants(p, removed);
            option.getValues().removeAll(removed);
        }
        Set<ProductOption> removedOptions = p.getOptions().stream()
                .filter(o -> !keepOptions.contains(o.getName())).collect(Collectors.toSet());
        removedOptions.forEach(o -> detachFromVariants(p, new HashSet<>(o.getValues())));
        p.getOptions().removeAll(removedOptions);
    }

    /** 지워질 선택지를 쓰는 조합은 함께 지운다 */
    private void detachFromVariants(Product p, Set<ProductOptionValue> values) {
        if (values.isEmpty()) return;
        p.getVariants().removeIf(v -> v.getOptionValues().stream().anyMatch(values::contains));
    }

    // ───────── 조합(재고·추가금) ─────────

    private void applyVariants(Product p, List<ProductForm.VariantForm> forms) {
        if (p.getOptions().isEmpty()) {
            p.getVariants().clear();
            return;
        }
        Map<String, ProductVariant> existing = p.getVariants().stream()
                .collect(Collectors.toMap(ProductVariant::combinationKey, Function.identity(), (a, b) -> a));
        Set<String> keep = new HashSet<>();
        for (var f : forms) {
            List<ProductOptionValue> values = resolve(p, f.options());
            String key = keyOf(values);
            if (!keep.add(key)) {
                throw bad("같은 옵션 조합이 두 번 입력되었습니다: " + key);
            }
            ProductVariant v = existing.get(key);
            if (v == null) v = p.addVariant(values, f.additionalPrice(), f.stock());
            if (p.getPrice() + f.additionalPrice() < 0) {
                throw bad("추가금 때문에 판매가가 0원 미만이 됩니다: " + key);
            }
            v.setAdditionalPrice(f.additionalPrice());
            v.setStock(f.stock());
            v.setSku(f.sku());
            v.setActive(f.active() == null || f.active());
        }
        p.getVariants().removeIf(v -> !keep.contains(v.combinationKey()));
    }

    /** {"색상":"블랙","사이즈":"M"} → 선택지 엔티티 목록 (모든 옵션을 하나씩 골라야 함) */
    private List<ProductOptionValue> resolve(Product p, Map<String, String> picked) {
        if (picked == null) throw bad("조합에 옵션 값이 없습니다");
        List<ProductOptionValue> out = new ArrayList<>();
        for (ProductOption option : p.getOptions()) {
            String want = picked.get(option.getName());
            if (want == null) throw bad("조합에 '" + option.getName() + "' 값이 빠졌습니다");
            ProductOptionValue value = option.getValues().stream()
                    .filter(v -> v.getName().equals(want.trim())).findFirst()
                    .orElseThrow(() -> bad("'" + option.getName() + "'에 없는 값입니다: " + want));
            out.add(value);
        }
        return out;
    }

    private static String keyOf(List<ProductOptionValue> values) {
        return values.stream()
                .sorted(Comparator.comparingInt((ProductOptionValue v) -> v.getOption().getSortOrder())
                        .thenComparingInt(ProductOptionValue::getSortOrder))
                .map(v -> v.getOption().getName() + "=" + v.getName())
                .collect(Collectors.joining("|"));
    }

    private Category category(String slug) {
        if (slug == null || slug.isBlank()) return null;
        return categories.findBySlug(slug).orElseThrow(() -> bad("없는 카테고리: " + slug));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static ApiException bad(String message) {
        return ApiException.badRequest(message);
    }
}
