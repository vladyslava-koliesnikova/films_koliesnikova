import { Routes } from "@angular/router";
import { GroupsListComponent } from "./groups-list/groups-list.component";
import { GroupsMenuComponent } from "./groups-menu/groups-menu.component";
import { GroupEditComponent } from "./group-edit/group-edit.component";
import { GroupNewComponent } from "./group-new/group-new.component";
import { authGuard } from "../../guards/auth.guard";
import { authAsyncGuard } from "../../guards/auth-async.guard";
import { groupResolverGuard } from "../../guards/group-resolver.guard";

export const GROUPS_ROUTES: Routes = [
  {path: '', 
   component: GroupsMenuComponent,
   children: [
    {path: '', component: GroupsListComponent, pathMatch:'full'},
    {path: 'edit/:id', component: GroupEditComponent,
        canActivate:[authAsyncGuard],
        resolve: {
          group: groupResolverGuard
        },
        data: {
          nieco: 'aaaa'
        }
    },
    {path: 'new', component: GroupNewComponent,
      canActivate:[authAsyncGuard]}
   ]
  }
];