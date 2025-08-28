import { Component, inject, OnInit } from '@angular/core';
import { GroupEditChildComponent } from '../group-edit-child/group-edit-child.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { Group } from '../../../entities/group';

@Component({
  selector: 'app-group-edit',
  imports: [GroupEditChildComponent],
  templateUrl: './group-edit.component.html',
  styleUrl: './group-edit.component.css'
})
export class GroupEditComponent implements OnInit{
  route = inject(ActivatedRoute);
  router = inject(Router);
  usersService = inject(UsersService);
  group?: Group;

  ngOnInit(): void {
      // this.route.paramMap.pipe(
      //   map(params => Number(params.get('id'))),
      //   switchMap(groupId => this.usersService.getGroup(groupId)),
      // ).subscribe(group => this.group = group);

      this.route.data.subscribe(data => {
        this.group = data['group'];
      })
  }

  saveGroup(groupToSave: Group) {
    this.usersService.saveGroup(groupToSave).subscribe(saved => {
      this.router.navigate(['../../'],{relativeTo: this.route});
    });
  }
}
