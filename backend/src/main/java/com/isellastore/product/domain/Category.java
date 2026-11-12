package com.isellastore.product.domain;

import jakarta.persistence.*;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    private int sortOrder;

    protected Category() {}

    public Category(String slug, String name, int sortOrder) {
        this.slug = slug;
        this.name = name;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public int getSortOrder() { return sortOrder; }
}
