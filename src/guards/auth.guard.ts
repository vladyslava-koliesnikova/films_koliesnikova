import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { UsersService } from '../services/users.service';
import { MessageService } from '../services/message.service';

const internalGuard = (url: string) => {
  const usersService = inject(UsersService);
  const router = inject(Router);
  const msgService = inject(MessageService);
  const ok = usersService.isLoggedIn();
  if (!ok) {
    // return router.createUrlTree(['/login']);
    msgService.info("You need to log in first");
    usersService.navigateAfterLogin = url; 
    router.navigateByUrl('/login');
  }
  return ok;
}

export const authGuard: CanActivateFn = (route, state) => {
  return internalGuard(state.url);
};

export const authMatchGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  return internalGuard(route.path || '');
}

