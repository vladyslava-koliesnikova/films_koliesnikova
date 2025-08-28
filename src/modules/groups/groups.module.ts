import { NgModule } from '@angular/core';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { RouterModule } from '@angular/router';
import { GROUPS_ROUTES } from './groups.routes';

@NgModule({
  declarations: [],
  imports: [
    GroupsListComponent,
    RouterModule.forChild(GROUPS_ROUTES)
  ]
})
export default class GroupsModule { }
