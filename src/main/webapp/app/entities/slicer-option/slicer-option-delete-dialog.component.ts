import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ISlicerOption } from 'app/shared/model/slicer-option.model';
import { SlicerOptionService } from './slicer-option.service';

@Component({
  templateUrl: './slicer-option-delete-dialog.component.html'
})
export class SlicerOptionDeleteDialogComponent {
  slicerOption?: ISlicerOption;

  constructor(
    protected slicerOptionService: SlicerOptionService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager
  ) {}

  clear(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.slicerOptionService.delete(id).subscribe(() => {
      this.eventManager.broadcast('slicerOptionListModification');
      this.activeModal.close();
    });
  }
}
