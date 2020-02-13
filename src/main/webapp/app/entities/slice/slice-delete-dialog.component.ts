import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ISlice } from 'app/shared/model/slice.model';
import { SliceService } from './slice.service';

@Component({
  templateUrl: './slice-delete-dialog.component.html'
})
export class SliceDeleteDialogComponent {
  slice: ISlice;

  constructor(protected sliceService: SliceService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: string) {
    this.sliceService.delete(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'sliceListModification',
        content: 'Deleted an slice'
      });
      this.activeModal.dismiss(true);
    });
  }
}
