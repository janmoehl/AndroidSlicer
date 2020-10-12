package org.unibremen.mcyl.androidslicer.wala;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import com.ibm.wala.analysis.pointers.HeapGraph;
import com.ibm.wala.classLoader.IMethod;
import com.ibm.wala.classLoader.Language;
import com.ibm.wala.classLoader.ShrikeBTMethod;
import com.ibm.wala.ipa.callgraph.*;
import com.ibm.wala.ipa.callgraph.impl.Util;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.LocalPointerKey;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysis;
import com.ibm.wala.ipa.callgraph.propagation.PointerKey;
import com.ibm.wala.ipa.cha.ClassHierarchy;
import com.ibm.wala.ipa.cha.ClassHierarchyException;
import com.ibm.wala.ipa.cha.ClassHierarchyFactory;
import com.ibm.wala.ipa.cha.IClassHierarchy;
import com.ibm.wala.ipa.slicer.*;
import com.ibm.wala.ssa.*;
import com.ibm.wala.types.TypeName;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;
import com.ibm.wala.util.config.AnalysisScopeReader;
import com.ibm.wala.util.intset.IntSet;
import com.ibm.wala.util.strings.Atom;

import com.sun.org.apache.xalan.internal.xsltc.dom.MultiValuedNodeHeapIterator;
import org.apache.commons.io.FilenameUtils;
import org.unibremen.mcyl.androidslicer.domain.Slice;
import org.unibremen.mcyl.androidslicer.domain.enumeration.CFAType;
import org.unibremen.mcyl.androidslicer.service.SliceLogger;
import org.unibremen.mcyl.androidslicer.domain.enumeration.SliceMode;
import org.unibremen.mcyl.androidslicer.util.Pair;

/**
 * This is an implementation of the WALA slicing algorithm described here: http://wala.sourceforge.net/wiki/index.php/UserGuide:Slicer
 * The code based on the work by Markus Gulman (Masterthesis 2014) and Philip Phu Dang Hoan Nguyen (Masterthesis 2018) but has been
 * heavily altered by Michael Cyl with bug fixed, improvements and refactorings. Most notable changes are the option to choose cfa level
 * for pointer analysis, the usage of multiple entry methods and seed statements (regex inclusive), a search for inner classes and a
 * deep search for seed statements.
 */
public class WalaSlicer {

    // maximum number of wala slice statements that will be logged to not blow up the db (maximum BSON document size for a MongoDB entity is 16MB)
    private static final int MAX_DETAILED_LOG = 1000;

    // cache produced class hierarchies
    // - MAX_CACHED_CLASSHIERARCHY gives the number, how many hierarchies should be cached
    // cachedJarHashes contains the JAR-Hashes,
    // cachedExclusionFiles contains the ExclusionFile-Hashes,
    // cachedAnalysisScopes contains the scopes and
    // cachedClassHierarchies contains the classHierarchies
    private static final int MAX_CACHED_CLASSHIERARCHY = 5;
    private static LinkedList<Byte[]> cachedJarHashes = new LinkedList<>();
    private static LinkedList<Byte[]> cachedExFileHashes = new LinkedList<>();

    private static LinkedList<AnalysisScope> cachedAnalysisScopes = new LinkedList<>();
    private static LinkedList<ClassHierarchy> cachedClassHierarchies = new LinkedList<>();

    /**
     * Tries to create a classHierarchy
     * @param jarFile
     * @param exclusionFile
     * @return
     * @throws IOException
     * @throws ClassHierarchyException
     */
    public static synchronized Pair<AnalysisScope, ClassHierarchy> getClassHierarchy(File jarFile, File exclusionFile) throws IOException, ClassHierarchyException {
        // get hashes of jar and exclusionFile
        Byte[] jarFileHash = getHashOfFile(jarFile);
        Byte[] exFileHash = getHashOfFile(exclusionFile);

        int cacheIndex = -1;
        for (int i=0; i<cachedJarHashes.size(); i++) {
            if (Arrays.equals(jarFileHash, cachedJarHashes.get(i))) {
                if (Arrays.equals(exFileHash, cachedExFileHashes.get(i))) {
                    cacheIndex = i;
                }
            }
        }

        Pair<AnalysisScope, ClassHierarchy> result = new Pair();

        if (cacheIndex >= 0) {
            // found valid classHierarchy
            result.one = cachedAnalysisScopes.get(cacheIndex);
            result.two = cachedClassHierarchies.get(cacheIndex);
        } else {
            // make some space, if needed
            if (cachedJarHashes.size() == MAX_CACHED_CLASSHIERARCHY) {
                cachedJarHashes.removeFirst();
                cachedAnalysisScopes.removeFirst();
                cachedExFileHashes.removeFirst();
                cachedClassHierarchies.removeFirst();
            }
            cachedJarHashes.push(jarFileHash);
            cachedExFileHashes.push(exFileHash);
            result.one = AnalysisScopeReader.makeJavaBinaryAnalysisScope(jarFile.getAbsolutePath(), exclusionFile);
            cachedAnalysisScopes.push(result.one);
            result.two = ClassHierarchyFactory.make(result.one);
            cachedClassHierarchies.push(result.two);
        }
        return result;
    }

