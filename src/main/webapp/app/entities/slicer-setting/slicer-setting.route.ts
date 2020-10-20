import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { ISlicerSetting, SlicerSetting } from 'app/shared/model/slicer-setting.model';
import { SlicerSettingService } from './slicer-setting.service';
import { SlicerSettingComponent } from './slicer-setting.component';
import { SlicerSettingDetailComponent } from './slicer-setting-detail.component';
import { SlicerSettingUpdateComponent } from './slicer-setting-update.component';

@Injectable({ providedIn: 'root' })
export class SlicerSettingResolve implements Resolve<ISlicerSetting> {
  constructor(private service: SlicerSettingService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISlicerSetting> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((slicerSetting: HttpResponse<SlicerSetting>) => {
          if (slicerSetting.body) {
            return of(slicerSetting.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new SlicerSetting());
  }
}

export const slicerSettingRoute: Routes = [
  {
    path: '',
    component: SlicerSettingComponent,
    data: {
      authorities: [Authority.USER],
      defaultSort: 'id,asc',
      pageTitle: 'SlicerSettings',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SlicerSettingDetailComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'SlicerSettings',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SlicerSettingUpdateComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'SlicerSettings',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SlicerSettingUpdateComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'SlicerSettings',
    },
    canActivate: [UserRouteAccessService],
  },
];
