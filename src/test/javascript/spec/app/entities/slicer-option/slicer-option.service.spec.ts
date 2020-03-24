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

      elemDefault = new SlicerOption('ID', SlicerOptionType.ReflectionOption, 'AAAAAAA', 'AAAAAAA', false);
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find('123').subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should create a SlicerOption', () => {
        const returnedFromService = Object.assign(
          {
            id: 'ID'
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.create(new SlicerOption()).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'POST' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
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

      it('should delete a SlicerOption', () => {
        service.delete('123').subscribe(resp => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: 'DELETE' });
        req.flush({ status: 200 });
        expect(expectedResult);
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
