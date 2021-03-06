import { NgModule } from '@angular/core';
import { AndroidSlicerSharedLibsModule } from './shared-libs.module';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';
import { LoginModalComponent } from './login/login.component';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';
import { SlicemodeSwitchComponent } from './slicemode-switch/slicemode-switch.component';
import { SelectButtonModule } from 'primeng/selectbutton';

@NgModule({
  imports: [AndroidSlicerSharedLibsModule, SelectButtonModule],
  declarations: [AlertComponent, AlertErrorComponent, LoginModalComponent, HasAnyAuthorityDirective, SlicemodeSwitchComponent],
  entryComponents: [LoginModalComponent],
  exports: [
    AndroidSlicerSharedLibsModule,
    AlertComponent,
    AlertErrorComponent,
    LoginModalComponent,
    HasAnyAuthorityDirective,
    SlicemodeSwitchComponent
  ]
})
export class AndroidSlicerSharedModule {}
