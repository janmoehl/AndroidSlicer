import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ISlicerSetting, SlicerSetting } from 'app/shared/model/slicer-setting.model';
import { SlicerSettingService } from './slicer-setting.service';

@Component({
  selector: 'jhi-slicer-setting-update',
  templateUrl: './slicer-setting-update.component.html'
})
export class SlicerSettingUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    key: [null, [Validators.required]],
    value: [null, [Validators.required]],
    description: []
  });

  constructor(protected slicerSettingService: SlicerSettingService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ slicerSetting }) => {
      this.updateForm(slicerSetting);
    });
  }

  updateForm(slicerSetting: ISlicerSetting): void {
    this.editForm.patchValue({
      id: slicerSetting.id,
      key: slicerSetting.key,
      value: slicerSetting.value,
      description: slicerSetting.description
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const slicerSetting = this.createFromForm();
    if (slicerSetting.id !== undefined) {
      this.subscribeToSaveResponse(this.slicerSettingService.update(slicerSetting));
    }
  }

  private createFromForm(): ISlicerSetting {
    return {
      ...new SlicerSetting(),
      id: this.editForm.get(['id'])!.value,
      key: this.editForm.get(['key'])!.value,
      value: this.editForm.get(['value'])!.value,
      description: this.editForm.get(['description'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISlicerSetting>>): void {
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
