import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../shared-services/user.service';
import { AuthService } from '@auth0/auth0-angular';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const canActivateUserGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return inject(UserService)
    .canActivate()
    .pipe(map((isAuthenticated) => isAuthenticated || router.createUrlTree(['login'])));
};
