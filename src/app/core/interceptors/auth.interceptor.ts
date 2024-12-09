import { HttpInterceptorFn } from '@angular/common/http';
import { getAuth } from 'firebase/auth';
import { from, lastValueFrom } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    return from(
      currentUser.getIdToken().then(token => {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return lastValueFrom(next(authReq));
      })
    );
  }

  return next(req);
};