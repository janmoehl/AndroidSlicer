import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ISlicerSetting } from 'app/shared/model/slicer-setting.model';
import { SlicerSettingService } from './slicer-setting.service';

@Component({
  templateUrl: './slicer-setting-delete-dialog.component.html'
})
export class SlicerSettingDeleteDialogComponent {
  slicerSetting?: ISlicerSetting;

  constructor(
    protected slicerSettingService: SlicerSettingService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.slicerSettingService.delete(id).subscribe(() => {
      this.eventManager.broadcast('slicerSettingListModification');
      this.activeModal.close();
    });
  }
}
