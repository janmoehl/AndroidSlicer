import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { ISlicerOption, SlicerOption } from 'app/shared/model/slicer-option.model';
import { SlicerOptionService } from './slicer-option.service';
import { SlicerOptionComponent } from './slicer-option.component';
import { SlicerOptionDetailComponent } from './slicer-option-detail.component';
import { SlicerOptionUpdateComponent } from './slicer-option-update.component';

@Injectable({ providedIn: 'root' })
export class SlicerOptionResolve implements Resolve<ISlicerOption> {
  constructor(private service: SlicerOptionService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISlicerOption> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((slicerOption: HttpResponse<SlicerOption>) => {
          if (slicerOption.body) {
            return of(slicerOption.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new SlicerOption());
  }
}

export const slicerOptionRoute: Routes = [
  {
    path: '',
    component: SlicerOptionComponent,
    data: {
      authorities: [Authority.USER],
      defaultSort: 'id,asc',
      pageTitle: 'SlicerOptions',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SlicerOptionDetailComponent,
    resolve: {
      slicerOption: SlicerOptionResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'SlicerOptions',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SlicerOptionUpdateComponent,
    resolve: {
      slicerOption: SlicerOptionResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'SlicerOptions',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SlicerOptionUpdateComponent,
    resolve: {
      slicerOption: SlicerOptionResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'SlicerOptions',
    },
    canActivate: [UserRouteAccessService],
  },
];
