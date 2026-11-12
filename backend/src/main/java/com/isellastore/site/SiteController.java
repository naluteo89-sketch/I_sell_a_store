package com.isellastore.site;

import com.isellastore.config.StoreProperties;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** 프론트엔드가 브랜드·기능 구성을 읽어가는 API. API 키 같은 비밀값은 내보내지 않는다. */
@RestController
public class SiteController {

    private final StoreProperties props;

    public SiteController(StoreProperties props) {
        this.props = props;
    }

    public record SiteInfo(StoreProperties.Brand brand, StoreProperties.Features features) {}

    @GetMapping("/api/site")
    public SiteInfo site() {
        return new SiteInfo(props.brand(), props.features());
    }
}
