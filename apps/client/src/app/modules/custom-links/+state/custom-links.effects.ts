import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  CreateCustomLink,
  CustomLinkLoaded,
  CustomLinksActionTypes,
  DeleteCustomLink,
  LoadCustomLink,
  MyCustomLinksLoaded,
  UpdateCustomLink
} from './custom-links.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY, of } from 'rxjs';
import { CustomLinksFacade } from './custom-links.facade';
import { CustomLinksService } from '../../../core/database/custom-links/custom-links.service';
import { CustomLink } from '../../../core/database/custom-links/custom-link';

@Injectable()
export class CustomLinksEffects {

  @Effect()
  loadMyCustomLinks$ = this.actions$.pipe(
    ofType(CustomLinksActionTypes.LoadMyCustomLinks),
    switchMap(() => this.authFacade.userId$),
    switchMap(userId => {
      return this.customLinksService.getByForeignKey(TeamcraftUser, userId).pipe(
        map(links => new MyCustomLinksLoaded(links, userId))
      );
    })
  );

  @Effect()
  loadCustomLink$ = this.actions$.pipe(
    ofType<LoadCustomLink>(CustomLinksActionTypes.LoadCustomLink),
    mergeMap(action => {
      return this.customLinksService.get(action.key).pipe(
        catchError(() => {
          return of({ $key: action.key, notFound: true });
        })
      );
    }),
    map(link => new CustomLinkLoaded(<CustomLink>link))
  );

  @Effect()
  createCustomLink$ = this.actions$.pipe(
    ofType<CreateCustomLink>(CustomLinksActionTypes.CreateCustomLink),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.link.authorId = userId;
      return this.customLinksService.add(action.link);
    }),
    switchMap(() => EMPTY)
  );


  @Effect()
  updateCustomLink$ = this.actions$.pipe(
    ofType<UpdateCustomLink>(CustomLinksActionTypes.UpdateCustomLink),
    switchMap(action => this.customLinksService.update(action.link.$key, action.link)),
    switchMap(() => EMPTY)
  );


  @Effect()
  deleteCustomLink$ = this.actions$.pipe(
    ofType<DeleteCustomLink>(CustomLinksActionTypes.DeleteCustomLink),
    switchMap(action => this.customLinksService.remove(action.key)),
    switchMap(() => EMPTY)
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private linksFacade: CustomLinksFacade,
    private customLinksService: CustomLinksService
  ) {
  }
}
