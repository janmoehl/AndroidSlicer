import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { JhiDataUtils, JhiFileLoadError, JhiEventManager, JhiEventWithContent } from 'ng-jhipster';

import { ISlice, Slice } from 'app/shared/model/slice.model';
import { SliceService } from './slice.service';
import { AlertError } from 'app/shared/alert/alert-error.model';

@Component({
  selector: 'jhi-slice-update',
  templateUrl: './slice-update.component.html'
})
export class SliceUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    androidVersion: [null, [Validators.required]],
    androidClassName: [null, [Validators.required]],
    entryMethods: [null, [Validators.required]],
    seedStatements: [null, [Validators.required]],
    slice: [],
    log: [],
    threadId: [],
    running: [],
    reflectionOptions: [null, [Validators.required]],
    dataDependenceOptions: [null, [Validators.required]],
    controlDependenceOptions: [null, [Validators.required]],
    objectTracking: [],
    parameterTracking: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected sliceService: SliceService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ slice }) => {
      this.updateForm(slice);
    });
  }

  updateForm(slice: ISlice): void {
    this.editForm.patchValue({
      id: slice.id,
      androidVersion: slice.androidVersion,
      androidClassName: slice.androidClassName,
      entryMethods: slice.entryMethods,
      seedStatements: slice.seedStatements,
      slice: slice.slice,
      log: slice.log,
      threadId: slice.threadId,
      running: slice.running,
      reflectionOptions: slice.reflectionOptions,
      dataDependenceOptions: slice.dataDependenceOptions,
      controlDependenceOptions: slice.controlDependenceOptions,
      objectTracking: slice.objectTracking,
      parameterTracking: slice.parameterTracking
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
      this.eventManager.broadcast(
        new JhiEventWithContent<AlertError>('androidSlicerApp.error', { message: err.message })
      );
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const slice = this.createFromForm();
    if (slice.id !== undefined) {
      this.subscribeToSaveResponse(this.sliceService.update(slice));
    } else {
      this.subscribeToSaveResponse(this.sliceService.create(slice));
    }
  }

  private createFromForm(): ISlice {
    return {
      ...new Slice(),
      id: this.editForm.get(['id'])!.value,
      androidVersion: this.editForm.get(['androidVersion'])!.value,
      androidClassName: this.editForm.get(['androidClassName'])!.value,
      entryMethods: this.editForm.get(['entryMethods'])!.value,
      seedStatements: this.editForm.get(['seedStatements'])!.value,
      slice: this.editForm.get(['slice'])!.value,
      log: this.editForm.get(['log'])!.value,
      threadId: this.editForm.get(['threadId'])!.value,
      running: this.editForm.get(['running'])!.value,
      reflectionOptions: this.editForm.get(['reflectionOptions'])!.value,
      dataDependenceOptions: this.editForm.get(['dataDependenceOptions'])!.value,
      controlDependenceOptions: this.editForm.get(['controlDependenceOptions'])!.value,
      objectTracking: this.editForm.get(['objectTracking'])!.value,
      parameterTracking: this.editForm.get(['parameterTracking'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISlice>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
