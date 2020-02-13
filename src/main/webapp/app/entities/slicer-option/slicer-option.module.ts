import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AndroidSlicerSharedModule } from 'app/shared/shared.module';
import { SlicerOptionComponent } from './slicer-option.component';
import { SlicerOptionDetailComponent } from './slicer-option-detail.component';
import { SlicerOptionUpdateComponent } from './slicer-option-update.component';
import { SlicerOptionDeleteDialogComponent } from './slicer-option-delete-dialog.component';
import { slicerOptionRoute } from './slicer-option.route';

@NgModule({
  imports: [AndroidSlicerSharedModule, RouterModule.forChild(slicerOptionRoute)],
  declarations: [SlicerOptionComponent, SlicerOptionDetailComponent, SlicerOptionUpdateComponent, SlicerOptionDeleteDialogComponent],
  entryComponents: [SlicerOptionDeleteDialogComponent]
})
export class AndroidSlicerSlicerOptionModule {}
