import { ReflectionOptions } from 'app/shared/model/enumerations/reflection-options.model';
import { DataDependenceOptions } from 'app/shared/model/enumerations/data-dependence-options.model';
import { ControlDependenceOptions } from 'app/shared/model/enumerations/control-dependence-options.model';
import { CFAType } from './enumerations/cfa-type.model';
import { SliceMode } from 'app/shared/model/enumerations/slice-mode.model';

export interface ISlicedClass {
  className?: string;
  packagePath?: string;
  code?: string;
}

export class SlicedClass implements ISlicedClass {
  constructor(public className?: string, public packagePath?: string, public code?: string) {}
}

export interface ISlice {
  id?: string;
  androidVersion?: number;
  className?: string;
  entryMethods?: string[];
  seedStatements?: string[];
  slicedClasses?: ISlicedClass[];
  log?: any;
  threadId?: string;
  running?: boolean;
  cfaType?: CFAType;
  cfaLevel?: number;
  reflectionOptions?: ReflectionOptions;
  dataDependenceOptions?: DataDependenceOptions;
  controlDependenceOptions?: ControlDependenceOptions;
  sliceMode?: SliceMode;
  javaSourcePath?: string;
  javaJarPath?: string;
}

export class Slice implements ISlice {
  constructor(
    public id?: string,
    public androidVersion?: number,
    public className?: string,
    public entryMethods = [],
    public seedStatements = [],
    public slice?: any,
    public log?: any,
    public threadId?: string,
    public running?: boolean,
    public cfaType?: CFAType,
    public cfaLevel?: number,
    public reflectionOptions?: ReflectionOptions,
    public dataDependenceOptions?: DataDependenceOptions,
    public controlDependenceOptions?: ControlDependenceOptions,
    public sliceMode?: SliceMode,
    public javaSourcePath?: string,
    public javaJarPath?: string
  ) {
    this.running = this.running || false;
  }
}
