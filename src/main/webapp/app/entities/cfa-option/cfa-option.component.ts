import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { ICFAOption } from 'app/shared/model/cfa-option.model';
import { JhiAlertService, JhiDataUtils, JhiEventManager, JhiParseLinks } from 'ng-jhipster';
import { Subscription } from 'rxjs';
import { CFAOptionService } from './cfa-option.service';

@Component({
  selector: 'jhi-cfa-option',
  templateUrl: './cfa-option.component.html'
})
export class CFAOptionComponent implements OnInit, OnDestroy {
  currentAccount: any;
  cFAOptions?: ICFAOption[] | null;
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
    protected cFAOptionService: CFAOptionService,
    protected parseLinks: JhiParseLinks,
    protected jhiAlertService: JhiAlertService,
    protected accountService: AccountService,
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

  loadAll(): void {
    this.cFAOptionService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort()
      })
      .subscribe(
        (res: HttpResponse<ICFAOption[]>) => this.paginateCFAOptions(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
  }

  transition(): void {
    this.router.navigate(['/cfa-options'], {
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
      '/cfa-options',
      {
        page: this.page,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    ]);
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.registerChangeInCFAOptions();
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: ICFAOption): any {
    return item.id;
  }

  byteSize(field: any): any {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType: any, field: any): void {
    return this.dataUtils.openFile(contentType, field);
  }

  registerChangeInCFAOptions(): void {
    this.eventSubscriber = this.eventManager.subscribe('cFAOptionListModification', () => this.loadAll());
  }

  sort(): any {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateCFAOptions(data: ICFAOption[] | null, headers: HttpHeaders): void {
    this.links = headers.get('link') != null ? this.parseLinks.parse(headers.get('link')!) : null;
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.cFAOptions = data;
  }

  protected onError(errorMessage: string): void {
    this.jhiAlertService.error(errorMessage, null, undefined);
  }
}
