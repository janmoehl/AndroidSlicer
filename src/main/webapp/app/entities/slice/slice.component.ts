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

  slice?: ISlice[];
  error: any;
  success: any;
  eventSubscriber?: Subscription;
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
    protected parseLinks: JhiParseLinks,
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

  onSliceModeChange(event: SliceMode): void {
    this.sliceMode = event;
    this.loadAll();
  }

  loadAll(): void {
    this.sliceService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        sliceMode: this.sliceMode
      })
      .subscribe((res: HttpResponse<ISlice[]>) => this.paginateSlice(res.body!, res.headers));
  }

  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
  }

  transition(): void {
    this.router.navigate(['/slices'], {
      queryParams: {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    });
    this.loadAll();
  }

  clear(): void {
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

  ngOnInit(): void {
    this.registerChangeInSlice();
    // this.loadAll(); -> done by onSliceModeChange, after initialising the
    // sliceMode variable
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber != null) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: ISlice): any {
    return item.id;
  }

  byteSize(field: any): any {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType: any, field: any): any {
    return this.dataUtils.openFile(contentType, field);
  }

  registerChangeInSlice(): void {
    this.eventSubscriber = this.eventManager.subscribe('sliceListModification', () => this.loadAll());
  }

  sort(): any {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateSlice(data: ISlice[], headers: HttpHeaders): void {
    if (headers.get('link') != null) {
      this.links = this.parseLinks.parse(headers.get('link')!);
    }
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.slice = data;
  }
}
