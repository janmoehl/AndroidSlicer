package org.unibremen.mcyl.androidslicer.domain;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.NotNull;

import com.ibm.wala.ipa.callgraph.AnalysisOptions.ReflectionOptions;
import com.ibm.wala.ipa.slicer.Slicer.ControlDependenceOptions;
import com.ibm.wala.ipa.slicer.Slicer.DataDependenceOptions;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.unibremen.mcyl.androidslicer.domain.enumeration.CFAType;

import io.swagger.annotations.ApiModelProperty;
import org.unibremen.mcyl.androidslicer.domain.enumeration.SliceMode;

/**
 * A Slice.
 */
@Document(collection = "slice")
public class Slice implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Field("android_version")
    private Integer androidVersion;

    @Field("class_name")
    private String className;

    /**
     * JSON-List with entry method names
     */

    @ApiModelProperty(value = "JSON-List with entry method names", required = true)
    @Field("entry_methods")
    private Set<String> entryMethods = new HashSet<String>();

    /**
     * JSON-List with seed statement names
     */

    @ApiModelProperty(value = "JSON-List with seed statement names", required = true)
    @Field("seed_statements")
    private Set<String> seedStatements = new HashSet<String>();

    /**
     * Set of sliced classes with class name and code
     */
    @ApiModelProperty(value = "Set of sliced classes with class name and code")
    @Field("sliced_classes")
    private Set<SlicedClass> slicedClasses = new HashSet<SlicedClass>();

    @Field("log")
    private String log;

    @Field("thread_id")
    private String threadId;

    @Field("running")
    private Boolean running;

    @NotNull
    @Field("cfa_option_type")
    private CFAType cfaType;

    @Field("cfa_option_level")
    private Integer cfaLevel;

    /**
     * com.ibm.wala.ipa.callgraph.AnalysisOptions.ReflectionOptions
     */
    @NotNull
    @ApiModelProperty(value = "com.ibm.wala.ipa.callgraph.AnalysisOptions.ReflectionOptions", required = true)
    @Field("reflection_options")
    private ReflectionOptions reflectionOptions;

    /**
     * com.ibm.wala.ipa.slicer.Slicer.DataDependenceOptions
     */
    @NotNull
    @ApiModelProperty(value = "com.ibm.wala.ipa.slicer.Slicer.DataDependenceOptions", required = true)
    @Field("data_dependence_options")
    private DataDependenceOptions dataDependenceOptions;

    /**
     * com.ibm.wala.ipa.slicer.Slicer.ControlDependenceOptions
     */
    @NotNull
    @ApiModelProperty(value = "com.ibm.wala.ipa.slicer.Slicer.ControlDependenceOptions", required = true)
    @Field("control_dependence_options")
    private ControlDependenceOptions controlDependenceOptions;

    @NotNull
    @Field("slice_mode")
    private SliceMode sliceMode;

    @Field("java_source_path")
    private String javaSourcePath;

    @Field("java_jar_path")
    private String javaJarPath;

    @Field("object_tracking")
    private Boolean objectTracking;

    @Field("parameter_tracking")
    private Boolean parameterTracking;

    @Field("tracking_to_slicing_criterion")
    private Boolean trackingToSlicingCriterion;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getAndroidVersion() {
        return androidVersion;
    }

    public Slice androidVersion(Integer androidVersion) {
        this.androidVersion = androidVersion;
        return this;
    }

    public void setAndroidVersion(Integer androidVersion) {
        this.androidVersion = androidVersion;
    }

    public String getClassName() {
        return className;
    }

    public Slice androidClassName(String androidClassName) {
        this.className = androidClassName;
        return this;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Set<String> getEntryMethods() {
        return entryMethods;
    }

    public Slice entryMethods(Set<String> entryMethods) {
        this.entryMethods = entryMethods;
        return this;
    }

    public void setEntryMethods(Set<String> entryMethods) {
        this.entryMethods = entryMethods;
    }

    public Set<String> getSeedStatements() {
        return seedStatements;
    }

    public Slice seedStatements(Set<String> seedStatements) {
        this.seedStatements = seedStatements;
        return this;
    }

    public void setSeedStatements(Set<String> seedStatements) {
        this.seedStatements = seedStatements;
    }

    public Set<SlicedClass> getSlicedClasses() {
        return slicedClasses;
    }

    public Slice slicedClasses(Set<SlicedClass> slicedClasses) {
        this.slicedClasses = slicedClasses;
        return this;
    }

    public void setSlicedClasses(Set<SlicedClass> slicedClasses) {
        this.slicedClasses = slicedClasses;
    }

    public String getLog() {
        return log;
    }

    public Slice log(String log) {
        this.log = log;
        return this;
    }

    public void setLog(String log) {
        this.log = log;
    }

    public String getThreadId() {
        return threadId;
    }

    public Slice threadId(String threadId) {
        this.threadId = threadId;
        return this;
    }

    public void setThreadId(String threadId) {
        this.threadId = threadId;
    }

    public Boolean isRunning() {
        return running;
    }

    public Slice running(Boolean running) {
        this.running = running;
        return this;
    }

    public void setRunning(Boolean running) {
        this.running = running;
    }

    public CFAType getCfaType() {
        return cfaType;
    }

    public Slice cfaType(CFAType cfaType) {
        this.cfaType = cfaType;
        return this;
    }

    public void setCfaType(CFAType cfaType) {
        this.cfaType = cfaType;
    }

    public Integer getCfaLevel() {
        return cfaLevel;
    }

    public Slice cfaLevel(Integer cfaLevel) {
        this.cfaLevel = cfaLevel;
        return this;
    }
    public ReflectionOptions getReflectionOptions() {
        return reflectionOptions;
    }

    public Slice reflectionOptions(ReflectionOptions reflectionOptions) {
        this.reflectionOptions = reflectionOptions;
        return this;
    }

    public void setReflectionOptions(ReflectionOptions reflectionOptions) {
        this.reflectionOptions = reflectionOptions;
    }

    public DataDependenceOptions getDataDependenceOptions() {
        return dataDependenceOptions;
    }

    public Slice dataDependenceOptions(DataDependenceOptions dataDependenceOptions) {
        this.dataDependenceOptions = dataDependenceOptions;
        return this;
    }

    public void setDataDependenceOptions(DataDependenceOptions dataDependenceOptions) {
        this.dataDependenceOptions = dataDependenceOptions;
    }

    public ControlDependenceOptions getControlDependenceOptions() {
        return controlDependenceOptions;
    }

    public Slice controlDependenceOptions(ControlDependenceOptions controlDependenceOptions) {
        this.controlDependenceOptions = controlDependenceOptions;
        return this;
    }

    public void setControlDependenceOptions(ControlDependenceOptions controlDependenceOptions) {
        this.controlDependenceOptions = controlDependenceOptions;
    }

    public SliceMode getSliceMode() {
        return sliceMode;
    }

    public String getJavaSourcePath() {
        return javaSourcePath;
    }

    public String getJavaJarPath() {
        return javaJarPath;
    }

    public Boolean isObjectTracking() {
        return objectTracking;
    }

    public Boolean isParameterTracking() {
        return parameterTracking;
    }

    public Boolean isTrackingToSlicingCriterion() {
        return trackingToSlicingCriterion;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Slice)) {
            return false;
        }
        return id != null && id.equals(((Slice) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Slice{" +
            "id=" + getId() +
            ", androidVersion=" + getAndroidVersion() +
            ", androidClassName='" + getClassName() + "'" +
            ", entryMethods='" + getEntryMethods() + "'" +
            ", seedStatements='" + getSeedStatements() + "'" +
            ", slice='" + getSlicedClasses() + "'" +
            ", log='" + getLog() + "'" +
            ", threadId='" + getThreadId() + "'" +
            ", running='" + isRunning() + "'" +
            ", cfaType='" + getCfaType() + "'" +
            ", cfaLevel=" + getCfaLevel() +
            ", reflectionOptions='" + getReflectionOptions() + "'" +
            ", dataDependenceOptions='" + getDataDependenceOptions() + "'" +
            ", controlDependenceOptions='" + getControlDependenceOptions() + "'" +
            ", sliceMode='" + getSliceMode() + "'" +
            ", javaSourcePath='" + getJavaSourcePath() + "'" +
            ", javaJarPath='" + getJavaJarPath() + "'" +
            ", objectTracking='" + isObjectTracking() + "'" +
            ", parameterTracking='" + isParameterTracking() + "'" +
            ", trackingToSlicingCriterion='" + isTrackingToSlicingCriterion() + "'" +
            "}";
    }
}
