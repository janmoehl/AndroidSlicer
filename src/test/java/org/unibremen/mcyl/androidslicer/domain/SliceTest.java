package org.unibremen.mcyl.androidslicer.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.unibremen.mcyl.androidslicer.web.rest.TestUtil;

public class SliceTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Slice.class);
        Slice slice1 = new Slice();
        slice1.setId("id1");
        Slice slice2 = new Slice();
        slice2.setId(slice1.getId());
        assertThat(slice1).isEqualTo(slice2);
        slice2.setId("id2");
        assertThat(slice1).isNotEqualTo(slice2);
        slice1.setId(null);
        assertThat(slice1).isNotEqualTo(slice2);
    }
}
