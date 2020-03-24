import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiDataUtils } from 'ng-jhipster';

import { ISlice } from 'app/shared/model/slice.model';
import { SliceMode } from 'app/shared/model/enumerations/slice-mode.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { SliceService } from './slice.service';

@Component({
  selector: 'jhi-slice',
  templateUrl: './slice.component.html',
  styles: ['::ng-deep #sliceModeSwitch .ui-button { height: 38px; }']
})
export class SliceComponent implements OnInit, OnDestroy {
  SliceModeEnum = SliceMode; // "import" the SliceMode-Enum for the template...
  sliceMode: SliceMode = SliceMode.ANDROID;

  slice: ISlice[];
  error: any;
  success: any;
  eventSubscriber: Subscription;
  routeData: any;
  links: any;
  totalItems: any;
  itemsPerPage: any;
  page: any;
  predicate: any;
  previousPage: any;
  reverse: any;

  constructor(
    protected sliceService: SliceService,
    protected activatedRoute: ActivatedRoute,
    protected dataUtils: JhiDataUtils,
    protected router: Router,
    protected eventManager: JhiEventManager
  ) {
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.routeData = this.activatedRoute.data.subscribe(data => {
      this.page = data.pagingParams.page;
      this.previousPage = data.pagingParams.page;
      this.reverse = data.pagingParams.ascending;
      this.predicate = data.pagingParams.predicate;
    });
  }

  onSliceModeChange(event: SliceMode) {
    this.sliceMode = event;
    this.loadAll();
  }

  loadAll() {
    this.sliceService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        sliceMode: this.sliceMode
      })
      .subscribe(
        (res: HttpResponse<ISlice[]>) => this.onSuccess(res.body, res.headers, pageToLoad),
        () => this.onError()
      );
  }

  transition() {
    this.router.navigate(['/slices'], {
      queryParams: {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    });
    this.loadAll();
  }

  clear() {
    this.page = 0;
    this.router.navigate([
      '/slices',
      {
        page: this.page,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    ]);
    this.loadAll();
  }

  ngOnInit() {
    this.registerChangeInSlice();
    // this.loadAll(); -> done by onSliceModeChange, after initialising the
    // sliceMode variable
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: ISlice): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    return this.dataUtils.openFile(contentType, base64String);
  }

  registerChangeInSlice(): void {
    this.eventSubscriber = this.eventManager.subscribe('sliceListModification', () => this.loadPage());
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected onSuccess(data: ISlice[] | null, headers: HttpHeaders, page: number): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    this.router.navigate(['/slice'], {
      queryParams: {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.predicate + ',' + (this.ascending ? 'asc' : 'desc')
      }
    });
    this.slice = data || [];
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page;
  }
}
