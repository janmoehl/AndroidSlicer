package org.unibremen.mcyl.androidslicer.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.unibremen.mcyl.androidslicer.web.rest.TestUtil;

public class SlicerOptionTest {

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
