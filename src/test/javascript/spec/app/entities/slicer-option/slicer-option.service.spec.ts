import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SlicerOptionService } from 'app/entities/slicer-option/slicer-option.service';
import { ISlicerOption, SlicerOption } from 'app/shared/model/slicer-option.model';
import { SlicerOptionType } from 'app/shared/model/enumerations/slicer-option-type.model';

describe('Service Tests', () => {
  describe('SlicerOption Service', () => {
    let injector: TestBed;
    let service: SlicerOptionService;
    let httpMock: HttpTestingController;
    let elemDefault: ISlicerOption;
    let expectedResult: ISlicerOption | ISlicerOption[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
      });
      expectedResult = null;
      injector = getTestBed();
      service = injector.get(SlicerOptionService);
      httpMock = injector.get(HttpTestingController);

      elemDefault = new SlicerOption('ID', SlicerOptionType.REFLECTION_OPTION, 'AAAAAAA', 'AAAAAAA', false);
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find('123').subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should update a SlicerOption', () => {
        const returnedFromService = Object.assign(
          {
            type: 'BBBBBB',
            key: 'BBBBBB',
            description: 'BBBBBB',
            isDefault: true
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of SlicerOption', () => {
        const returnedFromService = Object.assign(
          {
            type: 'BBBBBB',
            key: 'BBBBBB',
            description: 'BBBBBB',
            isDefault: true
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
