import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { Group } from '../../../entities/group';
import { MaterialModule } from '../../material.module';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../app/confirm-dialog/confirm-dialog.component';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-groups-list',
  imports: [MaterialModule, RouterLink],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.css'
})
export class GroupsListComponent implements OnInit{
  usersService = inject(UsersService);
  dialog = inject(MatDialog);
  msgService = inject(MessageService);
  
  groups: Group[] = []
  columnsToDisplay = ['id', 'name', 'permissions', 'actions'];

  ngOnInit(): void {
    this.loadGroups();
  }
  loadGroups() {
    this.usersService.getGroups().subscribe(groups => this.groups = groups);
  }
  deleteGroup(group: Group) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, { 
                        data: new ConfirmDialogData('Deleting group', 
                          'Are you sure you want to delete group '+ group.name +'?')});
        dialogRef.afterClosed().subscribe((result:boolean) => {
          if (result) {
            this.usersService.deleteGroup(group.id!).subscribe(success => {
              this.msgService.success('Group '+ group.name +' deleted');
              this.loadGroups();
            })
          }
        }); 
      
  }
}
