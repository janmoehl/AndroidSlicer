import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { SlicerSettingService } from 'app/entities/slicer-setting/slicer-setting.service';
import { ISlicerSetting } from 'app/shared/model/slicer-setting.model';
import { JhiAlertService } from 'ng-jhipster';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'jhi-slicemode-switch',
  templateUrl: './slicemode-switch.component.html',
  styleUrls: ['./slicemode-switch.component.scss']
})
export class SlicemodeSwitchComponent implements OnInit {
  // INPUTS & OUTPUTS:
  @Output() sliceModeChange = new EventEmitter<string>();

  sliceMode: string;
  sliceModes: SelectItem[] = [
    { label: 'Android', value: 'android', icon: 'pi pi-android' },
    { label: 'Java', value: 'java', icon: 'pi pi-desktop' }
  ];

  constructor(protected slicerSettingService: SlicerSettingService, protected jhiAlertService: JhiAlertService) {}

  onSliceModeChange() {
    this.publishChange();
  }

  publishChange() {
    this.sliceModeChange.emit(this.sliceMode);
  }

  ngOnInit() {
    this.slicerSettingService.findByKey('Default_Slicing_Mode').subscribe(
      (res: HttpResponse<ISlicerSetting>) => {
        this.sliceMode = res.body.value;
        this.publishChange();
      },
      (res: HttpErrorResponse) => {
        this.jhiAlertService.error(res.message, null, null);
      }
    );
  }
}
