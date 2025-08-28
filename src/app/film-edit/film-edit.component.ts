import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap, tap, map, Observable } from 'rxjs';
import { FilmsService } from '../../services/films.service';
import { Film } from '../../entities/film';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-film-edit',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './film-edit.component.html',
  styleUrls: ['./film-edit.component.css']
})
export class FilmEditComponent implements OnInit {
  filmsService = inject(FilmsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  titleS = signal('Nový film');
  filmId?: number;
  filmSaved = false;

  filmModel = new FormGroup({
    nazov: new FormControl<string>('', { validators: [Validators.required] }),
    rok: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1888)] }),
    slovenskyNazov: new FormControl<string>(''),
    afi1998: new FormControl<number | null>(null),
    afi2007: new FormControl<number | null>(null)
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id')) || undefined),
      tap(id => {
        this.filmId = id;
        if (id) this.titleS.set('Upraviť film');
      }),
      switchMap(id => id ? this.filmsService.getFilmById(id) : of(undefined)),
      tap(film => {
        if (film) {
          this.filmModel.patchValue({
            nazov: film.nazov,
            rok: film.rok,
            slovenskyNazov: film.slovenskyNazov,
            afi1998: film.poradieVRebricku?.['afi1998'] ?? null,
            afi2007: film.poradieVRebricku?.['afi2007'] ?? null
          });
        }
      })
    ).subscribe();
  }

  save() {
    if (this.filmModel.invalid) return;

    const film: Film = {
      id: this.filmId,
      nazov: this.nazov.value!,
      rok: this.rok.value!,
      slovenskyNazov: this.slovenskyNazov.value || '',
      imdbID: '',       
      reziser: [],       
      postava: [],       
      poradieVRebricku: {
        afi1998: this.afi1998.value ?? 0,
        afi2007: this.afi2007.value ?? 0
      }
    };

    const request$ = this.filmId
      ? this.filmsService.updateFilm(this.filmId, film)
      : this.filmsService.addFilm(film);

    request$.subscribe(() => {
      this.filmSaved = true;
      this.router.navigateByUrl('/films');
    });
  }

  onCancel() {
    this.router.navigateByUrl('/films');
  }
  canDeactivate(): boolean | Observable<boolean> {
    if (this.filmModel.dirty && !this.filmSaved) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { 
        data: new ConfirmDialogData(
          'Leaving page?',
          'Film is edited but not saved. Do you want to leave the page without save?'
        )
      });
      return dialogRef.afterClosed();
    }
    return true;
  }


  // getters
  get nazov(): FormControl<string> {
    return this.filmModel.get('nazov') as FormControl<string>;
  }
  get rok(): FormControl<number | null> {
    return this.filmModel.get('rok') as FormControl<number | null>;
  }
  get slovenskyNazov(): FormControl<string> {
    return this.filmModel.get('slovenskyNazov') as FormControl<string>;
  }
  get afi1998(): FormControl<number | null> {
    return this.filmModel.get('afi1998') as FormControl<number | null>;
  }
  get afi2007(): FormControl<number | null> {
    return this.filmModel.get('afi2007') as FormControl<number | null>;
  }
}
