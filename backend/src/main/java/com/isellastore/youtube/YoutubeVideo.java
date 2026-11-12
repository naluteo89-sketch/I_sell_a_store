package com.isellastore.youtube;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * 유튜브 영상 정보. 여러 상품이 같은 영상을 공유한다.
 * 제목·채널·썸네일·조회수는 API 데이터 → fetchedAt 기준 30일 안에 갱신 또는 비움 (정책).
 * fetchedAt 이 null 이면 관리자가 고정한 영상 ID만 보관 중인 상태.
 */
@Entity
public class YoutubeVideo {

    @Id
    @Column(length = 20)
    private String videoId;

    @Column(length = 500)
    private String title;

    private String channelTitle;

    @Column(length = 1000)
    private String thumbnailUrl;

    private long viewCount;

    private Instant fetchedAt;

    protected YoutubeVideo() {}

    public YoutubeVideo(String videoId) {
        this.videoId = videoId;
    }

    public void updateFrom(VideoInfo info) {
        this.title = info.title();
        this.channelTitle = info.channelTitle();
        this.thumbnailUrl = info.thumbnailUrl();
        this.viewCount = info.viewCount();
        this.fetchedAt = Instant.now();
    }

    /** 보관 기한 초과: ID만 남기고 API 데이터는 지운다 */
    public void clearApiData() {
        this.title = null;
        this.channelTitle = null;
        this.thumbnailUrl = null;
        this.viewCount = 0;
        this.fetchedAt = null;
    }

    public VideoInfo toInfo() {
        return new VideoInfo(videoId, title, channelTitle, thumbnailUrl, viewCount);
    }

    public String getVideoId() { return videoId; }
    public String getTitle() { return title; }
    public String getChannelTitle() { return channelTitle; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public long getViewCount() { return viewCount; }
    public Instant getFetchedAt() { return fetchedAt; }
}
