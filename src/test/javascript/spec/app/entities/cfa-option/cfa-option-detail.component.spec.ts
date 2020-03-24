import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JhiDataUtils } from 'ng-jhipster';

import { AndroidSlicerTestModule } from '../../../test.module';
import { CFAOptionDetailComponent } from 'app/entities/cfa-option/cfa-option-detail.component';
import { CFAOption } from 'app/shared/model/cfa-option.model';

describe('Component Tests', () => {
  describe('CFAOption Management Detail Component', () => {
    let comp: CFAOptionDetailComponent;
    let fixture: ComponentFixture<CFAOptionDetailComponent>;
    const route = ({ data: of({ cFAOption: new CFAOption('123') }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [AndroidSlicerTestModule],
        declarations: [CFAOptionDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }]
      })
        .overrideTemplate(CFAOptionDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(CFAOptionDetailComponent);
      comp = fixture.componentInstance;
      dataUtils = fixture.debugElement.injector.get(JhiDataUtils);
    });

    describe('OnInit', () => {
      it('Should load slice on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.cFAOption).toEqual(jasmine.objectContaining({ id: '123' }));
      });
    });

    describe('byteSize', () => {
      it('Should call byteSize from JhiDataUtils', () => {
        // GIVEN
        spyOn(dataUtils, 'byteSize');
        const fakeBase64 = 'fake base64';

        // WHEN
        comp.byteSize(fakeBase64);

        // THEN
        expect(dataUtils.byteSize).toBeCalledWith(fakeBase64);
      });
    });

    describe('openFile', () => {
      it('Should call openFile from JhiDataUtils', () => {
        // GIVEN
        spyOn(dataUtils, 'openFile');
        const fakeContentType = 'fake content type';
        const fakeBase64 = 'fake base64';

        // WHEN
        comp.openFile(fakeContentType, fakeBase64);

        // THEN
        expect(dataUtils.openFile).toBeCalledWith(fakeContentType, fakeBase64);
      });
    });
  });
});
