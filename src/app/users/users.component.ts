import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../entities/user';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users:User[] = [new User("Janko", "janko@janko.sk"),
           new User("Marienka", "marienka@janko.sk", 2, new Date('2025-01-01')),
           {name:"Jožko", email: "jozko@janko.sk", password: "heslo", active: true, groups: []}
  ];
  selectedUser?: User;
  errorMessage = '';

  constructor(private usersService: UsersService){}

  ngOnInit(): void {
    this.usersService.getUsers().subscribe({
      next: u => this.users = u,
      error: err => {
        this.errorMessage = 'Server not available';
        console.error("ERROR", err);
      },
      complete: () => console.log("Stream closed")
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
  }
}
