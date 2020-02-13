import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ISlicerSetting } from 'app/shared/model/slicer-setting.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { SlicerSettingService } from './slicer-setting.service';
import { SlicerSettingDeleteDialogComponent } from './slicer-setting-delete-dialog.component';

@Component({
  selector: 'jhi-slicer-setting',
  templateUrl: './slicer-setting.component.html'
})
export class SlicerSettingComponent implements OnInit, OnDestroy {
  slicerSettings: ISlicerSetting[];
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
    protected slicerSettingService: SlicerSettingService,
    protected parseLinks: JhiParseLinks,
    protected activatedRoute: ActivatedRoute,
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

  loadAll() {
    this.slicerSettingService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort()
      })
      .subscribe((res: HttpResponse<ISlicerSetting[]>) => this.paginateSlicerSettings(res.body, res.headers));
  }

  loadPage(page: number) {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
  }

  transition() {
    this.router.navigate(['/slicer-settings'], {
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
      '/slicer-settings',
      {
        page: this.page,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    ]);
    this.loadAll();
  }

  ngOnInit() {
    this.loadAll();
    this.registerChangeInSlicerSettings();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: ISlicerSetting) {
    return item.id;
  }

  registerChangeInSlicerSettings() {
    this.eventSubscriber = this.eventManager.subscribe('slicerSettingListModification', () => this.loadAll());
  }

  delete(slicerSetting: ISlicerSetting) {
    const modalRef = this.modalService.open(SlicerSettingDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.slicerSetting = slicerSetting;
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateSlicerSettings(data: ISlicerSetting[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    this.slicerSettings = data;
  }
}
