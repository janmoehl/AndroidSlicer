package org.unibremen.mcyl.androidslicer.web.rest;

import org.unibremen.mcyl.androidslicer.AndroidSlicerApp;
import org.unibremen.mcyl.androidslicer.domain.Slice;
import org.unibremen.mcyl.androidslicer.repository.SliceRepository;
import org.unibremen.mcyl.androidslicer.service.SliceService;
import org.unibremen.mcyl.androidslicer.web.rest.errors.ExceptionTranslator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.Base64Utils;
import org.springframework.validation.Validator;


import java.util.List;

import static org.unibremen.mcyl.androidslicer.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.unibremen.mcyl.androidslicer.domain.enumeration.ReflectionOptions;
import org.unibremen.mcyl.androidslicer.domain.enumeration.DataDependenceOptions;
import org.unibremen.mcyl.androidslicer.domain.enumeration.ControlDependenceOptions;
/**
 * Integration tests for the {@link SliceResource} REST controller.
 */
@SpringBootTest(classes = AndroidSlicerApp.class)
public class SliceResourceIT {

    private static final Integer DEFAULT_ANDROID_VERSION = 1;
    private static final Integer UPDATED_ANDROID_VERSION = 2;

    private static final String DEFAULT_ANDROID_CLASS_NAME = "AAAAAAAAAA";
    private static final String UPDATED_ANDROID_CLASS_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ENTRY_METHODS = "AAAAAAAAAA";
    private static final String UPDATED_ENTRY_METHODS = "BBBBBBBBBB";

    private static final String DEFAULT_SEED_STATEMENTS = "AAAAAAAAAA";
    private static final String UPDATED_SEED_STATEMENTS = "BBBBBBBBBB";

    private static final String DEFAULT_SLICE = "AAAAAAAAAA";
    private static final String UPDATED_SLICE = "BBBBBBBBBB";

    private static final String DEFAULT_LOG = "AAAAAAAAAA";
    private static final String UPDATED_LOG = "BBBBBBBBBB";

    private static final String DEFAULT_THREAD_ID = "AAAAAAAAAA";
    private static final String UPDATED_THREAD_ID = "BBBBBBBBBB";

    private static final Boolean DEFAULT_RUNNING = false;
    private static final Boolean UPDATED_RUNNING = true;

    private static final ReflectionOptions DEFAULT_REFLECTION_OPTIONS = ReflectionOptions.FULL;
    private static final ReflectionOptions UPDATED_REFLECTION_OPTIONS = ReflectionOptions.NO_FLOW_TO_CASTS;

    private static final DataDependenceOptions DEFAULT_DATA_DEPENDENCE_OPTIONS = DataDependenceOptions.FULL;
    private static final DataDependenceOptions UPDATED_DATA_DEPENDENCE_OPTIONS = DataDependenceOptions.NO_BASE_NO_EXCEPTIONS;

    private static final ControlDependenceOptions DEFAULT_CONTROL_DEPENDENCE_OPTIONS = ControlDependenceOptions.FULL;
    private static final ControlDependenceOptions UPDATED_CONTROL_DEPENDENCE_OPTIONS = ControlDependenceOptions.NO_EXCEPTIONAL_EDGES;

    private static final Boolean DEFAULT_OBJECT_TRACKING = false;
    private static final Boolean UPDATED_OBJECT_TRACKING = true;

    private static final Boolean DEFAULT_PARAMETER_TRACKING = false;
    private static final Boolean UPDATED_PARAMETER_TRACKING = true;

    @Autowired
    private SliceRepository sliceRepository;

    @Autowired
    private SliceService sliceService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private Validator validator;

    private MockMvc restSliceMockMvc;

