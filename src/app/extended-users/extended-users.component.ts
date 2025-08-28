import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { UsersService } from '../../services/users.service';
import { User } from '../../entities/user';
import { DatePipe } from '@angular/common';
import { GroupsToStringPipe } from '../../pipes/groups-to-string.pipe';
import { MessageService } from '../../services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { RouterLink } from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MaterialModule } from '../../modules/material.module';

@Component({
  selector: 'app-extended-users',
  imports: [RouterLink, DatePipe, GroupsToStringPipe, MaterialModule],
  templateUrl: './extended-users.component.html',
  styleUrl: './extended-users.component.css'
})
export class ExtendedUsersComponent implements OnInit, AfterViewInit {
  usersService = inject(UsersService);
  msgService = inject(MessageService);
  dialog = inject(MatDialog);
  users: User[] = [];
  usersDataSource = new MatTableDataSource<User>([])
  columnsToDisplay = ['id', 'name', 'email', 'active', 'lastLogin', 'groups', 'permissions', 'actions'];
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) matSort?: MatSort;

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.usersDataSource.paginator = this.paginator!;
    this.usersDataSource.sort = this.matSort!;
    this.usersDataSource.sortingDataAccessor = (user: User, col: string):number | string => {
      switch (col) {
        case 'groups':
          return user.groups.map(g => g.name).join(', ');
        case 'permissions':
          const mySet = new Set<string>();
          for (let g of user.groups) {
            for (let p of g.permissions) {
              mySet.add(p);
            } 
          }
          return mySet.size;
          case 'name':
            return user.name;
          case 'email':
            return user.email;
          case 'lastLogin':
            return user.lastLogin?.toISOString() || '';
          case 'active':
            return user.active ? 1 : 0;
          default:
            return '';
      }
    }
    this.usersDataSource.filterPredicate = (user: User, filter: string): boolean => {
      return user.name.includes(filter) || 
             user.email.includes(filter) ||
             user.groups.some(group => group.name.includes(filter)) ||
             user.groups.some(group => group.permissions.some(perm => perm.includes(filter)));
    }
  }

  filter(event:any) {
    const filterValue = (event.target.value as string).trim().toLowerCase();
    this.usersDataSource.filter = filterValue;
  }

  loadUsers() {
    this.usersService.getExtendedUsers().subscribe(users => {
      this.users = users;
      this.usersDataSource.data = users;
      console.log(users);
    });
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { 
                    data: new ConfirmDialogData('Deleting user', 
                      'Are you sure you want to delete user '+ user.name +'?')});
    dialogRef.afterClosed().subscribe((result:boolean) => {
      if (result) {
        this.usersService.deleteUser(user.id!).subscribe(success => {
          this.msgService.success('User '+ user.name +' deleted');
          this.loadUsers();
        })
      }
    }); 
  }
}
