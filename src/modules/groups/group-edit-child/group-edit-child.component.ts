import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Group } from '../../../entities/group';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-edit-child',
  imports: [MaterialModule, FormsModule],
  templateUrl: './group-edit-child.component.html',
  styleUrl: './group-edit-child.component.css'
})
export class GroupEditChildComponent implements OnChanges{
  @Input("groupToEdit") group: Group = new Group('');
  @Output() toSave = new EventEmitter<Group>();
  editedGroup = new Group("bad");
  permissions: string = '';

  ngOnChanges() {
    this.editedGroup = Group.clone(this.group);
    this.permissions = this.editedGroup.permissions.join(', ');
  }
  save() {
    this.editedGroup.permissions = this.permissions.split(',').map(p => p.trim()).filter(p => p); 
    console.log("permissions", this.editedGroup.permissions);
    this.toSave.emit(this.editedGroup);
  }
}
