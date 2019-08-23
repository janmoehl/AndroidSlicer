/* tslint:disable max-line-length */
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { SlicerOptionService } from 'app/entities/slicer-option/slicer-option.service';
import { ISlicerOption, SlicerOption, SlicerOptionType } from 'app/shared/model/slicer-option.model';

describe('Service Tests', () => {
  describe('SlicerOption Service', () => {
    let injector: TestBed;
    let service: SlicerOptionService;
    let httpMock: HttpTestingController;
    let elemDefault: ISlicerOption;
    let expectedResult;
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
      });
      expectedResult = {};
      injector = getTestBed();
      service = injector.get(SlicerOptionService);
      httpMock = injector.get(HttpTestingController);

      elemDefault = new SlicerOption('ID', SlicerOptionType.REFLECTION_OPTION, 'AAAAAAA', 'AAAAAAA', false);
    });

    describe('Service methods', () => {
      it('should find an element', async () => {
        const returnedFromService = Object.assign({}, elemDefault);
        service
          .find('123')
          .pipe(take(1))
          .subscribe(resp => (expectedResult = resp));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject({ body: elemDefault });
      });

      it('should update a SlicerOption', async () => {
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
        service
          .update(expected)
          .pipe(take(1))
          .subscribe(resp => (expectedResult = resp));
        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject({ body: expected });
      });

      it('should return a list of SlicerOption', async () => {
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
        service
          .query(expected)
          .pipe(
            take(1),
            map(resp => resp.body)
          )
          .subscribe(body => (expectedResult = body));
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
