import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faSort,
  faSortUp,
  faSortDown,
  faSync,
  faEye,
  faBan,
  faTimes,
  faArrowLeft,
  faSave,
  faPlus,
  faPencilAlt,
  faBars,
  faThList,
  faUserPlus,
  faRoad,
  faTachometerAlt,
  faHeart,
  faList,
  faBell,
  faBook,
  faHdd,
  faFlag,
  faWrench,
  faLock,
  faCloud,
  faSignOutAlt,
  faSignInAlt,
  faCalendarAlt,
  faSearch,
  faTrashAlt,
  faAsterisk,
  faTasks,
  faHome,
  faFileCode,
  faCogs,
  faLayerGroup,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';

import { AndroidSlicerSharedModule } from 'app/shared/shared.module';
import { AndroidSlicerCoreModule } from 'app/core/core.module';
import { AndroidSlicerAppRoutingModule } from './app-routing.module';
import { AndroidSlicerHomeModule } from './home/home.module';
import { AndroidSlicerEntityModule } from './entities/entity.module';

import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';

// jhipster-needle-angular-add-module-import JHipster will add new module here
import { MainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ErrorComponent } from './layouts/error/error.component';

const monacoConfig: NgxMonacoEditorConfig = {
  defaultOptions: { quickSuggestions: true, scrollBeyondLastLine: false, readOnly: true } // pass default options to be used
};

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AndroidSlicerSharedModule,
    AndroidSlicerCoreModule,
    AndroidSlicerHomeModule,
    MonacoEditorModule.forRoot(monacoConfig),
    // jhipster-needle-angular-add-module JHipster will add new module here
    AndroidSlicerEntityModule,
    AndroidSlicerAppRoutingModule
  ],
  declarations: [MainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, FooterComponent],
  bootstrap: [MainComponent]
})
export class AndroidSlicerAppModule {
  constructor(library: FaIconLibrary) {
    -(
      // Adds the SVG icon to the library so you can use it in your page
      library.addIcons(faUser)
    );
    library.addIcons(faSort);
    library.addIcons(faSortUp);
    library.addIcons(faSortDown);
    library.addIcons(faSync);
    library.addIcons(faEye);
    library.addIcons(faBan);
    library.addIcons(faTimes);
    library.addIcons(faArrowLeft);
    library.addIcons(faSave);
    library.addIcons(faPlus);
    library.addIcons(faPencilAlt);
    library.addIcons(faBars);
    library.addIcons(faHome);
    library.addIcons(faThList);
    library.addIcons(faUserPlus);
    library.addIcons(faRoad);
    library.addIcons(faTachometerAlt);
    library.addIcons(faHeart);
    library.addIcons(faList);
    library.addIcons(faBell);
    library.addIcons(faTasks);
    library.addIcons(faBook);
    library.addIcons(faHdd);
    library.addIcons(faFlag);
    library.addIcons(faWrench);
    library.addIcons(faLock);
    library.addIcons(faCloud);
    library.addIcons(faSignOutAlt);
    library.addIcons(faSignInAlt);
    library.addIcons(faCalendarAlt);
    library.addIcons(faSearch);
    library.addIcons(faTrashAlt);
    library.addIcons(faAsterisk);
    library.addIcons(faFileCode);
    library.addIcons(faCogs);
    library.addIcons(faSync);
    library.addIcons(faLayerGroup);
    library.addIcons(faBookmark);
  }
}
