import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { JhiResolvePagingParams } from 'ng-jhipster';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Slice } from 'app/shared/model/slice.model';
import { SliceService } from './slice.service';
import { SliceComponent } from './slice.component';
import { SliceDetailComponent } from './slice-detail.component';
import { SliceUpdateComponent } from './slice-update.component';
import { ISlice } from 'app/shared/model/slice.model';

@Injectable({ providedIn: 'root' })
export class SliceResolve implements Resolve<ISlice> {
  constructor(private service: SliceService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISlice> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(map((slice: HttpResponse<Slice>) => slice.body));
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
