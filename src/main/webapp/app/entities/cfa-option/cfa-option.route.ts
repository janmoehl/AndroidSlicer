import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { CFAOption, ICFAOption } from 'app/shared/model/cfa-option.model';
import { JhiResolvePagingParams } from 'ng-jhipster';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { CFAOptionDetailComponent } from './cfa-option-detail.component';
import { CFAOptionUpdateComponent } from './cfa-option-update.component';
import { CFAOptionComponent } from './cfa-option.component';
import { CFAOptionService } from './cfa-option.service';

@Injectable({ providedIn: 'root' })
export class CFAOptionResolve implements Resolve<ICFAOption> {
  constructor(private service: CFAOptionService) {}

  // eslint-disable-next-line
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICFAOption> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((response: HttpResponse<CFAOption>) => {
          if (response.body) {
            return of(response.body);
          } else {
            return EMPTY;
          }
        })
      );
    }
    return of(new CFAOption());
  }
}

export const cFAOptionRoute: Routes = [
  {
    path: '',
    component: CFAOptionComponent,
    resolve: {
      pagingParams: JhiResolvePagingParams
    },
    data: {
      // authorities: ['ROLE_USER'],
      defaultSort: 'id,asc',
      pageTitle: 'CFA Options'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: CFAOptionDetailComponent,
    resolve: {
      cFAOption: CFAOptionResolve
    },
    data: {
      // authorities: ['ROLE_USER'],
      pageTitle: 'CFA Option'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: CFAOptionUpdateComponent,
    resolve: {
      cFAOption: CFAOptionResolve
    },
    data: {
      // authorities: ['ROLE_USER'],
      pageTitle: 'CFA Option'
    },
    canActivate: [UserRouteAccessService]
  }
];
