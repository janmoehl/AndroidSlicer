import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { SlicerSettingService } from 'app/entities/slicer-setting/slicer-setting.service';
import { ISlicerSetting } from 'app/shared/model/slicer-setting.model';
import { JhiAlertService } from 'ng-jhipster';
import { SelectItem } from 'primeng/api';
import { SliceMode } from 'app/shared/model/enumerations/slice-mode.model';

@Component({
  selector: 'jhi-slicemode-switch',
  templateUrl: './slicemode-switch.component.html',
  styleUrls: ['./slicemode-switch.component.scss']
})
export class SlicemodeSwitchComponent implements OnInit {
  // INPUTS & OUTPUTS:
  @Output() sliceModeChange = new EventEmitter<string>();

  sliceMode!: SliceMode;
  sliceModes: SelectItem[] = [
    { label: 'Android', value: SliceMode.ANDROID, icon: 'pi pi-android' },
    { label: 'Java', value: SliceMode.JAVA, icon: 'pi pi-desktop' }
  ];

  constructor(protected slicerSettingService: SlicerSettingService, protected jhiAlertService: JhiAlertService) {}

  onSliceModeChange(): void {
    this.publishChange();
  }

  publishChange(): void {
    this.sliceModeChange.emit(this.sliceMode);
  }

  ngOnInit(): void {
    this.slicerSettingService.findByKey('Default_Slicing_Mode').subscribe(
      (res: HttpResponse<ISlicerSetting>) => {
        this.sliceMode = SliceMode[res.body!.value!.toUpperCase()];
        this.publishChange();
      },
      (res: HttpErrorResponse) => {
        this.jhiAlertService.error(res.message, null, undefined);
      }
    );
  }
}
