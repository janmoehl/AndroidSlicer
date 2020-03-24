import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JhiDataUtils } from 'ng-jhipster';

import { AndroidSlicerTestModule } from '../../../test.module';
import { SlicerOptionDetailComponent } from 'app/entities/slicer-option/slicer-option-detail.component';
import { SlicerOption } from 'app/shared/model/slicer-option.model';

describe('Component Tests', () => {
  describe('SlicerOption Management Detail Component', () => {
    let comp: SlicerOptionDetailComponent;
    let fixture: ComponentFixture<SlicerOptionDetailComponent>;
    let dataUtils: JhiDataUtils;
    const route = ({ data: of({ slicerOption: new SlicerOption('123') }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [AndroidSlicerTestModule],
        declarations: [SlicerOptionDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }]
      })
        .overrideTemplate(SlicerOptionDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(SlicerOptionDetailComponent);
      comp = fixture.componentInstance;
      dataUtils = fixture.debugElement.injector.get(JhiDataUtils);
    });

    describe('OnInit', () => {
      it('Should load slicerOption on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.slicerOption).toEqual(jasmine.objectContaining({ id: '123' }));
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
