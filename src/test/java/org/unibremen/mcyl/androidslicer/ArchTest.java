package org.unibremen.mcyl.androidslicer;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class ArchTest {

    @Test
    void servicesAndRepositoriesShouldNotDependOnWebLayer() {

        JavaClasses importedClasses = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("org.unibremen.mcyl.androidslicer");

        noClasses()
            .that()
                .resideInAnyPackage("org.unibremen.mcyl.androidslicer.service..")
            .or()
                .resideInAnyPackage("org.unibremen.mcyl.androidslicer.repository..")
            .should().dependOnClassesThat()
                .resideInAnyPackage("..org.unibremen.mcyl.androidslicer.web..")
        .because("Services and repositories should not depend on web layer")
        .check(importedClasses);
    }
}
