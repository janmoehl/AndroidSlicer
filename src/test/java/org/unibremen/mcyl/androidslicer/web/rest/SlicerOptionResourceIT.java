package org.unibremen.mcyl.androidslicer.web.rest;

import org.unibremen.mcyl.androidslicer.AndroidSlicerApp;
import org.unibremen.mcyl.androidslicer.domain.SlicerOption;
import org.unibremen.mcyl.androidslicer.repository.SlicerOptionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.Base64Utils;
import org.springframework.validation.Validator;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.unibremen.mcyl.androidslicer.domain.enumeration.SlicerOptionType;
/**
 * Integration tests for the {@link SlicerOptionResource} REST controller.
 */
@SpringBootTest(classes = AndroidSlicerApp.class)
@Import(TestMongoConfig.class)
public class SlicerOptionResourceIT {

    private static final SlicerOptionType DEFAULT_TYPE = SlicerOptionType.REFLECTION_OPTION;
    private static final SlicerOptionType UPDATED_TYPE = SlicerOptionType.DATA_DEPENDENCE_OPTION;

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_DEFAULT = false;
    private static final Boolean UPDATED_IS_DEFAULT = true;

    @Autowired
    private SlicerOptionRepository slicerOptionRepository;

    @Autowired
    private MockMvc restSlicerOptionMockMvc;

    private SlicerOption slicerOption;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SlicerOption createEntity() {
        SlicerOption slicerOption = new SlicerOption()
            .type(DEFAULT_TYPE)
            .key(DEFAULT_KEY)
            .description(DEFAULT_DESCRIPTION)
            .isDefault(DEFAULT_IS_DEFAULT);
        return slicerOption;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SlicerOption createUpdatedEntity() {
        SlicerOption slicerOption = new SlicerOption()
            .type(UPDATED_TYPE)
            .key(UPDATED_KEY)
            .description(UPDATED_DESCRIPTION)
            .isDefault(UPDATED_IS_DEFAULT);
        return slicerOption;
    }

    @BeforeEach
    public void initTest() {
        slicerOptionRepository.deleteAll();
        slicerOption = createEntity();
    }


    @Test
    public void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = slicerOptionRepository.findAll().size();
        // set the field null
        slicerOption.setType(null);

        // Create the SlicerOption, which fails.

        restSlicerOptionMockMvc.perform(put("/api/slicer-options")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(slicerOption)))
            .andExpect(status().isBadRequest());

        List<SlicerOption> slicerOptionList = slicerOptionRepository.findAll();
        assertThat(slicerOptionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void checkKeyIsRequired() throws Exception {
        int databaseSizeBeforeTest = slicerOptionRepository.findAll().size();
        // set the field null
        slicerOption.setKey(null);

        // Create the SlicerOption, which fails.

        restSlicerOptionMockMvc.perform(put("/api/slicer-options")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(slicerOption)))
            .andExpect(status().isBadRequest());

        List<SlicerOption> slicerOptionList = slicerOptionRepository.findAll();
        assertThat(slicerOptionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    public void getAllSlicerOptions() throws Exception {
        // Initialize the database
        slicerOptionRepository.save(slicerOption);

        // Get all the slicerOptionList
        restSlicerOptionMockMvc.perform(get("/api/slicer-options?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(slicerOption.getId())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].isDefault").value(hasItem(DEFAULT_IS_DEFAULT.booleanValue())));
    }
    
    @Test
    public void getSlicerOption() throws Exception {
        // Initialize the database
        slicerOptionRepository.save(slicerOption);

        // Get the slicerOption
        restSlicerOptionMockMvc.perform(get("/api/slicer-options/{id}", slicerOption.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(slicerOption.getId()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.isDefault").value(DEFAULT_IS_DEFAULT.booleanValue()));
    }

    @Test
    public void getNonExistingSlicerOption() throws Exception {
        // Get the slicerOption
        restSlicerOptionMockMvc.perform(get("/api/slicer-options/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    public void updateSlicerOption() throws Exception {
        // Initialize the database
        slicerOptionRepository.save(slicerOption);

        int databaseSizeBeforeUpdate = slicerOptionRepository.findAll().size();

        // Update the slicerOption
        SlicerOption updatedSlicerOption = slicerOptionRepository.findById(slicerOption.getId()).get();
        updatedSlicerOption
            .type(UPDATED_TYPE)
            .key(UPDATED_KEY)
            .description(UPDATED_DESCRIPTION)
            .isDefault(UPDATED_IS_DEFAULT);

        restSlicerOptionMockMvc.perform(put("/api/slicer-options")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(updatedSlicerOption)))
            .andExpect(status().isOk());

        // Validate the SlicerOption in the database
        List<SlicerOption> slicerOptionList = slicerOptionRepository.findAll();
        assertThat(slicerOptionList).hasSize(databaseSizeBeforeUpdate);
        SlicerOption testSlicerOption = slicerOptionList.get(slicerOptionList.size() - 1);
        //assertThat(testSlicerOption.getType()).isEqualTo(UPDATED_TYPE); // cannot be updated
        //assertThat(testSlicerOption.getKey()).isEqualTo(UPDATED_KEY); // cannot be updated
        assertThat(testSlicerOption.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testSlicerOption.getIsDefault()).isEqualTo(UPDATED_IS_DEFAULT);
    }

    @Test
    public void updateNonExistingSlicerOption() throws Exception {
        int databaseSizeBeforeUpdate = slicerOptionRepository.findAll().size();

        // Create the SlicerOption

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSlicerOptionMockMvc.perform(put("/api/slicer-options")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(slicerOption)))
            .andExpect(status().isBadRequest());

        // Validate the SlicerOption in the database
        List<SlicerOption> slicerOptionList = slicerOptionRepository.findAll();
        assertThat(slicerOptionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SlicerOption.class);
        SlicerOption slicerOption1 = new SlicerOption();
        slicerOption1.setId("id1");
        SlicerOption slicerOption2 = new SlicerOption();
        slicerOption2.setId(slicerOption1.getId());
        assertThat(slicerOption1).isEqualTo(slicerOption2);
        slicerOption2.setId("id2");
        assertThat(slicerOption1).isNotEqualTo(slicerOption2);
        slicerOption1.setId(null);
        assertThat(slicerOption1).isNotEqualTo(slicerOption2);
    }
}
