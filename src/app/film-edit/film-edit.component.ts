import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap, tap, map, Observable } from 'rxjs';
import { FilmsService } from '../../services/films.service';
import { Film } from '../../entities/film';
import { Person } from '../../entities/person';
import { Postava } from '../../entities/postava';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-film-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule
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

  reziseri = signal<Person[]>([]);
  addingReziser = false;
  editingReziserIndex: number | null = null;
  newReziserMeno = '';
  newReziserPriezvisko = '';
  editReziserMeno = '';
  editReziserPriezvisko = '';

  postavy = signal<Postava[]>([]);
  addingPostava = false;
  editingPostavaIndex: number | null = null;
  newPostavaNazov = '';
  newPostavaDolezitost: "hlavná postava" | "vedľajšia postava" = 'hlavná postava';
  newPostavaHerec = '';
  editPostavaNazov = '';
  editPostavaDolezitost: "hlavná postava" | "vedľajšia postava" = 'hlavná postava';
  editPostavaHerec = '';

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
            afi1998: film.poradieVRebricku?.['AFI 1998'] ?? null,
            afi2007: film.poradieVRebricku?.['AFI 2007'] ?? null
          });
          this.reziseri.set(film.reziser || []);
          this.postavy.set(film.postava || []);
        }
      })
    ).subscribe();
  }

  save() {
    if (this.filmModel.invalid) return;
    const poradieVRebricku: { [key: string]: number } = {};

    if (this.afi1998.value !== null) {
      poradieVRebricku['AFI 1998'] = this.afi1998.value;
    }
    if (this.afi2007.value !== null) {
      poradieVRebricku['AFI 2007'] = this.afi2007.value;
    }

    const film: Film = {
      id: this.filmId,
      nazov: this.nazov.value!,
      rok: this.rok.value!,
      slovenskyNazov: this.slovenskyNazov.value || '',
      imdbID: '',
      reziser: this.reziseri(),
      postava: this.postavy(),
      poradieVRebricku: poradieVRebricku

    };

    this.filmsService.saveFilm(film).subscribe(() => {
      this.filmSaved = true;
      this.router.navigateByUrl('/films');
    });
  }

  addReziser() {
    this.addingReziser = true;
    this.newReziserMeno = '';
    this.newReziserPriezvisko = '';
  }

  confirmAddReziser() {
    if (this.newReziserMeno && this.newReziserPriezvisko) {
      const novyReziser: Person = {
        id: Date.now(),
        krstneMeno: this.newReziserMeno,
        stredneMeno: '',
        priezvisko: this.newReziserPriezvisko
      };

      this.reziseri.update(arr => [...arr, novyReziser]);
      this.cancelAddReziser();
    }
  }

  cancelAddReziser() {
    this.addingReziser = false;
  }

  startEditReziser(reziser: Person, index: number) {
    this.editingReziserIndex = index;
    this.editReziserMeno = reziser.krstneMeno;
    this.editReziserPriezvisko = reziser.priezvisko;
  }

  saveReziserEdit(index: number) {
    if (this.editReziserMeno && this.editReziserPriezvisko) {
      this.reziseri.update(arr => arr.map((r, i) =>
        i === index ? {
          ...r,
          krstneMeno: this.editReziserMeno,
          priezvisko: this.editReziserPriezvisko
        } : r
      ));
      this.cancelReziserEdit();
    }
  }

  cancelReziserEdit() {
    this.editingReziserIndex = null;
  }

  removeReziser(index: number) {
    this.reziseri.update(arr => arr.filter((_, i) => i !== index));
  }


  addPostava() {
    this.addingPostava = true;
    this.newPostavaNazov = '';
    this.newPostavaDolezitost = 'hlavná postava';
    this.newPostavaHerec = '';
  }

  confirmAddPostava() {
    if (this.newPostavaNazov && this.newPostavaHerec) {
      const [krstneMeno, priezvisko] = this.newPostavaHerec.split(' ');

      const novaPostava: Postava = {
        postava: this.newPostavaNazov,
        dolezitost: this.newPostavaDolezitost,
        herec: {
          id: 0,
          krstneMeno: krstneMeno || '',
          stredneMeno: '',
          priezvisko: priezvisko || this.newPostavaHerec
        }
      };

      this.postavy.update(arr => [...arr, novaPostava]);
      this.cancelAddPostava();
    }
  }

  cancelAddPostava() {
    this.addingPostava = false;
  }

  startEditPostava(postava: Postava, index: number) {
    this.editingPostavaIndex = index;
    this.editPostavaNazov = postava.postava;
    this.editPostavaDolezitost = postava.dolezitost;
    this.editPostavaHerec = `${postava.herec.krstneMeno} ${postava.herec.priezvisko}`;
  }

  savePostavaEdit(index: number) {
    if (this.editPostavaNazov && this.editPostavaHerec) {
      const [krstneMeno, priezvisko] = this.editPostavaHerec.split(' ');

      this.postavy.update(arr => arr.map((p, i) =>
        i === index ? {
          ...p,
          postava: this.editPostavaNazov,
          dolezitost: this.editPostavaDolezitost,
          herec: {
            id: p.herec.id,
            krstneMeno: krstneMeno || '',
            stredneMeno: '',
            priezvisko: priezvisko || this.editPostavaHerec
          }
        } : p
      ));
      this.cancelPostavaEdit();
    }
  }

  cancelPostavaEdit() {
    this.editingPostavaIndex = null;
  }

  removePostava(index: number) {
    this.postavy.update(arr => arr.filter((_, i) => i !== index));
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