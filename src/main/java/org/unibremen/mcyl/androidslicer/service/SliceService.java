package org.unibremen.mcyl.androidslicer.service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.unibremen.mcyl.androidslicer.config.Constants;
import org.unibremen.mcyl.androidslicer.domain.Slice;
import org.unibremen.mcyl.androidslicer.domain.enumeration.SliceMode;
import org.unibremen.mcyl.androidslicer.domain.SlicedClass;
import org.unibremen.mcyl.androidslicer.domain.SlicerSetting;
import org.unibremen.mcyl.androidslicer.repository.SliceRepository;
import org.unibremen.mcyl.androidslicer.repository.SlicerSettingRepository;
import org.unibremen.mcyl.androidslicer.wala.WalaSlicer;
import org.unibremen.mcyl.androidslicer.wala.parser.Parser;
import org.unibremen.mcyl.androidslicer.wala.parser.SliceMapper;
import org.unibremen.mcyl.androidslicer.web.rest.errors.BadRequestAlertException;

/**
 * Service Implementation for managing Slice.
 */
@Service
public class SliceService {

    private final SliceRepository sliceRepository;
    private final SlicerSettingRepository slicerSettingRepository;

    // get system OS type to start vs code server accordingly
    private static String OS = System.getProperty("os.name").toLowerCase();
    // keep track of the vs code server process
    private static Process vsCodeServerProcess;

    public SliceService(SliceRepository sliceRepository, SlicerSettingRepository slicerSettingRepository) {
        this.sliceRepository = sliceRepository;
        this.slicerSettingRepository = slicerSettingRepository;
    }

    /**
     * Creates an temporary exclusion file
     */
    public File createTemporaryExclusionFile() throws IOException {
        File exclusionFile = File.createTempFile("ExclusionList", ".txt");
        BufferedWriter bw = new BufferedWriter(new FileWriter(exclusionFile));
        String exclusions = slicerSettingRepository.findOneByKey(Constants.EXCLUSION_LIST_KEY).get().getValue();
        exclusions = exclusions.replaceAll("\\s+",System.getProperty("line.separator"));
        bw.write(exclusions);
        bw.close();
        return exclusionFile;
    }

