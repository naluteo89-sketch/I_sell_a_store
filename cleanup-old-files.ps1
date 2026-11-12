# 구조 개편(M·V·C, CSS Modules)으로 옮겨진 옛 파일을 지웁니다.
# 실행: C:\I_sell_a_store 에서  powershell -ExecutionPolicy Bypass -File .\cleanup-old-files.ps1
$files = @(
  "backend/src/main/java/com/isellastore/admin/AdminUser.java",
  "backend/src/main/java/com/isellastore/admin/AdminUserRepository.java",
  "backend/src/main/java/com/isellastore/config/DbHealthController.java",
  "backend/src/main/java/com/isellastore/config/SiteController.java",
  "backend/src/main/java/com/isellastore/config/StoreProperties.java",
  "backend/src/main/java/com/isellastore/config/WebConfig.java",
  "backend/src/main/java/com/isellastore/order/OrderController.java",
  "backend/src/main/java/com/isellastore/order/OrderDto.java",
  "backend/src/main/java/com/isellastore/order/OrderItem.java",
  "backend/src/main/java/com/isellastore/order/OrderShipping.java",
  "backend/src/main/java/com/isellastore/order/OrderStatus.java",
  "backend/src/main/java/com/isellastore/order/Payment.java",
  "backend/src/main/java/com/isellastore/order/StoreOrder.java",
  "backend/src/main/java/com/isellastore/order/StoreOrderRepository.java",
  "backend/src/main/java/com/isellastore/product/Category.java",
  "backend/src/main/java/com/isellastore/product/CategoryRepository.java",
  "backend/src/main/java/com/isellastore/product/Product.java",
  "backend/src/main/java/com/isellastore/product/ProductAdminController.java",
  "backend/src/main/java/com/isellastore/product/ProductAssembler.java",
  "backend/src/main/java/com/isellastore/product/ProductAttribute.java",
  "backend/src/main/java/com/isellastore/product/ProductController.java",
  "backend/src/main/java/com/isellastore/product/ProductDto.java",
  "backend/src/main/java/com/isellastore/product/ProductForm.java",
  "backend/src/main/java/com/isellastore/product/ProductOption.java",
  "backend/src/main/java/com/isellastore/product/ProductOptionValue.java",
  "backend/src/main/java/com/isellastore/product/ProductRepository.java",
  "backend/src/main/java/com/isellastore/product/ProductVariant.java",
  "backend/src/main/java/com/isellastore/product/ProductVariantRepository.java",
  "backend/src/main/java/com/isellastore/seed/CategoryInitializer.java",
  "backend/src/main/java/com/isellastore/seed/DemoCandidates.java",
  "backend/src/main/java/com/isellastore/seed/DemoSeedController.java",
  "backend/src/main/java/com/isellastore/seed/DemoSeedService.java",
  "backend/src/main/java/com/isellastore/youtube/ProductVideo.java",
  "backend/src/main/java/com/isellastore/youtube/ProductVideoController.java",
  "backend/src/main/java/com/isellastore/youtube/ProductVideoRepository.java",
  "backend/src/main/java/com/isellastore/youtube/ProductVideoService.java",
  "backend/src/main/java/com/isellastore/youtube/ProductYoutubeSetting.java",
  "backend/src/main/java/com/isellastore/youtube/ProductYoutubeSettingRepository.java",
  "backend/src/main/java/com/isellastore/youtube/VideoInfo.java",
  "backend/src/main/java/com/isellastore/youtube/VideoRefreshScheduler.java",
  "backend/src/main/java/com/isellastore/youtube/YoutubeClient.java",
  "backend/src/main/java/com/isellastore/youtube/YoutubeVideo.java",
  "backend/src/main/java/com/isellastore/youtube/YoutubeVideoRepository.java",
  "frontend/components/AddToCart.tsx",
  "frontend/components/CartLink.tsx",
  "frontend/components/Footer.tsx",
  "frontend/components/Header.tsx",
  "frontend/components/OrderView.tsx",
  "frontend/components/ProductCard.tsx",
  "frontend/components/ProductImage.tsx",
  "frontend/components/YoutubePanel.tsx",
  "frontend/components/admin/AdminConsole.tsx",
  "frontend/components/admin/ProductEditor.tsx",
  "frontend/components/admin/VideoCurator.tsx",
  "frontend/lib/api.ts",
  "frontend/lib/cart.ts",
  "frontend/app/globals.css",
  "frontend/postcss.config.mjs",
  "backend/src/main/java/com/isellastore/youtube/ProductVideoCache.java",
  "backend/src/main/java/com/isellastore/youtube/ProductVideoCacheRepository.java",
  "frontend/models/api/communitySeed.ts",
  "frontend/views/community/MockNotice.tsx",
  "frontend/views/community/MockNotice.module.css"
)
foreach ($f in $files) {
  if (Test-Path $f) {
    git rm -q --cached $f 2>$null
    Remove-Item $f -Force
    Write-Host "삭제: $f"
  }
}
# 비어 버린 옛 폴더 정리
foreach ($d in @("frontend/components/admin", "frontend/components",
                 "backend/src/main/java/com/isellastore/config")) {
  if ((Test-Path $d) -and -not (Get-ChildItem $d -Recurse -File)) { Remove-Item $d -Recurse -Force; Write-Host "폴더 삭제: $d" }
}
Write-Host "완료. 이 스크립트 파일도 지워도 됩니다."
