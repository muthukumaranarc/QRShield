package com.qrshield.backend.entity;

/**
 * Lifecycle states of an asynchronous deep sandbox scan job.
 */
public enum ScanLifecycleStatus {
    QUEUED,
    STARTING_VM,
    ANALYZING,
    FINALIZING,
    COMPLETED,
    FAILED,
    UNVERIFIED
}
