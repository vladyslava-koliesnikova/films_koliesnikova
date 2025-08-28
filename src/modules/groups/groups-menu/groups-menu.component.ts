import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-groups-menu',
  imports: [MaterialModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './groups-menu.component.html',
  styleUrl: './groups-menu.component.css'
})
export class GroupsMenuComponent {

}