    /**
     * Process a slice.
     *
     * @param slice the entity to save
     * @return the persistend entity
     */
    @Async
    public CompletableFuture<Slice> process(Slice slice) {
        long start = System.currentTimeMillis();

        // increase slicing priority
        Thread.currentThread().setPriority(Thread.MAX_PRIORITY);

        String newThreadName = UUID.randomUUID().toString();
        Thread.currentThread().setName(newThreadName);
        slice.setThreadId(newThreadName);
        sliceRepository.save(slice);

        SliceLogger logger = new SliceLogger(sliceRepository, slice);

        File exclusionFile;
        try {
            exclusionFile = createTemporaryExclusionFile();
        } catch (IOException e) {
            throw new CompletionException(e);
        }

        // find path to Jar
        File appJar = findJarPath(slice, logger);

        // check if any seed statement is an invalid regex (and remove it)
        for (Iterator<String> seedStatementIterator =  slice.getSeedStatements().iterator(); seedStatementIterator.hasNext();) {
            String seedStatement = seedStatementIterator.next();
            try {
                Pattern.compile(seedStatement);
                } catch (PatternSyntaxException e) {
                logger.log("WARNING: " + seedStatement + " is not a valid regular expression and will be removed!");
                seedStatementIterator.remove();
            }
        }

        Map<String, Set<Integer>> sliceLineNumbers = null;
        try {
            sliceLineNumbers = WalaSlicer.doSlicing(
                    appJar,
                    exclusionFile,
                    slice,
                    logger);
        } catch (Exception ex) {
            logger.log("Exception while slicing");
            logger.log(ex.toString());
            logger.log("At stacktrace");
            Arrays.stream(ex.getStackTrace()).forEach(x -> logger.log(x.toString()));
        }

        if (sliceLineNumbers != null) {

            logger.log("\n== RECONSTRUCTING CODE ==");

            // save to file if the setting is enabled
            SlicerSetting saveToFileSetting =
            slicerSettingRepository.findOneByKey(Constants.SAVE_TO_FILE_KEY).get();
            SlicerSetting outputDirSetting =
            slicerSettingRepository.findOneByKey(Constants.OUTPUT_DIR_KEY).get();
            boolean saveToFile = false;
            File outputDirectory = null;

            /* e.g. "com/android/server/AlarmManagerService.java" -> "AlarmManagerService" */
            String androidClassName = slice.getClassName()
                .substring(slice.getClassName().lastIndexOf("/") + 1, slice.getClassName().length());
            // remove .java
            if (androidClassName.contains(".")) {
                androidClassName = androidClassName.substring(0, androidClassName.lastIndexOf("."));
            }

            if(saveToFileSetting != null &&
                Boolean.parseBoolean(saveToFileSetting.getValue()) &&
                outputDirSetting != null &&
                !outputDirSetting.getValue().isEmpty()){

                    // check dir or create it
                    outputDirectory = new File(outputDirSetting.getValue() +
                    File.separator +
                    androidClassName +
                    "-" +
                    slice.getId());

                    if (!outputDirectory.exists()){
                        outputDirectory.mkdirs();
                    }
                    saveToFile = true;
            }

            for (Map.Entry<String, Set<Integer>> sliceLineNumbersEntry : sliceLineNumbers.entrySet()) {

                StringBuilder builder = new StringBuilder();

                String packageAndJavaClass = sliceLineNumbersEntry.getKey(); //e.g. com/android/server/AlarmManagerService
                String sourceLocation;
                if (slice.getSliceMode() == SliceMode.ANDROID) {
                    sourceLocation = slicerSettingRepository
                        .findOneByKey(Constants.ANDROID_SOURCE_PATH_KEY).get().getValue()
                        + File.separator
                        + "android-"
                        + slice.getAndroidVersion()
                        + File.separator
                        + packageAndJavaClass.replace("/", File.separator);
                } else { // SliceMode == JAVA
                    sourceLocation = slice.getJavaSourcePath()
                        + File.separator
                        + packageAndJavaClass.replace("/", File.separator);
                }

                // use TreeSet to sort line numbers
                logger.log("Slice line numbers for file " + packageAndJavaClass + ": " + new TreeSet<>(sliceLineNumbersEntry.getValue()));

                try {
                    Set<Integer> sourceCodeLineNumbers = Parser.getModifiedSlice(sourceLocation, sliceLineNumbersEntry.getValue(), androidClassName, logger);
                    if (sourceCodeLineNumbers != null) {
                        logger.log("Lines of source code: " + new TreeSet<>(sourceCodeLineNumbers));
                        /**
                         * Gets the actual source code lines based on the line numbers.
                         */
                        builder.append(SliceMapper.getLinesOfCode(sourceLocation, sourceCodeLineNumbers, logger));

                        // add the slice code to the slice entity
                        String javaClassFileName = packageAndJavaClass.substring(packageAndJavaClass.lastIndexOf("/") + 1, packageAndJavaClass.length());
                        String packagePath = packageAndJavaClass.substring(0, packageAndJavaClass.lastIndexOf("/"));
                        slice.getSlicedClasses().add(new SlicedClass(javaClassFileName, packagePath, builder.toString()));

                        if(saveToFile){
                            File javaFileForSlicedClass = new File(outputDirectory + File.separator + javaClassFileName);
                            try{
                                FileWriter fw = new FileWriter(javaFileForSlicedClass.getAbsoluteFile());
                                BufferedWriter bw = new BufferedWriter(fw);
                                StringBuilder fileHead = new StringBuilder();
                                fileHead.append("// sliced with following settings:").append(System.lineSeparator())
                                    .append("// CFA-Type: ").append(slice.getCfaType())
                                    .append(" (level: ").append(slice.getCfaLevel()).append(System.lineSeparator())
                                    .append("// reflections: ").append(slice.getReflectionOptions()).append(System.lineSeparator())
                                    .append("// data dependence options: ").append(slice.getDataDependenceOptions()).append(System.lineSeparator())
                                    .append("// control dependence options: ").append(slice.getControlDependenceOptions()).append(System.lineSeparator());
                                fileHead.append("// slicing criterion: ")
                                    .append(String.join(", ", slice.getSeedStatements())).append(System.lineSeparator());
                                bw.write(fileHead.toString());
                                bw.write(builder.toString());
                                bw.close();
                            }
                            catch (IOException ex){
                                ex.printStackTrace();
                                logger.log("Could not save slice code for file '" + packageAndJavaClass + "': " + ex);
                            }
                        }
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                    logger.log("Could not reconstruct code with parser for file '" + sliceLineNumbersEntry.getKey() + "': " + ex);
                }
            }
        }

        slice.setRunning(false);
        slice.setThreadId(null);

        Slice result = sliceRepository.save(slice);

        long end = System.currentTimeMillis();
        logger.log("Slicing took " + (end - start) + "ms.");

        return CompletableFuture.completedFuture(result);
    }


    public File findJarPath(Slice slice, SliceLogger logger) {
        File appJar;
        if (slice.getSliceMode() == SliceMode.ANDROID) {
            SlicerSetting androidBinaryPathSetting =
                    slicerSettingRepository.findOneByKey(Constants.ANDROID_PLATFORM_PATH_KEY).get();

            String androidBinaryPath = "";
            if(androidBinaryPathSetting != null){
                androidBinaryPath = androidBinaryPathSetting.getValue();
            }

            appJar = new File(androidBinaryPath + File.separator + "android-" + slice.getAndroidVersion() + File.separator + "android.jar");
            if (!appJar.exists()) {
                logger.log("Android Binary Jar not found");
            }
        } else { // sliceMode == JAVA
            appJar = new File(slice.getJavaJarPath());
            if (!appJar.exists()) {
                logger.log("Java Binary Jar not found");
            }
        }
        if (!appJar.exists()) {
            logger.log("Android Binary Jar not found");
        }
        return appJar;
    }


    /**
     * Start a vs code server with the slices as default directory. See
     * https://github.com/cdr/code-server/blob/master/doc/self-hosted/index.md for
     * documentation.
     *
     * @param slice Slice entity to find slice output directory.
     * @param hostname Hostname of this server which the client used. Needed for vs code server link.
     * @return serverLink
     * @throws IOException
     * @throws InterruptedException
     */
    public String openVsCodeServer(Slice slice, String hostname) throws IOException, InterruptedException {
        // find vscode server settings
        SlicerSetting vsCodeBinaryPathSetting =
        slicerSettingRepository.findOneByKey(Constants.CODE_SERVER_DIR_KEY).get();
        SlicerSetting vsCodePortSetting =
        slicerSettingRepository.findOneByKey(Constants.CODE_SERVER_PORT_KEY).get();

        if(vsCodeBinaryPathSetting != null && vsCodePortSetting != null){
            // check operating system
            String osPath = "";
            String binaryFileExtension = "";
            if (OS.indexOf("win") >= 0) {
                osPath = "win";
                binaryFileExtension = ".exe";
            } else if (OS.indexOf("mac") >= 0) {
                osPath = "mac";
            } else if (OS.indexOf("nix") >= 0 || OS.indexOf("nux") >= 0 || OS.indexOf("aix") > 0) {
                osPath = "lin";
            }

            if (osPath == ""){
                throw new BadRequestAlertException("Operation system is not supported.", null, null);
            }

            // find vscode server settings binary
            File vsCodeBinary = new File(vsCodeBinaryPathSetting.getValue()
             + File.separator
             + osPath
             + File.separator
             + "code-server"
             + binaryFileExtension);

            if(vsCodeBinary.exists()){
                // Runtime.getRuntime().exec  waitForProcessOutput()

                /* get output directory for this slice */
                File outputDirectory = null;
                SlicerSetting outputDirSetting =
                slicerSettingRepository.findOneByKey(Constants.OUTPUT_DIR_KEY).get();
                String androidClassName = slice.getClassName()
                    .substring(slice.getClassName().lastIndexOf("/") + 1, slice.getClassName().length());
                // remove .java
                androidClassName = androidClassName.substring(0, androidClassName.lastIndexOf("."));

                if(outputDirSetting != null && !outputDirSetting.getValue().isEmpty()){
                        // check dir or create it
                        outputDirectory = new File(outputDirSetting.getValue() +
                        File.separator +
                        androidClassName +
                        "-" +
                        slice.getId());

                        if (!outputDirectory.exists()){
                            throw new BadRequestAlertException("Slice output directory not found.", null, null);
                        }
                }

                if(vsCodeServerProcess == null){
                    String dataDir = vsCodeBinaryPathSetting.getValue() + File.separator + osPath + File.separator;
                    String installCommand = vsCodeBinary.getAbsolutePath() + " --install-extension=redhat.java --user-data-dir=" + dataDir;
                    String startCommand = vsCodeBinary.getAbsolutePath() + " --port=" + vsCodePortSetting.getValue() + " --auth none --allow-http --disable-telemetry --user-data-dir=" + dataDir;

                    // install java extension for vs code (see https://marketplace.visualstudio.com/items?itemName=redhat.java)
                    System.out.println("Running: " + installCommand);
                    Runtime.getRuntime().exec(installCommand).waitFor(30, TimeUnit.SECONDS);

                    // start server
                    System.out.println("Running: " + startCommand);
                    vsCodeServerProcess = Runtime.getRuntime().exec(startCommand);

                    // allow code server to fully start
                    Thread.sleep(3000);
                }

                return "http://" + hostname + ":" + vsCodePortSetting.getValue().toString() +"/?folder=" + outputDirectory.getAbsolutePath();
            }
            else{
                throw new BadRequestAlertException("VS code server binary not found.", null, null);
            }

        }
        else{
            throw new BadRequestAlertException("VS code server path or port is not set.", null, null);
        }
    }
}