    /**
     * Returns the SHA-256 Hash of the given file
     * @param f the given file
     * @return the 64-byte long hash value
     */
    private static Byte[] getHashOfFile(File f) {
        try (InputStream is = new FileInputStream(f)) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            int length;
            byte[] buffer = new byte[64];
            while ((length = is.read(buffer)) > 0) {
                digest.update(buffer, 0, length);
            }
            byte[] hash = digest.digest();
            Byte[] result = new Byte[64];
            for (int i=0; i<hash.length; i++) {
                result[i] = hash[i];
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Main function for slicing
     * @param appJar the analysed Jar-file
     * @param slice contains all parameters for the slice
     * @param exclusionFile file with excluded packages
     * @param logger a logger
     */
    public static Map<String, Set<Integer>> doSlicing(
                File appJar,
                File exclusionFile,
                Slice slice,
                SliceLogger logger
            ) throws WalaException, IOException, ClassHierarchyException, IllegalArgumentException,
            CallGraphBuilderCancelException, CancelException {

        logger.log("\n== Start slicing process, building context ==");
        long start = System.currentTimeMillis();

        // add "L" to class name and remove .java extension
        // e.g. com/android/server/AlarmManagerService.java
        // -> Lcom/android/server/AlarmManagerService
        String className = "L" + FilenameUtils.removeExtension(slice.getClassName());

        Pair<AnalysisScope, ClassHierarchy> scopeAndClassHierarchy = getClassHierarchy(appJar, exclusionFile);
        AnalysisScope scope = scopeAndClassHierarchy.one;
        ClassHierarchy classHierarchy = scopeAndClassHierarchy.two;
        logger.log("Build scope and class hierarchy (time: " + (System.currentTimeMillis() - start) + "ms)");

        /* make entry points */
        Iterable<Entrypoint> entrypoints = getEntrypoints(slice, scope, classHierarchy, className, logger);
        logger.log("got Entrypoints (time: " + (System.currentTimeMillis() - start) + "ms)");

        /* create the call graph */
        logger.log("\n== BUILDING THE CALL GRAPH ==");
        AnalysisOptions options = new AnalysisOptions(scope, entrypoints);
        /* you can dial down reflection handling if you like */
        options.setReflectionOptions(slice.getReflectionOptions());
        CallGraphBuilder callGraphBuilder = getCallGraphBuilder(slice, entrypoints, classHierarchy, options,  scope, logger);
        CallGraph callGraph = callGraphBuilder.makeCallGraph(options, null);
        logger.log("Build call graph (time: " + (System.currentTimeMillis() - start) + "ms)");
        logger.log(CallGraphStats.getStats(callGraph));

        Set<CGNode> methodNodes = new HashSet<>();
        Set<String> entryMethods = slice.getEntryMethods();
        if (slice.getSliceMode() != SliceMode.JAVA) {
            logger.log("\n== FIND METHOD(s) FOR SEED_STATEMENT(s) ==");
            WalaSlicer.findMethodNodes(callGraph, entryMethods, methodNodes, className, logger);
            if (methodNodes.size() == 0) {
                throw new WalaException("Failed to find any methods from" + entryMethods + "!");
            }
        } else {
            // SliceMode == Java => entryMethodes are the methods to search the seedstatement
            callGraph.forEach(node -> {
                Atom methodNodeName = node.getMethod().getName();
                for (String seedMethod : entryMethods) {
                    if (methodNodeName.equals(Atom.findOrCreateUnicodeAtom(seedMethod)))
                        methodNodes.add(node);
                }
            });
        }

        logger.log("\n== FIND SEED_STATEMENT(s) ==");
        Set<Statement> seedStatements = WalaSlicer.findSeedStatements(methodNodes, slice.getSeedStatements(), logger);
        if (seedStatements.size() == 0) {
            throw new WalaException("No Seed Statements found!");
        }

        // set with the final sliced instructions
        Collection<Statement> sliceList = new HashSet<Statement>();

        if (slice.isObjectTracking()) {
            logger.log("\n== ADD OBJECT TRACKING ==");
            WalaSlicer.addObjectTracking(callGraphBuilder.getPointerAnalysis(), seedStatements, sliceList, logger,
                slice.isTrackingToSlicingCriterion());
            logger.log("Object Tracking finished (until now " + (System.currentTimeMillis() - start) + "ms)");
        }

        SDG sdg = new SDG(callGraph, callGraphBuilder.getPointerAnalysis(),
            slice.getDataDependenceOptions(), slice.getControlDependenceOptions());

        if (slice.isParameterTracking()) {
            logger.log("\n== ADD PARAMETER TRACING ==");
            WalaSlicer.addParameterTracking(sdg, seedStatements, sliceList, logger,
                slice.isTrackingToSlicingCriterion());
            logger.log("Parameter tracking finished (until now " + (System.currentTimeMillis() - start) + "ms)");
        }

        logger.log("\n== SLICING ==");
        logger.log("Starting at " + (System.currentTimeMillis() - start) + "ms.");
        logger.log("slicing criterions/seed statements:");
        seedStatements.forEach(s -> {
            logger.log("  > " + s);
        });
        sliceList.addAll(Slicer.computeBackwardSlice(sdg, seedStatements));
        logger.log("Slicing finished at " + (System.currentTimeMillis() - start) + "ms.");
        logger.log("\nNumber of slice statements:  " + sliceList.size());

        /* Its too much to log this for big slices... */
        //for (Statement seedStatement : sliceList) {
        //    logger.log("~ " + seedStatement.toString());
        //}

        logger.log("\n== GETTING SOURCE FILE LINE NUMBERS ==");
        return WalaSlicer.getLineNumbersGroupedBySourceFiles(sliceList, logger);
    }

    /**
     * Adds tracking for the parameters, used by the invoke instructions in the seed statement
     * @param sdg needed to find the parameter-edges in the pdg
     * @param seedStatements contains the invoke-instructins
     * @param sliceList the backwardslice
     * @param logger just a logger for logging
     * @param trackingToSlicingCriterion add instructions to slicingCriterion? (or else to slice directly)
     */
    private static void addParameterTracking(SDG sdg, Set<Statement> seedStatements, Collection<Statement> sliceList, SliceLogger logger, Boolean trackingToSlicingCriterion) {
        HashMap<CGNode, Set<Integer>> parameterValues = new HashMap<>();
        for (Statement seedStatement: seedStatements) {
            // only invokeInstructions are interesting, skip all other, and get the correct pdg
            if (!(seedStatement instanceof StatementWithInstructionIndex)) continue;
            int instructionIndex = ((StatementWithInstructionIndex) seedStatement).getInstructionIndex();
            CGNode cgNode = seedStatement.getNode();
            SSAInstruction ssaInstruction = cgNode.getIR().getInstructions()[instructionIndex];
            if (!(ssaInstruction instanceof SSAAbstractInvokeInstruction)) continue;
            SSAAbstractInvokeInstruction methodCall = (SSAAbstractInvokeInstruction) ssaInstruction;
            PDG pdg = sdg.getPDG(cgNode);

            // now check for the parameter-statements
            Set<Statement> callerParams = pdg.getCallerParamStatements(methodCall);
            for (Statement callerParam : callerParams) {
                int valueNumber;
                if (callerParam instanceof ParamCaller) {
                    ParamCaller paramCaller = (ParamCaller) callerParam;
                    valueNumber = paramCaller.getValueNumber();
                } else if (callerParam instanceof HeapStatement.HeapParamCaller) {
                    HeapStatement.HeapParamCaller heapParamCaller = (HeapStatement.HeapParamCaller) callerParam;
                    PointerKey pointer = heapParamCaller.getLocation();
                    if (!(pointer instanceof LocalPointerKey)) {
                        throw new RuntimeException("pointer was not an LocalPointerKey: " + pointer);
                    }
                    LocalPointerKey lpk = (LocalPointerKey) pointer;
                    valueNumber = lpk.getValueNumber();
                } else {
                    throw new RuntimeException("Unexpected WALA behaviour: PDG#getCallerStatements should only return ParamCaller and HeapParamCaller");
                }
                if (!parameterValues.containsKey(cgNode)) {
                    parameterValues.put(cgNode, new HashSet<>());
                }
                parameterValues.get(cgNode).add(valueNumber);
            }
        }

        // add the found parameter
        addAliasesToSlice(parameterValues, trackingToSlicingCriterion, sliceList, seedStatements,logger);
    }

    /**
     * Adds tracing of the sliced values, based on the pointer analysis. Some traced
     * object locations and aliases are added as slicing criterion for the later analysis,
     * some are added directly to the output slice
     *
     * @param pa the used pointer analysis
     * @param seedStatements the statements from the slicing criterion
     * @param sliceList the displayed (final) slice output
     * @param logger used logger for debugging and info output
     * @param trackingToSlicingCriterion weather to add tracked instructions to slicing criterion, or to the slice directly
     */
    private static void addObjectTracking(final PointerAnalysis<InstanceKey> pa, final Set<Statement> seedStatements,
                                          final Collection<Statement> sliceList, final SliceLogger logger,
                                          final boolean trackingToSlicingCriterion) {

        HashMap<CGNode, Set<Integer>> aliasValueNumbers = new HashMap<>(); // this should save all value numbers of
        // variables, that may point to an watched object

        for (Statement s : seedStatements) {
            if (!(s instanceof StatementWithInstructionIndex)) continue;
            int instructionIndex = ((StatementWithInstructionIndex) s).getInstructionIndex();
            CGNode cgNode = s.getNode();
            SSAInstruction ssaInstruction = cgNode.getIR().getInstructions()[instructionIndex];

            final int valueNumber; // valueNumber of value, for which we look up the aliases

            if (!(ssaInstruction instanceof SSAAbstractInvokeInstruction))
                continue; // Possible improvement: Add support for other SSAInstructions

            valueNumber = ((SSAAbstractInvokeInstruction) ssaInstruction).getReceiver();


            HeapGraph<InstanceKey> heapGraph = pa.getHeapGraph();
            for (Object heapNode : heapGraph) {
                if (!(heapNode instanceof LocalPointerKey)) continue;
                LocalPointerKey localPointerKey = (LocalPointerKey) heapNode;
                if (localPointerKey.getNode() != cgNode
                        || localPointerKey.getValueNumber() != valueNumber)
                    continue;

                // lpk points to our watched object, lets check for aliases
                Iterator instanceIter = heapGraph.getSuccNodes(localPointerKey);
                while (instanceIter.hasNext()) {
                    Object instanceKey = instanceIter.next();
                    if (!(instanceKey instanceof InstanceKey))
                        continue; // should not happen

                    // for each instance localPointerKey may points to
                    Iterator pointerIter = heapGraph.getPredNodes(instanceKey);
                    while (pointerIter.hasNext()) {
                        Object lpkAliasObj = pointerIter.next();
                        // for each variable, that may points on the instance
                        if (!(lpkAliasObj instanceof LocalPointerKey))
                            continue; // should not happen
                        LocalPointerKey lpkAlias = (LocalPointerKey) lpkAliasObj;
                        CGNode aliasNode = lpkAlias.getNode();
                        int aliasValue = lpkAlias.getValueNumber();

                        if (!(aliasValueNumbers.containsKey(aliasNode))) {
                            aliasValueNumbers.put(aliasNode, new HashSet<>());
                        }

                        aliasValueNumbers.get(aliasNode).add(aliasValue);
                    }
                }
            }
        }

        // do a bit logging
        logger.log("Found following possible aliases:");
        aliasValueNumbers.forEach((cgNode, integers) -> {
            String valueNumbers = integers
                .stream()
                .map(Object::toString)
                .collect(Collectors.joining(", "));
            logger.log("On Method " + cgNode.getMethod().getName() +
                " the variables with the value numbers " + valueNumbers);
        });
        WalaSlicer.addAliasesToSlice(aliasValueNumbers, trackingToSlicingCriterion, sliceList, seedStatements, logger);
    }

    /**
     * Adds instruction with values from aliasValueNumbers to the slice
     * @param aliasValueNumbers contains the values
     * @param trackingToSlicingCriterion add instructions to the slicing criterion? (or else add them to the slicelist directly)
     * @param sliceList the resulting slice
     * @param seedStatements the slicing criterion for the slice
     * @param logger in case of logging
     */
    private static void addAliasesToSlice(HashMap<CGNode, Set<Integer>> aliasValueNumbers, boolean trackingToSlicingCriterion, Collection<Statement> sliceList, Set<Statement> seedStatements, SliceLogger logger) {
        // find the statements, that use these aliases
        aliasValueNumbers.forEach((nodeWithAliasStatements, integers) -> {
            SSAInstruction[] irInstructions = nodeWithAliasStatements.getIR().getInstructions();
            for (int i=0; i<irInstructions.length; i++) {
                SSAInstruction ssaInstruction = irInstructions[i];
                if (ssaInstruction == null) continue;
                if (isValueUsedByInstruction(ssaInstruction, integers)) {
                    if (trackingToSlicingCriterion) {
                        // add to slicing criterion
                        seedStatements.add(new NormalStatement(nodeWithAliasStatements, i));
                    } else {
                        sliceList.add(new NormalStatement(nodeWithAliasStatements, i));
                    }

                    logger.log("Addes Statement from class "
                        + nodeWithAliasStatements.getMethod().getDeclaringClass().getName()
                        + " in method " + nodeWithAliasStatements.getMethod().getName()
                        + ", instruction index " + i
                        + ", toString: " + ssaInstruction.toString());
                }
            }
        });
    }

    /**
     * Checks, weather the ssaInstruction does one of the following things with a value v from integers
     * - calls a method on v
     * - changes a parameter of v
     * - changes a static parameter of the class from v
     * - defines v
     * @param ssaInstruction the inspected instruction
     * @param integers set of value numbers, which represents the values for witch this method should look for
     * @return true, if any of 'integers' is used
     */
    private static boolean isValueUsedByInstruction(SSAInstruction ssaInstruction, Set<Integer> integers) {
        // check, if v is defined by ssaInstruction
        for (int i=0; i<ssaInstruction.getNumberOfDefs(); i++) {
            if (integers.contains(ssaInstruction.getDef(i))) {
                return true;
            }
        }

        // check, if ssaInstruction is a method call on v
        if (ssaInstruction instanceof SSAAbstractInvokeInstruction) {
            SSAAbstractInvokeInstruction invokeInstruction = (SSAAbstractInvokeInstruction) ssaInstruction;
            if (!invokeInstruction.isStatic()) { // don't call getReceiver on a static Method
                if (integers.contains(invokeInstruction.getReceiver())) {
                    return true;
                }
            }
        }

        // check, if ssaInstruction sets an attribute on v
        if (ssaInstruction instanceof SSAPutInstruction) {
            SSAPutInstruction putInstruction = (SSAPutInstruction) ssaInstruction;
            if (putInstruction.isStatic()) {
                // TODO
                // putInstruction.getDeclaredField().getDeclaringClass().getName(); // Lde/uni_bremen/.../A
            } else {
                if (integers.contains(putInstruction.getUse(0))) {
                    // putInstruction.getUse(0) returns the reference (v for v.field) if not static
                    return true;
                }
            }
        }

        return false;
    }

    private static CallGraphBuilder getCallGraphBuilder(Slice slice, Iterable<Entrypoint> entrypoints,
                                                        IClassHierarchy classHierarchy, AnalysisOptions options,
                                          AnalysisScope scope, SliceLogger logger) throws WalaException {
        /*  build the call graph  */
        AnalysisCache cache = new AnalysisCacheImpl();
        /* builders can be constructed with different Util methods (see: https://wala.github.io/javadoc/com/ibm/wala/ipa/callgraph/impl/Util.html)*/

        CFAType cfaType = slice.getCfaType();
        String cfaOptionName = cfaType.toString();
        Integer cfaLevel = slice.getCfaLevel();
        if(cfaLevel != null && cfaLevel > 0){
            cfaOptionName+= " with n = " + cfaLevel;
        }
        logger.log("Computing Pointer Analysis with " + cfaOptionName + ".");

        CallGraphBuilder cgBuilder = null;

        switch(cfaType){
            case ZERO_CFA:
                cgBuilder = Util.makeZeroCFABuilder(Language.JAVA, options, cache, classHierarchy, scope);
                break;
            case ZERO_ONE_CFA:
                cgBuilder = Util.makeZeroOneCFABuilder(Language.JAVA, options, cache, classHierarchy, scope);
                break;
            case VANILLA_ZERO_ONE_CFA:
                cgBuilder = Util.makeVanillaZeroOneCFABuilder(Language.JAVA, options, cache, classHierarchy, scope);
                break;
            case N_CFA:
                if(cfaLevel != null && cfaLevel >= 0)
                    cgBuilder = Util.makeNCFABuilder(cfaLevel, options, cache, classHierarchy, scope);
                break;
            case VANILLA_N_CFA:
                if(cfaLevel != null && cfaLevel >= 0)
                    cgBuilder = Util.makeVanillaNCFABuilder(cfaLevel, options, cache, classHierarchy, scope);
                break;
            case ZERO_CONTAINER_CFA:
                cgBuilder = Util.makeZeroContainerCFABuilder(options, cache, classHierarchy, scope);
                break;
            case ZERO_ONE_CONTAINER_CFA:
                cgBuilder = Util.makeZeroOneContainerCFABuilder(options, cache, classHierarchy, scope);
                break;
            case VANILLA_ZERO_ONE_CONTAINER_CFA:
                cgBuilder = Util.makeVanillaZeroOneContainerCFABuilder(options, cache, classHierarchy, scope);
                break;
            default:
                throw new WalaException("No CAF Option Type found to build Call Graph.");
        }

        if(cgBuilder == null){
            throw new WalaException("Call Graph Builder could not be initialized.");
        }

        return cgBuilder;

    }

    private static Iterable<Entrypoint> getEntrypoints(Slice slice, AnalysisScope scope,
                                      IClassHierarchy classHierarchy,
                                      String className,
                                      SliceLogger logger) throws WalaException {
        Iterable<Entrypoint> entrypoints;
        Set<String> entryMethods = slice.getEntryMethods();
        if (slice.getSliceMode().equals(SliceMode.ANDROID)) {
            logger.log("\n== GET ENTRY POINTS FOR ANDROID ==");
            entrypoints = EntryPointAlgorithms.getAndroidEntrypoints(scope, classHierarchy, className, entryMethods, logger);
        } else { // sliceMode == JAVA
            logger.log("\n== GET ENTRY POINTS FOR JAVA==");
            entrypoints = com.ibm.wala.ipa.callgraph.impl.Util.makeMainEntrypoints(scope, classHierarchy);
        }
        if (!entrypoints.iterator().hasNext()) {
            throw new WalaException("Failed to find any entry points from " + entryMethods
                + " in " + className +"!");
        } else {
            logger.log("Number of entry points: " + StreamSupport.stream(entrypoints.spliterator(), false).count());
        }
        return entrypoints;
    }

    /**
     * This methods takes the slice statements collection found by the wala slicer and returns their line numbers corresponding to the source code.
     *
     * @param sliceStatements
     * @param logger
     * @return sourceFileLineNumbers: HashMap that has slice line numbers grouped by source file names of the class (e.g. [com/android/.../AlarmManagerService.java] : {3,5,6})
     */
    private static Map<String, Set<Integer>> getLineNumbersGroupedBySourceFiles(final Collection<Statement> sliceStatements, SliceLogger logger) {
        Map<String, Set<Integer>> sourceFileLineNumbers = new HashMap<>(); // map to group slice line numbers by class

        boolean doLogging = true;
        if(sliceStatements.size() > MAX_DETAILED_LOG){
            logger.log("Number of Slice Statements exceeded maximum Statements to log(" + MAX_DETAILED_LOG +"). Therefore Slice Statements will not be logged in detail.");
            doLogging = false;
        }

        for (Statement statement : sliceStatements) {
            // ignore special kinds of statements
            if (statement.getKind() != null &&
                statement instanceof StatementWithInstructionIndex &&
                    (statement.getKind() == Statement.Kind.NORMAL |
                    statement.getKind() == Statement.Kind.NORMAL_RET_CALLEE |
                    statement.getKind() == Statement.Kind.NORMAL_RET_CALLER)) {

                int instructionIndex = ((StatementWithInstructionIndex) statement).getInstructionIndex();
                IMethod method = statement.getNode().getMethod();

                // the source line number corresponding to a particular bytecode index, or -1 if
                // the information is not available.
                int srcLineNumber = -1;

                try {
                    if (method != null && method instanceof ShrikeBTMethod) {
                        int bcIndex = ((ShrikeBTMethod) method).getBytecodeIndex(instructionIndex);
                        srcLineNumber = ((ShrikeBTMethod) method).getLineNumber(bcIndex);
                    } else {
                        continue; // skip everything that is not a shrike method wrapper, like FakeRootMethod
                    }

                    if (srcLineNumber == -1) {
                        continue;
                    }

                    try {
                        if(doLogging){
                            logger.logWithBuffer("+ Statement: " + statement.toString());
                            logger.logWithBuffer("~ Source line number: " + srcLineNumber);
                        }
                        // construct java file path
                        // (e.g. Lcom/android/server/AlarmManagerService$2 ->
                        // com/android/server/AlarmManagerService.java)
                        String declaringClass = method.getDeclaringClass().getName().toString();
                        if (declaringClass.indexOf("$") > -1) {
                            // remove inner class name (e.g. AlarmManagerService$2 -> AlarmManagerService)
                            declaringClass = declaringClass.substring(0, declaringClass.indexOf("$"));
                        }
                        String declaringClassFile = declaringClass.substring(1, declaringClass.length()) + ".java";
                        if(doLogging){
                            logger.logWithBuffer("~ Java source file: " + declaringClassFile + "\n");
                        }
                        Set<Integer> currentLineNumbers = sourceFileLineNumbers.get(declaringClassFile);
                        if (currentLineNumbers == null) {
                            currentLineNumbers = new HashSet<Integer>();
                        }
                        currentLineNumbers.add(srcLineNumber);
                        sourceFileLineNumbers.put(declaringClassFile, currentLineNumbers);
                    } catch (Exception e) {
                        if(doLogging){
                            logger.logWithBuffer("- Error getting line sourceFileLineNumbers: " + e);
                        }
                    }
                } catch (Exception e) {
                    if(doLogging){
                        logger.logWithBuffer("- getBytecodeIndex handling failed: " + e);
                    }
                }
            }
        }
        return sourceFileLineNumbers;
    }


    /**
     * Find the method nodes which belong to the entry methods of the call graph. Also look for any methods that are called within these methods recursively  {@link #getInnerMethodNames(CGNode node) getInnerMethodNames}.
     *
     * Based on the work by Markus Gulman (Masterthesis 2014) and Philip Phu Dang Hoan Nguyen (Masterthesis 2018). Modified by
     * Michael Cyl to search inner classes (like AlarmMangerService$1) and to add CGNode for all inner methods, i.e. callees of
     * the entry methods, as well.
     *
     * @param callGraph CallGraph
     * @param methodNames Method names to compare the method nodes to
     * @param methodNodes Collection of found method nodes to keep during recursion
     * @param logger
     * @return methodNodes: Collection of found method nodes
     * @throws WalaException
     */
    private static Set<CGNode> findMethodNodes(final CallGraph callGraph, Set<String> methodNames,
                                               final Set<CGNode> methodNodes, final String className,
                                               SliceLogger logger) throws WalaException {
        for (Iterator<? extends CGNode> nodeIt = callGraph.iterator(); nodeIt.hasNext();) {
            CGNode node = nodeIt.next();

            // get the method name
            Atom methodNodeName = node.getMethod().getName();
            // get the class name
            TypeName declaringClassName = node.getMethod().getDeclaringClass().getName();

            // check if class name of current node equals class name ...
            if (declaringClassName.equals(TypeName.findOrCreate(className))
                // ... or inner class name
                | declaringClassName.toString().startsWith(className + "$")) {

                // check all given method names (i.e. entry methods and inner methods)
                for (String methodName : methodNames){
                    // compare method name
                    if (methodNodeName.equals(Atom.findOrCreateUnicodeAtom(methodName))) {
                        // add node if not already in set
                        if(!methodNodes.contains(node)){
                            methodNodes.add(node);
                            logger.log("~ Found call graph method: " + methodName + "() with object class: "
                            + declaringClassName + " in " + node + ".");
                            // search inner method nodes
                            Set<String> innerMethodNames = getInnerMethodNames(node);
                            if(!innerMethodNames.isEmpty()){
                                findMethodNodes(callGraph, innerMethodNames, methodNodes, className, logger);
                            }
                        }
                    }
                }
            }
        }
        return methodNodes;
    }

    /**
     * This is a helper method for  {@link #findMethodNodes(CallGraph, Set, Set, String, SliceLogger)}  findMethodNodes} to find all methods (i.e their names) which are called inside of a given node.
     *
     * @param node to search.
     * @return innerMethodNames List of method names.
     */
    private static Set<String> getInnerMethodNames(CGNode node){

        Set<String> innerMethodNames = new HashSet<String>();

        IR ir = node.getIR();
        if (ir != null && ir.iterateAllInstructions() != null) {
            for (Iterator<SSAInstruction> it = ir.iterateAllInstructions(); it.hasNext();) {
                SSAInstruction instruction = it.next();

                // search method invoke instructions
                if (instruction instanceof SSAAbstractInvokeInstruction) {
                    SSAAbstractInvokeInstruction call = (SSAAbstractInvokeInstruction) instruction;
                    innerMethodNames.add(call.getDeclaredTarget().getName().toString());
                }
            }
        }

        return innerMethodNames;
    }

    /**
     * Search for the user specified seed statement inside the method nodes which have been found by.
     * The algorithm also iterates over all method nodes found by
     * {@link #findMethodNodes(CallGraph, Set, Set, String, SliceLogger)}  findMethodNodes}.
     *
     * @param nodes Method nodes to search
     * @param seedStatementNames User specified seed statement names to compare to.
     * @param logger
     * @return Set of Statements
     * @throws WalaException
     */
    private static Set<Statement> findSeedStatements(Set<CGNode> nodes, Set<String> seedStatementNames, SliceLogger logger) throws WalaException {

        Set<Statement> statements = new HashSet<Statement>();

        for (CGNode node : nodes) {
            IR ir = node.getIR();
            if (ir == null || ir.iterateAllInstructions() == null) {
                continue;
            }

            for (int i = 0; i < ir.getInstructions().length; i++) {

                SSAInstruction instruction = ir.getInstructions()[i];

                // check for method- and new-instructions
                // other types of instructions can be found here:
                // http://wala.sourceforge.net/javadocs/trunk/com/ibm/wala/ssa/SSAInstruction.html

                // add seed statements with method invoke instructions
                if (instruction instanceof SSAAbstractInvokeInstruction) {
                    SSAAbstractInvokeInstruction call = (SSAAbstractInvokeInstruction) instruction;
                    String abstractInvokeInstructionName = call.getCallSite().getDeclaredTarget().getName().toString();

                    // check all seed statements
                    for (String seedStatementName : seedStatementNames) {
                        // mcyl: use regex for seed statements
                        if (Pattern.matches(seedStatementName, abstractInvokeInstructionName)) {
                            IntSet indices = ir.getCallInstructionIndices(call.getCallSite());
                            statements.add(new NormalStatement(node, indices.intIterator().next()));
                            logger.log("~ Found seed statement: " + call.getCallSite().getDeclaredTarget().getName().toString() + " in " + node + ".");
                        }
                    }
                }

                // mcyl: add seed statements with "new" instructions
                if (instruction instanceof SSANewInstruction) {
                    SSANewInstruction call = (SSANewInstruction) instruction;

                    // get class name (e.g. Ljava/lang/SecurityException -> SecurityException)
                    String newInstructionName = call.getNewSite().getDeclaredType().getName().toString();
                    newInstructionName = newInstructionName.substring(newInstructionName.lastIndexOf("/") + 1, newInstructionName.length());

                    // check all seed statements
                    for (String seedStatementName : seedStatementNames) {
                        if (Pattern.matches(seedStatementName, newInstructionName)){
                            statements.add(new NormalStatement(node, i));
                            logger.log("~ Found seed statement: new " + seedStatementName + " in " + node + ".");
                        }
                    }
                }
            }
        }

        if (statements.size() == 0) {
            logger.log("- Failed to find any calls to " + seedStatementNames + " in " + nodes + "!");
        }

        return statements;
    }


}
