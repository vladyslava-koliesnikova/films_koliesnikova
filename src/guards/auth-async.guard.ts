import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { MessageService } from '../services/message.service';
import { tap } from 'rxjs';

export const authAsyncGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);
  const msgService = inject(MessageService);
  return usersService.isLoggedInAsync().pipe(
    tap( success => {
      if (!success) {
        msgService.info("You need to log in first");
        usersService.navigateAfterLogin = state.url; 
        router.navigateByUrl('/login');
      }
    })
  );
};
