import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AndroidSlicerSharedModule } from 'app/shared/shared.module';
import { SliceComponent } from './slice.component';
import { SliceDetailComponent } from './slice-detail.component';
import { SliceUpdateComponent } from './slice-update.component';
import { SliceDeleteDialogComponent } from './slice-delete-dialog.component';
import { sliceRoute } from './slice.route';

@NgModule({
  imports: [AndroidSlicerSharedModule, RouterModule.forChild(sliceRoute)],
  declarations: [SliceComponent, SliceDetailComponent, SliceUpdateComponent, SliceDeleteDialogComponent],
  entryComponents: [SliceDeleteDialogComponent]
})
export class AndroidSlicerSliceModule {}
