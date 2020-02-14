import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AndroidSlicerSharedModule } from 'app/shared/shared.module';
import { SliceComponent } from './slice.component';
import { SliceDetailComponent } from './slice-detail.component';
import { SliceMakeComponent } from './slice-make.component';
import { SliceDeleteDialogComponent } from './slice-delete-dialog.component';
import { sliceRoute } from './slice.route';

import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SpinnerModule } from 'primeng/spinner';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TabMenuModule } from 'primeng/tabmenu';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@NgModule({
  imports: [
    AndroidSlicerSharedModule,
    RouterModule.forChild(sliceRoute),
    InputSwitchModule,
    DropdownModule,
    SelectButtonModule,
    CheckboxModule,
    AutoCompleteModule,
    SpinnerModule,
    TabMenuModule,
    MonacoEditorModule
  ],
  declarations: [SliceComponent, SliceDetailComponent, SliceMakeComponent, SliceDeleteDialogComponent],
  entryComponents: [SliceComponent, SliceMakeComponent, SliceDeleteDialogComponent]
})
export class AndroidSlicerSliceModule {}
