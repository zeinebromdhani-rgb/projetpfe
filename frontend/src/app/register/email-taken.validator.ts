// email-taken.validator.ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

export function emailTakenValidator(apiService: ApiService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = (control.value || '').trim().toLowerCase();

    if (!email) {
      // no email, no error
      return of(null);
    }

    return of(email).pipe(
      debounceTime(300), // avoid spamming backend while user is typing
      switchMap((cleanEmail) =>
        apiService.isEmailAlreadyUsed(cleanEmail).pipe(
          map((isTaken: boolean) => (isTaken ? { emailTaken: true } : null)),
          catchError(() => of(null)) // if backend error, don't block form
        )
      )
    );
  };
}
