import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { isStaticAssetUrl, SKIP_LOADING } from '@core/http';
import { LoadingService } from '@core/loading';

/**
 * معترض تحميل عام اختياري (Opt-in):
 * يزيد عداد `LoadingService` عند بدء طلب HTTP وينقصه في `finalize()`.
 *
 * غير مفعّل افتراضياً في `provideMozHttp()` لأن كل قسم يدير حالة التحميل الخاصة به محلياً
 * عبر `httpResource.isLoading()`. لتفعيله مستقبلاً أضفه إلى `withInterceptors([...])`.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (isStaticAssetUrl(req.url) || req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.show();

  return next(req).pipe(finalize(() => loading.hide()));
};
