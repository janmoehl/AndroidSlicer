package org.unibremen.mcyl.androidslicer.web.rest;

import org.unibremen.mcyl.androidslicer.AndroidSlicerApp;
import org.unibremen.mcyl.androidslicer.domain.SlicerSetting;
import org.unibremen.mcyl.androidslicer.repository.SlicerSettingRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link SlicerSettingResource} REST controller.
 */
@SpringBootTest(classes = AndroidSlicerApp.class)

@AutoConfigureMockMvc
@WithMockUser
public class SlicerSettingResourceIT {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Autowired
    private SlicerSettingRepository slicerSettingRepository;

    @Autowired
    private MockMvc restSlicerSettingMockMvc;

    private SlicerSetting slicerSetting;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SlicerSetting createEntity() {
        SlicerSetting slicerSetting = new SlicerSetting()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE);
        return slicerSetting;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SlicerSetting createUpdatedEntity() {
        SlicerSetting slicerSetting = new SlicerSetting()
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE);
        return slicerSetting;
    }

    @BeforeEach
    public void initTest() {
        slicerSettingRepository.deleteAll();
        slicerSetting = createEntity();
    }

    @Test
    public void createSlicerSetting() throws Exception {
        int databaseSizeBeforeCreate = slicerSettingRepository.findAll().size();

        // Create the SlicerSetting
        restSlicerSettingMockMvc.perform(post("/api/slicer-settings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slicerSetting)))
            .andExpect(status().isCreated());

        // Validate the SlicerSetting in the database
        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeCreate + 1);
        SlicerSetting testSlicerSetting = slicerSettingList.get(slicerSettingList.size() - 1);
        assertThat(testSlicerSetting.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testSlicerSetting.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    public void createSlicerSettingWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = slicerSettingRepository.findAll().size();

        // Create the SlicerSetting with an existing ID
        slicerSetting.setId("existing_id");

        // An entity with an existing ID cannot be created, so this API call must fail
        restSlicerSettingMockMvc.perform(post("/api/slicer-settings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slicerSetting)))
            .andExpect(status().isBadRequest());

        // Validate the SlicerSetting in the database
        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    public void checkKeyIsRequired() throws Exception {
        int databaseSizeBeforeTest = slicerSettingRepository.findAll().size();
        // set the field null
        slicerSetting.setKey(null);

        // Create the SlicerSetting, which fails.

        restSlicerSettingMockMvc.perform(post("/api/slicer-settings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slicerSetting)))
            .andExpect(status().isBadRequest());

        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void checkValueIsRequired() throws Exception {
        int databaseSizeBeforeTest = slicerSettingRepository.findAll().size();
        // set the field null
        slicerSetting.setValue(null);

        // Create the SlicerSetting, which fails.

        restSlicerSettingMockMvc.perform(post("/api/slicer-settings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slicerSetting)))
            .andExpect(status().isBadRequest());

        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void getAllSlicerSettings() throws Exception {
        // Initialize the database
        slicerSettingRepository.save(slicerSetting);

        // Get all the slicerSettingList
        restSlicerSettingMockMvc.perform(get("/api/slicer-settings?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(slicerSetting.getId())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY)))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE)));
    }
    
    @Test
    public void getSlicerSetting() throws Exception {
        // Initialize the database
        slicerSettingRepository.save(slicerSetting);

        // Get the slicerSetting
        restSlicerSettingMockMvc.perform(get("/api/slicer-settings/{id}", slicerSetting.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(slicerSetting.getId()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE));
    }

    @Test
    public void getNonExistingSlicerSetting() throws Exception {
        // Get the slicerSetting
        restSlicerSettingMockMvc.perform(get("/api/slicer-settings/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    public void updateSlicerSetting() throws Exception {
        // Initialize the database
        slicerSettingRepository.save(slicerSetting);

        int databaseSizeBeforeUpdate = slicerSettingRepository.findAll().size();

        // Update the slicerSetting
        SlicerSetting updatedSlicerSetting = slicerSettingRepository.findById(slicerSetting.getId()).get();
        updatedSlicerSetting
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE);

        restSlicerSettingMockMvc.perform(put("/api/slicer-settings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(updatedSlicerSetting)))
            .andExpect(status().isOk());

        // Validate the SlicerSetting in the database
        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeUpdate);
        SlicerSetting testSlicerSetting = slicerSettingList.get(slicerSettingList.size() - 1);
        assertThat(testSlicerSetting.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testSlicerSetting.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    public void updateNonExistingSlicerSetting() throws Exception {
        int databaseSizeBeforeUpdate = slicerSettingRepository.findAll().size();

        // Create the SlicerSetting

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSlicerSettingMockMvc.perform(put("/api/slicer-settings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slicerSetting)))
            .andExpect(status().isBadRequest());

        // Validate the SlicerSetting in the database
        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    public void deleteSlicerSetting() throws Exception {
        // Initialize the database
        slicerSettingRepository.save(slicerSetting);

        int databaseSizeBeforeDelete = slicerSettingRepository.findAll().size();

        // Delete the slicerSetting
        restSlicerSettingMockMvc.perform(delete("/api/slicer-settings/{id}", slicerSetting.getId())
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<SlicerSetting> slicerSettingList = slicerSettingRepository.findAll();
        assertThat(slicerSettingList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
