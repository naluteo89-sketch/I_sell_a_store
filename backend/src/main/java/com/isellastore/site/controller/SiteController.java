package com.isellastore.site.controller;

import com.isellastore.global.config.StoreProperties;
import com.isellastore.site.dto.SiteInfo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SiteController {

    private final StoreProperties props;

    public SiteController(StoreProperties props) {
        this.props = props;
    }

    @GetMapping("/api/site")
    public SiteInfo site() {
        return new SiteInfo(props.brand(), props.features());
    }
}
