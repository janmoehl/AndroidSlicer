package org.unibremen.mcyl.androidslicer.wala;

import com.ibm.wala.classLoader.IClass;
import com.ibm.wala.classLoader.IMethod;
import com.ibm.wala.classLoader.ShrikeClass;
import com.ibm.wala.ipa.callgraph.AnalysisScope;
import com.ibm.wala.ipa.callgraph.Entrypoint;
import com.ibm.wala.ipa.callgraph.impl.ArgumentTypeEntrypoint;
import com.ibm.wala.ipa.cha.IClassHierarchy;
import com.ibm.wala.util.strings.Atom;
import org.unibremen.mcyl.androidslicer.service.SliceLogger;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * Collection of some algorithms to find entrypoints for the slicing.
 */
public abstract class EntryPointAlgorithms {
    /**
     * Originally used by the AndroidSlicer to search the entrypoints in Android applications.
     * This method searches for entry points inside the class hierarchy.
     *
     * @param scope AnalysisScope the used AnalysisScope
     * @param classHierarchy IClassHierarchy the used ClassHierarchy
     * @param androidClassName Android class name to compare type names to (e.g. Lcom/android/server/AlarmManagerService)
     * @param entryMethods The list of user specified enty method names to search for
     * @param logger SliceLogger, to which the progress/the errors get logged
     * @return entrypoints: Set of entry points
     */
    public static Set<Entrypoint> getAndroidEntrypoints(AnalysisScope scope, IClassHierarchy classHierarchy, String androidClassName,
                                                         Set<String> entryMethods, SliceLogger logger) {
        Set<Entrypoint> entrypoints = new HashSet<Entrypoint>();

        if (classHierarchy == null) {
            throw new IllegalArgumentException("ClassHierarchy is null!");
        }

        for (IClass clazz : classHierarchy) {
            if (clazz instanceof ShrikeClass & !clazz.isInterface() & isApplicationClass(scope, clazz)) {
                String typeName = clazz.getName().toString();

                // check if type name of current class equals android class name ...
                if (typeName.equals(androidClassName)
                    // .. also check inner class names as well (e.g Lcom/android/server/AlarmManagerService$[InnerClassName])
                    | typeName.startsWith(androidClassName + "$")) {

                    for (Iterator<? extends IMethod> methodIt = clazz.getDeclaredMethods().iterator(); methodIt.hasNext();) {
                        IMethod method = (IMethod) methodIt.next();
                        for (String entryMethod : entryMethods) {
                            if (!method.isAbstract() && method.getName().equals(Atom.findOrCreateUnicodeAtom(entryMethod))) {
                                entrypoints.add(new ArgumentTypeEntrypoint(method, classHierarchy));
                                logger.log("~ Found entry method: " + entryMethod + "() with object class: " + typeName + ".");
                            }
                        }
                    }
                }
            }
        }
        return entrypoints;
    }

    /**
     * Helperclass for {@link #getAndroidEntrypoints(AnalysisScope, IClassHierarchy, String, Set, SliceLogger)}
     * @param scope the used AnalysisScope
     * @param clazz the checked Class
     * @return true, if the class is the applicationClass
     */
    private static boolean isApplicationClass(AnalysisScope scope, IClass clazz) {
        return scope.getApplicationLoader().equals(clazz.getClassLoader().getReference());
    }

}
