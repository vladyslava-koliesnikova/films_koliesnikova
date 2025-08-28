import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule} from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { UsersService } from '../../services/users.service';
import { Group } from '../../entities/group';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../entities/user';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { CanDeactivateComponent } from '../../guards/can-deactivate.guard';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-user-edit',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatSlideToggleModule, MatCheckboxModule, RouterLink],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent implements OnInit, CanDeactivateComponent {
  
  usersService = inject(UsersService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  titleS = signal('New user');
  hide = true;
  userId? : number;
  inputUser?: User;
  allGroups: Group[] = [];
  userSaved = false;

  userModel = new FormGroup({
    name: new FormControl('', {validators: [Validators.required]}),
    email: new FormControl('', {validators: [
      Validators.required, 
      Validators.email,
      Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+[.]{1,1}[a-zA-Z0-9-.]{2,}$")]}),
    password: new FormControl(''),
    active: new FormControl(true),
    groups: new FormArray([])
  });

  ngOnInit(): void {
//    this.userId = Number(this.route.snapshot.params['id']); //zle
    this.route.paramMap.pipe(
      map(params => Number(params.get('id')) || undefined),
      tap(userId => {
        this.userId = userId;
        console.log("userId", this.userId);
      }),
      switchMap(userId => userId ? this.usersService.getUser(userId) 
                                 : of(new User('',''))),
      tap(user => {
        this.inputUser = user;
        this.name.setValue(user.name);
        this.email.setValue(user.email);
        this.active.setValue(user.active);
        // this.userModel.patchValue({
        //   name: user.name,
        //   email: user.email,
        //   active: user.active
        // });
      }),
      switchMap(user => this.usersService.getGroups()),
      tap(groups => {
        this.allGroups = groups;
        this.allGroups.forEach(group => {
          const userHasGroup = this.inputUser?.groups.some(ug => ug.id === group.id)
          this.groups.push(new FormControl(userHasGroup));
        });
      })
    ).subscribe();
  }

  save() {
    let groups: Group[] = this.allGroups.filter((g, i) => this.groups.at(i).value);
    const password = (this.password.value || '').trim() || undefined;
    const user = new User(this.name.value, this.email.value, this.userId, undefined, password, this.active.value, groups);
    this.usersService.saveUser(user).subscribe(savedUser => {
      this.userSaved = true;
      this.router.navigateByUrl('/extended-users');
    });
  }

  printErrors(e: ValidationErrors) {
    return JSON.stringify(e);
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.userModel.dirty && ! this.userSaved) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { 
                          data: new ConfirmDialogData('Leaving page?','User is edited but not saved. Do you want to leave the page without save?')});
      return dialogRef.afterClosed();
    }
    return true;
  }

  get name(): FormControl<string> {
    return this.userModel.get('name') as FormControl<string>;
  }
  get email(): FormControl<string> {
    return this.userModel.get('email') as FormControl<string>;
  }
  get password(): FormControl<string> {
    return this.userModel.get('password') as FormControl<string>;
  }
  get active(): FormControl<boolean> {
    return this.userModel.get('active') as FormControl<boolean>;
  }
  get groups(): FormArray {
    return this.userModel.get('groups') as FormArray;
  }
}
