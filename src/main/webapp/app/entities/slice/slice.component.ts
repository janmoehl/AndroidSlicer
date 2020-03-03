import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiDataUtils } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ISlice } from 'app/shared/model/slice.model';
import { SliceMode } from 'app/shared/model/enumerations/slice-mode.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { SliceService } from './slice.service';
import { SliceDeleteDialogComponent } from './slice-delete-dialog.component';

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
    protected parseLinks: JhiParseLinks,
    protected activatedRoute: ActivatedRoute,
    protected dataUtils: JhiDataUtils,
    protected router: Router,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal
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
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        sliceMode: this.sliceMode
      })
      .subscribe((res: HttpResponse<ISlice[]>) => this.paginateSlice(res.body, res.headers));
  }

  loadPage(page: number) {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
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
    // sliceMode var
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: ISlice) {
    return item.id;
  }

  byteSize(field) {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType, field) {
    return this.dataUtils.openFile(contentType, field);
  }

  registerChangeInSlice() {
    this.eventSubscriber = this.eventManager.subscribe('sliceListModification', () => this.loadAll());
  }

  delete(slice: ISlice) {
    const modalRef = this.modalService.open(SliceDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.slice = slice;
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateSlice(data: ISlice[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    this.slice = data;
  }
}
