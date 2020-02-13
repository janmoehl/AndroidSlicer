package org.unibremen.mcyl.androidslicer.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.unibremen.mcyl.androidslicer.web.rest.TestUtil;

public class SlicerSettingTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SlicerSetting.class);
        SlicerSetting slicerSetting1 = new SlicerSetting();
        slicerSetting1.setId("id1");
        SlicerSetting slicerSetting2 = new SlicerSetting();
        slicerSetting2.setId(slicerSetting1.getId());
        assertThat(slicerSetting1).isEqualTo(slicerSetting2);
        slicerSetting2.setId("id2");
        assertThat(slicerSetting1).isNotEqualTo(slicerSetting2);
        slicerSetting1.setId(null);
        assertThat(slicerSetting1).isNotEqualTo(slicerSetting2);
    }
}
