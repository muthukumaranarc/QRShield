package com.qrshield.backend.entity;

/**
 * Lifecycle states of the disposable VirtualBox guest VM.
 */
public enum VmLifecycleStatus {
    NOT_STARTED,
    CLONING,
    RUNNING,
    HEALTHY,
    STOPPING,
    DELETED,
    ORPHANED_CLEANED,
    CLEANUP_FAILED
}
