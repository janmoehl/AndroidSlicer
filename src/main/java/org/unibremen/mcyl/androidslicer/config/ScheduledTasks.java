package org.unibremen.mcyl.androidslicer.config;

import java.util.Set;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.unibremen.mcyl.androidslicer.domain.Slice;
import org.unibremen.mcyl.androidslicer.repository.SliceRepository;

@EnableScheduling
@Component
public class ScheduledTasks {

private static final Logger LOGGER = LoggerFactory.getLogger(ScheduledTasks.class);

private static boolean startUpFinished = false;

@Autowired 
private SliceRepository sliceRepository;

    @Scheduled(fixedRate = 360000)
    public void keepAlive() {
        //log "alive" every hour for sanity checks
        LOGGER.debug("Alive Task started.");
        if (startUpFinished) {
            cleanUpRunningSlices();
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    @PostConstruct
    public void runOnceOnlyOnStartup() {
        LOGGER.debug("Running startup job.");
        cleanUpRunningSlices();
        startUpFinished = true;
    }

    private void cleanUpRunningSlices() {
        LOGGER.debug("Cleaning up slices.");
        // check if unfinished slices still have running threads
        Set<Thread> threads = Thread.getAllStackTraces().keySet();
        for (Slice slice : sliceRepository.findByRunning(true)){
            Thread slicerThread = threads.stream().filter(thread -> thread.getName().equals(slice.getThreadId())).findFirst().orElse(null);       
            if (slicerThread == null){
                slice.setRunning(false);
                slice.setThreadId(null);
                sliceRepository.save(slice);
            }
        }
    }

}