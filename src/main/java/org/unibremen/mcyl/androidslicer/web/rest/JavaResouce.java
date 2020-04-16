package org.unibremen.mcyl.androidslicer.web.rest;

import com.ibm.wala.ipa.callgraph.AnalysisScope;
import com.ibm.wala.ipa.cha.ClassHierarchyException;
import com.ibm.wala.ipa.cha.ClassHierarchyFactory;
import com.ibm.wala.ipa.cha.IClassHierarchy;
import com.ibm.wala.util.config.AnalysisScopeReader;
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
import org.unibremen.mcyl.androidslicer.service.SliceService;
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

    private final SliceService sliceService;

    public JavaResouce(final SliceService sliceService) {
        this.sliceService = sliceService;
    }

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
        log.debug("REST request to get java source file");

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

    /**
     * GET /java/getClasses: gets all classes of a .jar file
     *
     * Maybe need some seconds, depending on the size of the jar...
     *
     * @param pathToJar the path to the JAR file
     * @return a list of all classes of the given JAR file
     */
    @GetMapping("/java/getClasses")
    public ResponseEntity<List<String>> getAllClasses(@RequestParam("pathToJar") String pathToJar) {
        log.debug("REST request to get all classes of jar file " + pathToJar);

        File jarFile = new File(pathToJar);
        if (!jarFile.exists() || !jarFile.getName().endsWith(".jar")) {
            return ResponseEntity.noContent().build();
        }

        File exclusionFile;
        AnalysisScope scope;
        IClassHierarchy classHierarchy;
        try {
            exclusionFile = sliceService.createTemporaryExclusionFile();
            scope = AnalysisScopeReader.makeJavaBinaryAnalysisScope(jarFile.getAbsolutePath(), exclusionFile);
            classHierarchy = ClassHierarchyFactory.make(scope);
        } catch (IOException e) {
            throw new BadRequestAlertException("Error when creating analysis kontext: " + e , ENTITY_NAME, "idnull");
        } catch (ClassHierarchyException e) {
            throw new BadRequestAlertException("Error when creating class hierarchy: " + e , ENTITY_NAME, "idnull");
        }

        List<String> result = new ArrayList<>();
        classHierarchy.forEach((singleClass) -> {
            String rawName = singleClass.getName().toString();
            if (!rawName.startsWith("Ljava/")) {
                String className = rawName.substring(1); // remove leading 'L'
                result.add(className);
            }
        });

        return ResponseEntity.ok().body(result);
    }

    /**
     * GET /java/paths : get all direct subdirectories and jar files for a given path
     *
     * @param path the path in which the subdirectories and files are
     * @param filter if 'filter' is given, the returned list also include files that ends with 'filter'
     * @return a list of all paths and jar files in that given path
     */
    @GetMapping("/java/directories")
    public ResponseEntity<List<String>> getDirectories(@RequestParam(value = "path") String path,
                                                       @RequestParam(value = "filter", required = false) String filter) {
        log.debug("REST request to get directories of " + path + " with filter " + filter);

        // if we got "/home/user/documen", then return all directories/jar-files of "/home/user/"
        if(path.lastIndexOf('/') < path.length() -1) {
            path = path.substring(0,path.lastIndexOf('/')+1);
        }
        File file = new File(path);
        if (file.exists() && file.isDirectory()) {
            List<String> result = new ArrayList<>();
            for(File f : file.listFiles()) {
                if (filter != null
                    && filter.length()>0
                    && f.isFile()
                    && f.getName().endsWith(filter)) {
                    result.add(f.getAbsolutePath());
                } else if (f.isDirectory()) {
                    result.add(f.getAbsolutePath() + "/");
                }
            }
            return ResponseEntity.ok().body(result);
        }
        log.debug("does not exist/is no directory: " + path);
        return ResponseEntity.noContent().build();
        //throw new BadRequestAlertException("No directory: " + path + " !", ENTITY_NAME, "idnull");
    }
}
