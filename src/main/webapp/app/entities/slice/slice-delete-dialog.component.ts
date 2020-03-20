import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ISlice } from 'app/shared/model/slice.model';
import { SliceService } from './slice.service';

@Component({
  templateUrl: './slice-delete-dialog.component.html'
})
export class SliceDeleteDialogComponent {
  slice?: ISlice;

  constructor(protected sliceService: SliceService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  clear(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.sliceService.delete(id).subscribe(() => {
      this.eventManager.broadcast('sliceListModification');
      this.activeModal.close();
    });
  }
}
