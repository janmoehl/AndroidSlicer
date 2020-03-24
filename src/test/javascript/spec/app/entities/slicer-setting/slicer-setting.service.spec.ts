import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SlicerSettingService } from 'app/entities/slicer-setting/slicer-setting.service';
import { ISlicerSetting, SlicerSetting } from 'app/shared/model/slicer-setting.model';

describe('Service Tests', () => {
  describe('SlicerSetting Service', () => {
    let injector: TestBed;
    let service: SlicerSettingService;
    let httpMock: HttpTestingController;
    let elemDefault: ISlicerSetting;
    let expectedResult: ISlicerSetting | ISlicerSetting[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
      });
      expectedResult = null;
      injector = getTestBed();
      service = injector.get(SlicerSettingService);
      httpMock = injector.get(HttpTestingController);

      elemDefault = new SlicerSetting('ID', 'AAAAAAA', 'AAAAAAA', 'AAAAAAA');
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find('123').subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should update a SlicerSetting', () => {
        const returnedFromService = Object.assign(
          {
            key: 'BBBBBB',
            value: 'BBBBBB',
            description: 'BBBBBB'
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of SlicerSetting', () => {
        const returnedFromService = Object.assign(
          {
            key: 'BBBBBB',
            value: 'BBBBBB',
            description: 'BBBBBB'
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.query().subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush([returnedFromService]);
        httpMock.verify();
        expect(expectedResult).toContainEqual(expected);
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