    private Slice slice;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final SliceResource sliceResource = new SliceResource(sliceService);
        this.restSliceMockMvc = MockMvcBuilders.standaloneSetup(sliceResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Slice createEntity() {
        Slice slice = new Slice()
            .androidVersion(DEFAULT_ANDROID_VERSION)
            .androidClassName(DEFAULT_ANDROID_CLASS_NAME)
            .entryMethods(DEFAULT_ENTRY_METHODS)
            .seedStatements(DEFAULT_SEED_STATEMENTS)
            .slice(DEFAULT_SLICE)
            .log(DEFAULT_LOG)
            .threadId(DEFAULT_THREAD_ID)
            .running(DEFAULT_RUNNING)
            .reflectionOptions(DEFAULT_REFLECTION_OPTIONS)
            .dataDependenceOptions(DEFAULT_DATA_DEPENDENCE_OPTIONS)
            .controlDependenceOptions(DEFAULT_CONTROL_DEPENDENCE_OPTIONS)
            .objectTracking(DEFAULT_OBJECT_TRACKING)
            .parameterTracking(DEFAULT_PARAMETER_TRACKING);
        return slice;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Slice createUpdatedEntity() {
        Slice slice = new Slice()
            .androidVersion(UPDATED_ANDROID_VERSION)
            .androidClassName(UPDATED_ANDROID_CLASS_NAME)
            .entryMethods(UPDATED_ENTRY_METHODS)
            .seedStatements(UPDATED_SEED_STATEMENTS)
            .slice(UPDATED_SLICE)
            .log(UPDATED_LOG)
            .threadId(UPDATED_THREAD_ID)
            .running(UPDATED_RUNNING)
            .reflectionOptions(UPDATED_REFLECTION_OPTIONS)
            .dataDependenceOptions(UPDATED_DATA_DEPENDENCE_OPTIONS)
            .controlDependenceOptions(UPDATED_CONTROL_DEPENDENCE_OPTIONS)
            .objectTracking(UPDATED_OBJECT_TRACKING)
            .parameterTracking(UPDATED_PARAMETER_TRACKING);
        return slice;
    }

    @BeforeEach
    public void initTest() {
        sliceRepository.deleteAll();
        slice = createEntity();
    }

    @Test
    public void createSlice() throws Exception {
        int databaseSizeBeforeCreate = sliceRepository.findAll().size();

        // Create the Slice
        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isCreated());

        // Validate the Slice in the database
        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeCreate + 1);
        Slice testSlice = sliceList.get(sliceList.size() - 1);
        assertThat(testSlice.getAndroidVersion()).isEqualTo(DEFAULT_ANDROID_VERSION);
        assertThat(testSlice.getAndroidClassName()).isEqualTo(DEFAULT_ANDROID_CLASS_NAME);
        assertThat(testSlice.getEntryMethods()).isEqualTo(DEFAULT_ENTRY_METHODS);
        assertThat(testSlice.getSeedStatements()).isEqualTo(DEFAULT_SEED_STATEMENTS);
        assertThat(testSlice.getSlice()).isEqualTo(DEFAULT_SLICE);
        assertThat(testSlice.getLog()).isEqualTo(DEFAULT_LOG);
        assertThat(testSlice.getThreadId()).isEqualTo(DEFAULT_THREAD_ID);
        assertThat(testSlice.isRunning()).isEqualTo(DEFAULT_RUNNING);
        assertThat(testSlice.getReflectionOptions()).isEqualTo(DEFAULT_REFLECTION_OPTIONS);
        assertThat(testSlice.getDataDependenceOptions()).isEqualTo(DEFAULT_DATA_DEPENDENCE_OPTIONS);
        assertThat(testSlice.getControlDependenceOptions()).isEqualTo(DEFAULT_CONTROL_DEPENDENCE_OPTIONS);
        assertThat(testSlice.isObjectTracking()).isEqualTo(DEFAULT_OBJECT_TRACKING);
        assertThat(testSlice.isParameterTracking()).isEqualTo(DEFAULT_PARAMETER_TRACKING);
    }

    @Test
    public void createSliceWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = sliceRepository.findAll().size();

        // Create the Slice with an existing ID
        slice.setId("existing_id");

