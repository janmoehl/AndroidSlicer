import { NgModule } from '@angular/core';
import { AndroidSlicerSharedLibsModule } from './shared-libs.module';
import { JhiAlertComponent } from './alert/alert.component';
import { JhiAlertErrorComponent } from './alert/alert-error.component';
import { JhiLoginModalComponent } from './login/login.component';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';
import { SlicemodeSwitchComponent } from './slicemode-switch/slicemode-switch.component';
import { SelectButtonModule } from 'primeng/selectbutton';

@NgModule({
  imports: [AndroidSlicerSharedLibsModule, SelectButtonModule],
  declarations: [JhiAlertComponent, JhiAlertErrorComponent, JhiLoginModalComponent, HasAnyAuthorityDirective, SlicemodeSwitchComponent],
  entryComponents: [JhiLoginModalComponent],
  exports: [
    AndroidSlicerSharedLibsModule,
    JhiAlertComponent,
    JhiAlertErrorComponent,
    JhiLoginModalComponent,
    HasAnyAuthorityDirective,
    SlicemodeSwitchComponent
  ]
})
export class AndroidSlicerSharedModule {}
