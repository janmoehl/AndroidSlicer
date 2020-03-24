import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { JhiDataUtils, JhiFileLoadError, JhiEventManager, JhiEventWithContent } from 'ng-jhipster';

import { ISlicerOption, SlicerOption } from 'app/shared/model/slicer-option.model';
import { SlicerOptionService } from './slicer-option.service';
import { AlertError } from 'app/shared/alert/alert-error.model';

@Component({
  selector: 'jhi-slicer-option-update',
  templateUrl: './slicer-option-update.component.html'
})
export class SlicerOptionUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    type: [null, [Validators.required]],
    key: [null, [Validators.required]],
    description: [],
    isDefault: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected slicerOptionService: SlicerOptionService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ slicerOption }) => {
      this.updateForm(slicerOption);
    });
  }

  updateForm(slicerOption: ISlicerOption): void {
    this.editForm.patchValue({
      id: slicerOption.id,
      type: slicerOption.type,
      key: slicerOption.key,
      description: slicerOption.description,
      isDefault: slicerOption.isDefault
    });
  }

  previousState() {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const slicerOption = this.createFromForm();
    if (slicerOption.id !== undefined) {
      this.subscribeToSaveResponse(this.slicerOptionService.update(slicerOption));
    }
  }

  private createFromForm(): ISlicerOption {
    return {
      ...new SlicerOption(),
      id: this.editForm.get(['id'])!.value,
      type: this.editForm.get(['type'])!.value,
      key: this.editForm.get(['key'])!.value,
      description: this.editForm.get(['description'])!.value,
      isDefault: this.editForm.get(['isDefault'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISlicerOption>>): void {
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
