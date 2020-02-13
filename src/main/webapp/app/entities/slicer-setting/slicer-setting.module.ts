import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AndroidSlicerSharedModule } from 'app/shared/shared.module';
import { SlicerSettingComponent } from './slicer-setting.component';
import { SlicerSettingDetailComponent } from './slicer-setting-detail.component';
import { SlicerSettingUpdateComponent } from './slicer-setting-update.component';
import { SlicerSettingDeleteDialogComponent } from './slicer-setting-delete-dialog.component';
import { slicerSettingRoute } from './slicer-setting.route';

@NgModule({
  imports: [AndroidSlicerSharedModule, RouterModule.forChild(slicerSettingRoute)],
  declarations: [SlicerSettingComponent, SlicerSettingDetailComponent, SlicerSettingUpdateComponent, SlicerSettingDeleteDialogComponent],
  entryComponents: [SlicerSettingDeleteDialogComponent]
})
export class AndroidSlicerSlicerSettingModule {}
