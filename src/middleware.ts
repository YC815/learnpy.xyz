import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 定義需要認證的路由
const isProtectedRoute = createRouteMatcher([
  // 目前所有路由都允許訪客存取，僅在 API 層面檢查認證
  // 如果您想要某些路由必須登入才能存取，可以在這裡添加
  // '/courses/(.*)',
  // '/api/progress(.*)',
  // '/api/submissions(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 如果是受保護的路由，確保用戶已認證
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // 排除靜態資源和內部 Next.js 路由
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 包含 API 路由
    '/(api|trpc)(.*)',
  ],
};