        // An entity with an existing ID cannot be created, so this API call must fail
        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        // Validate the Slice in the database
        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    public void checkAndroidVersionIsRequired() throws Exception {
        int databaseSizeBeforeTest = sliceRepository.findAll().size();
        // set the field null
        slice.setAndroidVersion(null);

        // Create the Slice, which fails.

        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void checkAndroidClassNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = sliceRepository.findAll().size();
        // set the field null
        slice.setAndroidClassName(null);

        // Create the Slice, which fails.

        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void checkReflectionOptionsIsRequired() throws Exception {
        int databaseSizeBeforeTest = sliceRepository.findAll().size();
        // set the field null
        slice.setReflectionOptions(null);

        // Create the Slice, which fails.

        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void checkDataDependenceOptionsIsRequired() throws Exception {
        int databaseSizeBeforeTest = sliceRepository.findAll().size();
        // set the field null
        slice.setDataDependenceOptions(null);

        // Create the Slice, which fails.

        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void checkControlDependenceOptionsIsRequired() throws Exception {
        int databaseSizeBeforeTest = sliceRepository.findAll().size();
        // set the field null
        slice.setControlDependenceOptions(null);

        // Create the Slice, which fails.

        restSliceMockMvc.perform(post("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void getAllSlice() throws Exception {
        // Initialize the database
        sliceRepository.save(slice);

        // Get all the sliceList
        restSliceMockMvc.perform(get("/api/slice?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(slice.getId())))
            .andExpect(jsonPath("$.[*].androidVersion").value(hasItem(DEFAULT_ANDROID_VERSION)))
            .andExpect(jsonPath("$.[*].androidClassName").value(hasItem(DEFAULT_ANDROID_CLASS_NAME)))
            .andExpect(jsonPath("$.[*].entryMethods").value(hasItem(DEFAULT_ENTRY_METHODS.toString())))
            .andExpect(jsonPath("$.[*].seedStatements").value(hasItem(DEFAULT_SEED_STATEMENTS.toString())))
            .andExpect(jsonPath("$.[*].slice").value(hasItem(DEFAULT_SLICE.toString())))
            .andExpect(jsonPath("$.[*].log").value(hasItem(DEFAULT_LOG.toString())))
            .andExpect(jsonPath("$.[*].threadId").value(hasItem(DEFAULT_THREAD_ID)))
            .andExpect(jsonPath("$.[*].running").value(hasItem(DEFAULT_RUNNING.booleanValue())))
            .andExpect(jsonPath("$.[*].reflectionOptions").value(hasItem(DEFAULT_REFLECTION_OPTIONS.toString())))
            .andExpect(jsonPath("$.[*].dataDependenceOptions").value(hasItem(DEFAULT_DATA_DEPENDENCE_OPTIONS.toString())))
            .andExpect(jsonPath("$.[*].controlDependenceOptions").value(hasItem(DEFAULT_CONTROL_DEPENDENCE_OPTIONS.toString())))
            .andExpect(jsonPath("$.[*].objectTracking").value(hasItem(DEFAULT_OBJECT_TRACKING.booleanValue())))
            .andExpect(jsonPath("$.[*].parameterTracking").value(hasItem(DEFAULT_PARAMETER_TRACKING.booleanValue())));
    }
    
    @Test
    public void getSlice() throws Exception {
        // Initialize the database
        sliceRepository.save(slice);

        // Get the slice
        restSliceMockMvc.perform(get("/api/slice/{id}", slice.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(slice.getId()))
            .andExpect(jsonPath("$.androidVersion").value(DEFAULT_ANDROID_VERSION))
            .andExpect(jsonPath("$.androidClassName").value(DEFAULT_ANDROID_CLASS_NAME))
            .andExpect(jsonPath("$.entryMethods").value(DEFAULT_ENTRY_METHODS.toString()))
            .andExpect(jsonPath("$.seedStatements").value(DEFAULT_SEED_STATEMENTS.toString()))
            .andExpect(jsonPath("$.slice").value(DEFAULT_SLICE.toString()))
            .andExpect(jsonPath("$.log").value(DEFAULT_LOG.toString()))
            .andExpect(jsonPath("$.threadId").value(DEFAULT_THREAD_ID))
            .andExpect(jsonPath("$.running").value(DEFAULT_RUNNING.booleanValue()))
            .andExpect(jsonPath("$.reflectionOptions").value(DEFAULT_REFLECTION_OPTIONS.toString()))
            .andExpect(jsonPath("$.dataDependenceOptions").value(DEFAULT_DATA_DEPENDENCE_OPTIONS.toString()))
            .andExpect(jsonPath("$.controlDependenceOptions").value(DEFAULT_CONTROL_DEPENDENCE_OPTIONS.toString()))
            .andExpect(jsonPath("$.objectTracking").value(DEFAULT_OBJECT_TRACKING.booleanValue()))
            .andExpect(jsonPath("$.parameterTracking").value(DEFAULT_PARAMETER_TRACKING.booleanValue()));
    }

    @Test
    public void getNonExistingSlice() throws Exception {
        // Get the slice
        restSliceMockMvc.perform(get("/api/slice/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    public void updateSlice() throws Exception {
        // Initialize the database
        sliceService.save(slice);

        int databaseSizeBeforeUpdate = sliceRepository.findAll().size();

        // Update the slice
        Slice updatedSlice = sliceRepository.findById(slice.getId()).get();
        updatedSlice
            .androidVersion(UPDATED_ANDROID_VERSION)
            .androidClassName(UPDATED_ANDROID_CLASS_NAME)
            .entryMethods(UPDATED_ENTRY_METHODS)
            .seedStatements(UPDATED_SEED_STATEMENTS)
            .slice(UPDATED_SLICE)
            .log(UPDATED_LOG)
            .threadId(UPDATED_THREAD_ID)
            .running(UPDATED_RUNNING)
            .reflectionOptions(UPDATED_REFLECTION_OPTIONS)
            .dataDependenceOptions(UPDATED_DATA_DEPENDENCE_OPTIONS)
            .controlDependenceOptions(UPDATED_CONTROL_DEPENDENCE_OPTIONS)
            .objectTracking(UPDATED_OBJECT_TRACKING)
            .parameterTracking(UPDATED_PARAMETER_TRACKING);

        restSliceMockMvc.perform(put("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(updatedSlice)))
            .andExpect(status().isOk());

        // Validate the Slice in the database
        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeUpdate);
        Slice testSlice = sliceList.get(sliceList.size() - 1);
        assertThat(testSlice.getAndroidVersion()).isEqualTo(UPDATED_ANDROID_VERSION);
        assertThat(testSlice.getAndroidClassName()).isEqualTo(UPDATED_ANDROID_CLASS_NAME);
        assertThat(testSlice.getEntryMethods()).isEqualTo(UPDATED_ENTRY_METHODS);
        assertThat(testSlice.getSeedStatements()).isEqualTo(UPDATED_SEED_STATEMENTS);
        assertThat(testSlice.getSlice()).isEqualTo(UPDATED_SLICE);
        assertThat(testSlice.getLog()).isEqualTo(UPDATED_LOG);
        assertThat(testSlice.getThreadId()).isEqualTo(UPDATED_THREAD_ID);
        assertThat(testSlice.isRunning()).isEqualTo(UPDATED_RUNNING);
        assertThat(testSlice.getReflectionOptions()).isEqualTo(UPDATED_REFLECTION_OPTIONS);
        assertThat(testSlice.getDataDependenceOptions()).isEqualTo(UPDATED_DATA_DEPENDENCE_OPTIONS);
        assertThat(testSlice.getControlDependenceOptions()).isEqualTo(UPDATED_CONTROL_DEPENDENCE_OPTIONS);
        assertThat(testSlice.isObjectTracking()).isEqualTo(UPDATED_OBJECT_TRACKING);
        assertThat(testSlice.isParameterTracking()).isEqualTo(UPDATED_PARAMETER_TRACKING);
    }

    @Test
    public void updateNonExistingSlice() throws Exception {
        int databaseSizeBeforeUpdate = sliceRepository.findAll().size();

        // Create the Slice

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSliceMockMvc.perform(put("/api/slice")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slice)))
            .andExpect(status().isBadRequest());

        // Validate the Slice in the database
        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    public void deleteSlice() throws Exception {
        // Initialize the database
        sliceService.save(slice);

        int databaseSizeBeforeDelete = sliceRepository.findAll().size();

        // Delete the slice
        restSliceMockMvc.perform(delete("/api/slice/{id}", slice.getId())
            .accept(TestUtil.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Slice> sliceList = sliceRepository.findAll();
        assertThat(sliceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
