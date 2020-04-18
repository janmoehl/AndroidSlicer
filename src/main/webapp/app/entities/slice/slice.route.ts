import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { JhiResolvePagingParams } from 'ng-jhipster';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { ISlice, Slice } from 'app/shared/model/slice.model';
import { SliceService } from './slice.service';
import { SliceComponent } from './slice.component';
import { SliceDetailComponent } from './slice-detail.component';
import { SliceUpdateComponent } from './slice-update.component';

@Injectable({ providedIn: 'root' })
export class SliceResolve implements Resolve<ISlice> {
  constructor(private service: SliceService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISlice> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((slice: HttpResponse<Slice>) => {
          if (slice.body) {
            return of(slice.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Slice());
  }
}

export const sliceRoute: Routes = [
  {
    path: '',
    component: SliceComponent,
    resolve: {
      pagingParams: JhiResolvePagingParams
    },
    data: {
      authorities: ['ROLE_USER'],
      defaultSort: 'id,asc',
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: SliceDetailComponent,
    resolve: {
      slice: SliceResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: SliceUpdateComponent,
    resolve: {
      slice: SliceResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: SliceUpdateComponent,
    resolve: {
      slice: SliceResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService]
  }
];
