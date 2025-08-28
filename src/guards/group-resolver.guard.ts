import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Group } from "../entities/group";
import { EMPTY, Observable } from "rxjs";
import { inject } from "@angular/core";
import { UsersService } from "../services/users.service";

export const groupResolverGuard: ResolveFn<Group> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Group> => {
  const usersService = inject(UsersService);
  if (! route.paramMap.has('id')) return EMPTY;
  const id = Number(route.paramMap.get('id'));
  if (!id) return EMPTY;
  return usersService.getGroup(id);
}