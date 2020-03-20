import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { ISlicerOption } from 'app/shared/model/slicer-option.model';

@Component({
  selector: 'jhi-slicer-option-detail',
  templateUrl: './slicer-option-detail.component.html'
})
export class SlicerOptionDetailComponent implements OnInit {
  slicerOption: ISlicerOption | null = null;

  constructor(protected dataUtils: JhiDataUtils, protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ slicerOption }) => {
      this.slicerOption = slicerOption;
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  previousState(): void {
    window.history.back();
  }
}
