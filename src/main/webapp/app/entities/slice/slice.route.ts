import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { JhiResolvePagingParams } from 'ng-jhipster';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Slice } from 'app/shared/model/slice.model';
import { SliceService } from './slice.service';
import { SliceComponent } from './slice.component';
import { SliceDetailComponent } from './slice-detail.component';
import { SliceMakeComponent } from './slice-make.component';
import { SliceDeletePopupComponent } from './slice-delete-dialog.component';
import { ISlice } from 'app/shared/model/slice.model';

@Injectable({ providedIn: 'root' })
export class SliceResolve implements Resolve<ISlice> {
  constructor(private service: SliceService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISlice> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((slice: HttpResponse<ISlice>) => {
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
      // authorities: ['ROLE_USER'],
      defaultSort: 'id,asc',
      pageTitle: 'Slices'
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
      // authorities: ['ROLE_USER'],
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: SliceMakeComponent,
    resolve: {
      slice: SliceResolve
    },
    data: {
      // authorities: ['ROLE_USER'],
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService]
  }
];

export const slicePopupRoute: Routes = [
  {
    path: ':id/delete',
    component: SliceDeletePopupComponent,
    resolve: {
      slice: SliceResolve
    },
    data: {
      // authorities: ['ROLE_USER'],
      pageTitle: 'Slice'
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup'
  }
];
