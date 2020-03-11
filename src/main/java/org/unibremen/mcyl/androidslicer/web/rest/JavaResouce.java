package org.unibremen.mcyl.androidslicer.web.rest;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.RegexFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.unibremen.mcyl.androidslicer.config.Constants;
import org.unibremen.mcyl.androidslicer.domain.SlicerSetting;
import org.unibremen.mcyl.androidslicer.repository.SlicerSettingRepository;
import org.unibremen.mcyl.androidslicer.web.rest.errors.BadRequestAlertException;
import org.unibremen.mcyl.androidslicer.web.rest.vm.AndroidServiceClassesVM;
import org.unibremen.mcyl.androidslicer.web.rest.vm.AndroidVersionVM;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * REST controller for managing Java-Slice specific requests.
 */
@RestController
@RequestMapping("/api")
public class JavaResouce {

    private final Logger log = LoggerFactory.getLogger(JavaResouce.class);

    private static final String ENTITY_NAME = "java";

    /**
     * GET /java/source-file : get android system service code from
     * "androidVersion" and "androidClassName".
     *
     * @param filePath the path to the file, that should returned
     * @return the ResponseEntity with status 200 (OK) and with body the source
     *         file, or with status 404 (Not Found)
     */
    @GetMapping("/java/source-file")
    public ResponseEntity<String> getJavaSourceFile(@RequestParam("filePath") String filePath) {
        log.debug("REST request to get android source file");

        File file = new File(filePath);
        if (file.exists()) {
            StringBuilder result = new StringBuilder("");
            try (Scanner scanner = new Scanner(file)) {
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine();
                    result.append(line).append("\n");
                }
                scanner.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(org.springframework.http.MediaType.TEXT_PLAIN);
            return new ResponseEntity<String>(result.toString(), httpHeaders, HttpStatus.OK);
        }
        throw new BadRequestAlertException("Source File not found in " + filePath + " !", ENTITY_NAME, "idnull");
    }
}
