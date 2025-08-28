import { inject, Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  snackBar = inject(MatSnackBar);

  error(msg: string, duration = 5000) {
    this.snackBar.open(msg, "ERROR",{duration, panelClass: "errorMessage"});
  }

  success(msg: string, duration = 5000) {
    this.snackBar.open(msg, "SUCCESS", {duration, panelClass: "successMessage"});
  }

  info(msg: string, duration = 5000) {
    this.snackBar.open(msg, "INFO", {duration, panelClass: "infoMessage"});
  }
}
