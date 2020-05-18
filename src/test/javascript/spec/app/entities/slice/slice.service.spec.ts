import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SliceService } from 'app/entities/slice/slice.service';
import { ISlice, Slice } from 'app/shared/model/slice.model';
import { ReflectionOptions } from 'app/shared/model/enumerations/reflection-options.model';
import { DataDependenceOptions } from 'app/shared/model/enumerations/data-dependence-options.model';
import { ControlDependenceOptions } from 'app/shared/model/enumerations/control-dependence-options.model';

describe('Service Tests', () => {
  describe('Slice Service', () => {
    let injector: TestBed;
    let service: SliceService;
    let httpMock: HttpTestingController;
    let elemDefault: ISlice;
    let expectedResult: ISlice | ISlice[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
      });
      expectedResult = null;
      injector = getTestBed();
      service = injector.get(SliceService);
      httpMock = injector.get(HttpTestingController);

      elemDefault = new Slice(
        'ID',
        0,
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        false,
        ReflectionOptions.FULL,
        DataDependenceOptions.FULL,
        ControlDependenceOptions.FULL,
        false,
        false,
        false
      );
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find('123').subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should create a Slice', () => {
        const returnedFromService = Object.assign(
          {
            id: 'ID'
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.create(new Slice()).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'POST' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should update a Slice', () => {
        const returnedFromService = Object.assign(
          {
            androidVersion: 1,
            androidClassName: 'BBBBBB',
            entryMethods: 'BBBBBB',
            seedStatements: 'BBBBBB',
            slice: 'BBBBBB',
            log: 'BBBBBB',
            threadId: 'BBBBBB',
            running: true,
            reflectionOptions: 'BBBBBB',
            dataDependenceOptions: 'BBBBBB',
            controlDependenceOptions: 'BBBBBB',
            objectTracking: true,
            parameterTracking: true,
            trackingToSlicingCriterion: true
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of Slice', () => {
        const returnedFromService = Object.assign(
          {
            androidVersion: 1,
            androidClassName: 'BBBBBB',
            entryMethods: 'BBBBBB',
            seedStatements: 'BBBBBB',
            slice: 'BBBBBB',
            log: 'BBBBBB',
            threadId: 'BBBBBB',
            running: true,
            reflectionOptions: 'BBBBBB',
            dataDependenceOptions: 'BBBBBB',
            controlDependenceOptions: 'BBBBBB',
            objectTracking: true,
            parameterTracking: true,
            trackingToSlicingCriterion: true
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

      it('should delete a Slice', () => {
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
