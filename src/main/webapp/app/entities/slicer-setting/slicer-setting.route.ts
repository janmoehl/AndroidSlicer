import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { JhiResolvePagingParams } from 'ng-jhipster';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SlicerSetting } from 'app/shared/model/slicer-setting.model';
import { SlicerSettingService } from './slicer-setting.service';
import { SlicerSettingComponent } from './slicer-setting.component';
import { SlicerSettingDetailComponent } from './slicer-setting-detail.component';
import { SlicerSettingUpdateComponent } from './slicer-setting-update.component';
import { SlicerSettingDeletePopupComponent } from './slicer-setting-delete-dialog.component';
import { ISlicerSetting } from 'app/shared/model/slicer-setting.model';

@Injectable({ providedIn: 'root' })
export class SlicerSettingResolve implements Resolve<ISlicerSetting> {
  constructor(private service: SlicerSettingService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISlicerSetting> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(map((slicerSetting: HttpResponse<SlicerSetting>) => slicerSetting.body));
    }
    return of(new SlicerSetting());
  }
}

export const slicerSettingRoute: Routes = [
  {
    path: '',
    component: SlicerSettingComponent,
    resolve: {
      pagingParams: JhiResolvePagingParams
    },
    data: {
      authorities: ['ROLE_USER'],
      defaultSort: 'id,asc',
      pageTitle: 'SlicerSettings'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: SlicerSettingDetailComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'SlicerSettings'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: SlicerSettingUpdateComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'SlicerSettings'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: SlicerSettingUpdateComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'SlicerSettings'
    },
    canActivate: [UserRouteAccessService]
  }
];

export const slicerSettingPopupRoute: Routes = [
  {
    path: ':id/delete',
    component: SlicerSettingDeletePopupComponent,
    resolve: {
      slicerSetting: SlicerSettingResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'SlicerSettings'
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup'
  }
];
