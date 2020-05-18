import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CFAOptionService } from 'app/entities/cfa-option';
import { IAndroidClass } from 'app/shared/model/android-class.model';
import { IAndroidVersion } from 'app/shared/model/android-version.model';
import { ICFAOption } from 'app/shared/model/cfa-option.model';
import { CFAType } from 'app/shared/model/enumerations/cfa-type.model';
import { ControlDependenceOptions } from 'app/shared/model/enumerations/control-dependence-options.model';
import { DataDependenceOptions } from 'app/shared/model/enumerations/data-dependence-options.model';
import { ReflectionOptions } from 'app/shared/model/enumerations/reflection-options.model';
import { SlicerOptionType } from 'app/shared/model/enumerations/slicer-option-type.model';
import { ISlice, Slice } from 'app/shared/model/slice.model';
import { ISlicerOption } from 'app/shared/model/slicer-option.model';
import { AndroidOptionsService } from 'app/shared/services/android-options.service';
import { JavaService } from 'app/shared/services/java.service';
import { JhiAlertService, JhiDataUtils } from 'ng-jhipster';
import { SelectItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { SlicerOptionService } from '../slicer-option/slicer-option.service';
import { SliceService } from './slice.service';
import { SliceMode } from 'app/shared/model/enumerations/slice-mode.model';

@Component({
  selector: 'jhi-slice-make',
  templateUrl: './slice-make.component.html'
})
export class SliceMakeComponent implements OnInit {
  slice?: ISlice;
  isSaving?: boolean;

  // sliceMode
  SliceModeEnum = SliceMode; // "import" SliceMode-Enum for the template
  sliceMode?: SliceMode;

  // android
  versionOptions?: IAndroidVersion[] | null;
  classOptions?: IAndroidClass[] | null;
  androidEntryMethodOptions: string[] | null = [];
  filteredAndroidEntryMethodOptions: string[] = [];
  androidSeedStatementOptions?: string[] | null;
  filteredAndroidSeedStatementOptions: string[] = [];

  // java
  javaJarPaths: string[] = [];
  filteredJavaJarPaths: string[] = [];
  javaSourcePaths: string[] = [];
  filteredJavaSourcePaths: string[] = [];
  javaClasses: string[] = [];
  filteredJavaClasses: string[] = [];
  javaEntryMethodOptions: string[] = ['meth1', 'meth2', 'meth22'];
  filteredJavaEntryMethodOptions: string[] = [];
  filteredJavaSeedStatementOptions: string[] = [];

  cfaOptionsList: SelectItem[] = [];
  cfaLevelNeeded = false;
  reflectionOptionsList: SelectItem[] = [];
  dataDependenceOptionsList: SelectItem[] = [];
  controlDependenceOptionsList: SelectItem[] = [];

  editorOptions = { theme: 'vs', language: 'java' };
  sourceFile?: String;

  createForm = this.fb.group({
    javaSourcePath: [null, [Validators.required]],
    javaJarPath: [null, [Validators.required]],
    javaClasses: [null, [Validators.required]],
    javaEntryMethods: [null, [Validators.required]],
    javaSeedStatements: [null, [Validators.required]],
    androidVersion: [null, [Validators.required]],
    androidClassName: [null, [Validators.required]],
    androidEntryMethods: [null, [Validators.required]],
    androidSeedStatements: [null, [Validators.required]],
    editor: [null],
    cfaOptions: [null, [Validators.required]],
    cfaLevel: [null],
    reflectionOptions: [null, Validators.required],
    dataDependenceOptions: [null, Validators.required],
    controlDependenceOptions: [null, Validators.required],
    objectTracking: [null],
    parameterTracking: [null],
    trackingToSlicingCriterion: [null]
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected jhiAlertService: JhiAlertService,
    protected sliceService: SliceService,
    protected slicerOptionService: SlicerOptionService,
    protected activatedRoute: ActivatedRoute,
    protected androidOptionsService: AndroidOptionsService,
    protected javaService: JavaService,
    protected cfaOptionService: CFAOptionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isSaving = false;
    this.slice = new Slice();

    this.androidOptionsService.getAndroidVersions().subscribe(
      (res: HttpResponse<IAndroidVersion[]>) => {
        this.versionOptions = res.body;

        // preselect if only one
        if (this.versionOptions && this.versionOptions.length === 1) {
          this.createForm.get('androidVersion')!.patchValue(this.versionOptions[0]);
          this.onVersionSelection();
        }
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
    this.androidOptionsService.getSeedStatements().subscribe(
      (res: HttpResponse<string[]>) => {
        this.androidSeedStatementOptions = res.body;
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );

    this.cfaOptionService.getAll().subscribe(
      (res: HttpResponse<ICFAOption[]>) => {
        for (const cfaOption of res.body!) {
          const cfaOptionItem: SelectItem = { label: cfaOption.type, value: cfaOption };
          this.cfaOptionsList.push(cfaOptionItem);

          if (cfaOption.isDefault) {
            this.createForm.get(['cfaOptions'])!.setValue(cfaOption);
          }
        }
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );

    this.slicerOptionService.getAll().subscribe(
      (res: HttpResponse<ISlicerOption[]>) => {
        for (const slicerOption of res.body!) {
          const slicerOptionItem: SelectItem = { label: slicerOption.key, value: slicerOption };

          switch (slicerOption.type) {
            case SlicerOptionType.REFLECTION_OPTION: {
              this.reflectionOptionsList.push(slicerOptionItem);
              if (slicerOption.isDefault) {
                this.createForm.get(['reflectionOptions'])!.setValue(slicerOption);
              }
              break;
            }
            case SlicerOptionType.DATA_DEPENDENCE_OPTION: {
              this.dataDependenceOptionsList.push(slicerOptionItem);
              if (slicerOption.isDefault) {
                this.createForm.get(['dataDependenceOptions'])!.setValue(slicerOption);
              }
              break;
            }
            case SlicerOptionType.CONTROL_DEPENDENCE_OPTION: {
              this.controlDependenceOptionsList.push(slicerOptionItem);
              if (slicerOption.isDefault) {
                this.createForm.get(['controlDependenceOptions'])!.setValue(slicerOption);
              }
              break;
            }
          }
        }
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  onJarPathComplete(event: any): void {
    this.javaService.getDirectories(event.query.toString(), '.jar').subscribe((res: HttpResponse<string[]>) => {
      if (res.body != null && res.body.length > 0) {
        this.javaJarPaths = res.body;
      }
      this.filteredJavaJarPaths = [];
      this.filterMultiSelectOptions(event, this.javaJarPaths, this.filteredJavaJarPaths);
    });
  }

  onJarPathKey(event: KeyboardEvent): void {
    if (event && event.key === 'Enter' && this.filteredJavaJarPaths.length > 0) {
      this.createForm.get(['javaJarPath'])!.setValue(this.filteredJavaJarPaths[0]);
      // hack a little bit, because i don't know how to create the complete-events
      const changeEvent = {} as any;
      changeEvent.query = this.createForm.get(['javaJarPath'])!.value;
      this.onJarPathComplete(changeEvent);
    }
  }

  onJarPathSelected(event: any): void {
    if (event.sourceCapabilities == null) {
      return; // only switched focused window
    }
    const jarPath = this.createForm.get(['javaJarPath'])!.value;
    const javaClassesInput = this.createForm.get(['javaClasses'])!;
    javaClassesInput.disable();

    if (jarPath && jarPath.endsWith('.jar')) {
      this.javaService.getClasses(jarPath).subscribe((res: HttpResponse<string[]>) => {
        if (res.body != null && res.body.length > 0) {
          this.javaClasses = res.body;
        }
        javaClassesInput.enable();
      });
    }
  }

  onSourcePathComplete(event: any): void {
    this.javaService.getDirectories(event.query.toString()).subscribe((res: HttpResponse<string[]>) => {
      if (res.body != null && res.body.length > 0) {
        this.javaSourcePaths = res.body;
      }
      this.filteredJavaSourcePaths = [];
      this.filterMultiSelectOptions(event, this.javaSourcePaths, this.filteredJavaSourcePaths);
    });
  }

  onJavaClassSelected(event: any): void {
    console.log('Search for Methods!'); // eslint-disable-line
    if (event.sourceCapabilities == null) {
      return; // only switched focused window
    }
    const jarPath = this.createForm.get(['javaJarPath'])!.value;
    const javaMethodInput = this.createForm.get(['javaEntryMethods'])!;
    javaMethodInput.disable();
    const className = this.createForm.get(['javaClasses'])!.value;

    if (className != null) {
      this.javaService.getMethods(jarPath, className).subscribe((res: HttpResponse<string[]>) => {
        if (res.body != null && res.body.length > 0) {
          this.javaEntryMethodOptions = res.body;
        }
        javaMethodInput.enable();
      });
    }
  }

  onSourcePathKey(event: KeyboardEvent): void {
    if (event && event.key === 'Enter' && this.filteredJavaSourcePaths.length > 0) {
      this.createForm.get(['javaSourcePath'])!.setValue(this.filteredJavaSourcePaths[0]);
      // hack a little bit, because i don't know how to create the complete-events
      const changeEvent = {} as any;
      changeEvent.query = this.createForm.get(['javaSourcePath'])!.value;
      this.onSourcePathComplete(changeEvent);
    }
  }

  onJavaClassesComplete(event: any): void {
    this.filteredJavaClasses = [];
    this.filterMultiSelectOptions(event, this.javaClasses, this.filteredJavaClasses);
  }

  onJavaClassesKey(event: KeyboardEvent): void {
    if (event && event.key === 'Enter' && this.filteredJavaClasses.length > 0) {
      this.createForm.get(['javaClasses'])!.setValue(this.filteredJavaClasses[0]);
      // hack a little bit, because i don't know how to create the complete-events
      const changeEvent = {} as any;
      changeEvent.query = this.createForm.get(['javaClasses'])!.value;
      this.onJavaClassesComplete(changeEvent);
    }
  }

  onSliceModeChange(event: SliceMode): void {
    this.sliceMode = event;
    this.updateSliceModeForm();
  }

  updateSliceModeForm(): void {
    if (this.sliceMode === 'JAVA') {
      this.createForm.get('javaSourcePath')!.enable();
      this.createForm.get('javaJarPath')!.enable();
      this.createForm.get('javaClasses')!.enable();
      this.createForm.get('javaEntryMethods')!.enable();
      this.createForm.get('javaSeedStatements')!.enable();

      this.createForm.get('androidVersion')!.disable();
      this.createForm.get('androidClassName')!.disable();
      this.createForm.get('androidEntryMethods')!.disable();
      this.createForm.get('androidSeedStatements')!.disable();
    } else {
      // this.sliceMode == 'android'
      this.createForm.get('javaSourcePath')!.disable();
      this.createForm.get('javaJarPath')!.disable();
      this.createForm.get('javaClasses')!.disable();
      this.createForm.get('javaEntryMethods')!.disable();
      this.createForm.get('javaSeedStatements')!.disable();

      this.createForm.get('androidVersion')!.enable();
      this.createForm.get('androidClassName')!.enable();
      this.createForm.get('androidEntryMethods')!.enable();
      this.createForm.get('androidSeedStatements')!.enable();
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const slice = this.createFromForm();
    this.subscribeToSaveResponse(this.sliceService.create(slice));
  }

  private createFromForm(): ISlice {
    const currentSeedStatements =
      this.sliceMode === 'JAVA'
        ? this.createForm.get(['javaSeedStatements'])!.value
        : this.createForm.get(['androidSeedStatements'])!.value;
    const currentEntryMethods =
      this.sliceMode === 'JAVA' ? this.createForm.get(['javaEntryMethods'])!.value : this.createForm.get(['androidEntryMethods'])!.value;
    const androidVersionField = this.createForm.get('androidVersion')!.value as IAndroidVersion;
    const currentNameValue =
      this.sliceMode === 'JAVA'
        ? this.createForm.get('javaClasses')!.value
        : (this.createForm.get('androidClassName')!.value as IAndroidClass).name;
    const entity = {
      ...new Slice(),
      sliceMode: this.sliceMode,
      androidVersion: androidVersionField != null ? androidVersionField.version : null,
      className: currentNameValue,
      javaSourcePath: this.createForm.get('javaSourcePath')!.value,
      javaJarPath: this.createForm.get('javaJarPath')!.value,
      entryMethods: currentEntryMethods,
      seedStatements: currentSeedStatements,
      cfaType: (this.createForm.get(['cfaOptions'])!.value as ICFAOption).type,
      cfaLevel: this.createForm.get(['cfaLevel'])!.value,
      reflectionOptions: (this.createForm.get(['reflectionOptions'])!.value as ISlicerOption).key! as ReflectionOptions,
      dataDependenceOptions: (this.createForm.get(['dataDependenceOptions'])!.value as ISlicerOption).key as DataDependenceOptions,
      controlDependenceOptions: (this.createForm.get(['controlDependenceOptions'])!.value as ISlicerOption).key as ControlDependenceOptions,
      objectTracking: this.createForm.get(['objectTracking'])!.value ?? false,
      parameterTracking: this.createForm.get(['parameterTracking'])!.value ?? false,
      trackingToSlicingCriterion: this.createForm.get(['trackingToSlicingCriterion'])!.value ?? false
    };
    return entity;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISlice>>): void {
    result.subscribe(
      (res: HttpResponse<ISlice>) => this.onSaveSuccess(), // eslint-disable-line
      (res: HttpErrorResponse) => this.onSaveError() // eslint-disable-line
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  protected onError(errorMessage: string): void {
    this.jhiAlertService.error(errorMessage, null, undefined);
  }

  onVersionSelection(): void {
    this.createForm.get('androidClassName')!.disable();

    this.androidOptionsService
      .getAndroidClasses((this.createForm.get('androidVersion')!.value as IAndroidVersion).path)
      .subscribe(
        // ok
        (res: HttpResponse<IAndroidClass[]>) => {
          this.classOptions = res.body;
        },
        // error
        (res: HttpErrorResponse) => this.onError(res.message)
      )
      .add(() => {
        // finally
        this.createForm.get('androidClassName')!.enable();
      });
  }

  onClassSelection(): void {
    const androidVersion: number | undefined = (this.createForm.get('androidVersion')!.value as IAndroidVersion).version;
    const serviceClassName: string | undefined = (this.createForm.get('androidClassName')!.value as IAndroidClass).name;
    const sourceFilePath: string | undefined = (this.createForm.get('androidClassName')!.value as IAndroidClass).path;

    this.createForm.get(['androidEntryMethods'])!.disable();

    this.androidOptionsService.getServiceSource(androidVersion, serviceClassName).subscribe(
      (res: any) => {
        this.sourceFile = res.body;
        this.createForm.get('editor')!.setValue(this.sourceFile);
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );

    this.androidOptionsService
      .getEntryMethods(serviceClassName, sourceFilePath)
      .subscribe(
        // ok
        (res: HttpResponse<string[]>) => {
          this.androidEntryMethodOptions = res.body;
        },
        // error
        (res: HttpErrorResponse) => {
          this.androidEntryMethodOptions = [];
          this.onError(res.message);
        }
      )
      .add(() => {
        // finally
        this.createForm.get(['androidEntryMethods'])!.enable();
      });
  }

  filterAndroidEntryMethodOptions(event: any): void {
    if (event) {
      this.filteredAndroidEntryMethodOptions = [];
      this.filterMultiSelectOptions(event, this.androidEntryMethodOptions, this.filteredAndroidEntryMethodOptions);
    }
  }

  filterJavaEntryMethodOptions(event: any): void {
    if (event) {
      this.filteredJavaEntryMethodOptions = [];
      this.filterMultiSelectOptions(event, this.javaEntryMethodOptions, this.filteredJavaEntryMethodOptions);
    }
  }

  filterAndroidSeedStatementOptions(event: any): void {
    if (event) {
      this.filteredAndroidSeedStatementOptions = [];
      this.filterMultiSelectOptions(event, this.androidSeedStatementOptions, this.filteredAndroidSeedStatementOptions);
    }
  }

  // TODO
  filterJavaSeedStatementOptions(event: any): void {
    if (event) {
      this.filteredJavaSeedStatementOptions = [event.query.toString()];
      this.filterMultiSelectOptions(event, ['doFinal'], this.filteredJavaSeedStatementOptions);
    }
  }

  private filterMultiSelectOptions(event: any, options: any, filteredOptions: any): void {
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (
        option
          .toString()
          .toLowerCase()
          .indexOf(event.query.toString().toLowerCase()) > -1
      ) {
        filteredOptions.push(option);
      }
    }
  }

  // TODO
  // eslint-disable-next-line
  addJavaEntryMethodOption(event: KeyboardEvent) {}

  addAndroidEntryMethodOption(event: KeyboardEvent): void {
    if (event && event.key === 'Enter') {
      const selectedEntryMethodOptions = this.createForm.get(['androidEntryMethods'])!.value || [];
      this.addMultiSelectOption(event, this.androidEntryMethodOptions, selectedEntryMethodOptions);
      this.createForm.get(['androidEntryMethods'])!.patchValue(selectedEntryMethodOptions);
    }
  }

  addAndroidSeedStatementOption(event: KeyboardEvent): void {
    if (event && event.key === 'Enter') {
      const selectedSeedStatementOptions = this.createForm.get(['seedStatements'])!.value || [];
      this.addMultiSelectOption(event, this.androidSeedStatementOptions, selectedSeedStatementOptions);
      this.createForm.get(['seedStatements'])!.patchValue(selectedSeedStatementOptions);
    }
  }

  // TODO
  // eslint-disable-next-line
  addJavaSeedStatementOption(event: KeyboardEvent) {}

  private addMultiSelectOption(event: any, options: any, selectedOptions: any): void {
    if (event.key === 'Enter') {
      const tokenInput = event.srcElement || event.target;
      if (tokenInput.value) {
        // add value to available options
        if (!options.includes(tokenInput.value)) {
          options.push(tokenInput.value);
        }
        // add value to selected options
        if (!selectedOptions.includes(tokenInput.value)) {
          selectedOptions.push(tokenInput.value);
        }
        tokenInput.value = '';
      }
    }
  }

  addAllAndroidEntryMethods(): void {
    this.createForm.get(['androidEntryMethods'])!.patchValue(this.androidEntryMethodOptions);
  }

  clearAndroidEntryMethods(): void {
    this.createForm.get(['androidEntryMethods'])!.patchValue([]);
  }

  addAllAndroidSeedStatements(): void {
    this.createForm.get(['androidSeedStatements'])!.patchValue(this.androidSeedStatementOptions);
  }

  clearAndroidSeedStatements(): void {
    this.createForm.get(['androidSeedStatements'])!.patchValue([]);
  }

  onCfaOptionSelection(): void {
    const selectedCfaType = (this.createForm.get(['cfaOptions'])!.value as ICFAOption).type;
    if (selectedCfaType === CFAType.N_CFA || selectedCfaType === CFAType.VANILLA_N_CFA) {
      this.cfaLevelNeeded = true;
      this.createForm.get(['cfaLevel'])!.setValidators([Validators.required]);
    } else {
      this.createForm.get(['cfaLevel'])!.patchValue(null);
      this.createForm.get(['cfaLevel'])!.setValidators(null);
      this.cfaLevelNeeded = false;
    }
    this.createForm.get(['cfaLevel'])!.updateValueAndValidity();
  }
}
