import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { User } from '../../entities/user';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  usersService = inject(UsersService);
  router = inject(Router);
  messageService = inject(MessageService);
  hide = true;
  passwordMessage = '';
  
  constructor() {
    const options = {
      translations: zxcvbnEnPackage.translations,
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
      },
    }
    zxcvbnOptions.setOptions(options);
  }


  registerModel = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)], this.conflictsValidator('name')),
    email: new FormControl('', { validators: [Validators.required, 
                                             Validators.email,
                                             Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+[.]{1,1}[a-zA-Z0-9-.]{2,}$")],
                                 asyncValidators: this.conflictsValidator('email'),
                                }),
    password: new FormControl('', this.passwordValidator()),
    password2: new FormControl('')
  }, this.passwordsEqualValidator);

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl):ValidationErrors | null => {
      const password = control.value as string;
      const result = zxcvbn(password);
      this.passwordMessage = result.score + '/4, guessable in ' + result.crackTimesDisplay.offlineSlowHashing1e4PerSecond;
      if (result.score < 3) {
        return {'weakPassword': 'Weak password ' + this.passwordMessage}
      }
      return null;
    }
  }

  passwordsEqualValidator(control: AbstractControl):ValidationErrors | null {
    const pass1 = control.get('password');
    const pass2 = control.get('password2');
    if (pass1?.value != pass2?.value) {
      const err =  {'differentPasswords': true};
      pass2?.setErrors(err);
      return err;
    }
    pass2?.setErrors(null);
    return null;
  }

  conflictsValidator(field: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = field === 'name' ? control.value : '';
      const email = field === 'email' ? control.value : '';
      const user = new User(name, email);
      return this.usersService.userConflicts(user).pipe(
        map(conflictsArray => {
          if (conflictsArray.length > 0) {
            return {'serverConflict': field + ' exists on server'};
          }
          return null;
        })
      )
    } 
  }

  register() {
    // const user1 = new User(this.registerModel.get('name')?.value || '',
    //                       this.registerModel.get('email')?.value || ''
    //                       );
    
    // const formValues = this.registerModel.value;
    // const user2 = new User(formValues.name || '', formValues.email || '');

    const user = User.newRegUser(this.name.value, 
                          this.email.value,
                          this.password.value);

    this.usersService.register(user).subscribe(savedUser => {
      this.messageService.success(`User ${savedUser.name} was registered, please log in.`);
      this.router.navigateByUrl('/login');
    });
  }
  printErrors(e: ValidationErrors) {
    return JSON.stringify(e);
  }
  get name(): FormControl<string> {
    return this.registerModel.get('name') as FormControl<string>;
  }
  get email(): FormControl<string> {
    return this.registerModel.get('email') as FormControl<string>;
  }
  get password(): FormControl<string> {
    return this.registerModel.get('password') as FormControl<string>;
  }
  get password2(): FormControl<string> {
    return this.registerModel.get('password2') as FormControl<string>;
  }
}
