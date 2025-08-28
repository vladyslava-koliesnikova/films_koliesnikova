import { Component, inject } from '@angular/core';
import { GroupEditChildComponent } from "../group-edit-child/group-edit-child.component";
import { Group } from '../../../entities/group';
import { UsersService } from '../../../services/users.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-group-new',
  imports: [GroupEditChildComponent],
  templateUrl: './group-new.component.html',
  styleUrl: './group-new.component.css'
})
export class GroupNewComponent {
  usersService = inject(UsersService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  group = new Group("new group");

  saveGroup(groupToSave: Group) {
    this.usersService.saveGroup(groupToSave).subscribe(saved => {
      this.router.navigate(['../'],{relativeTo: this.route});
    });
  }
}
