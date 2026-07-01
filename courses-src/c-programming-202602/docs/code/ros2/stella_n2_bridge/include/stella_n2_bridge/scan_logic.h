#ifndef STELLA_N2_BRIDGE_SCAN_LOGIC_H
#define STELLA_N2_BRIDGE_SCAN_LOGIC_H

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    DRIVE_STOP = 0,
    DRIVE_FORWARD = 1,
    DRIVE_TURN_LEFT = 2,
    DRIVE_TURN_RIGHT = 3
} DriveAction;

typedef struct {
    DriveAction action;
    float nearest_m;
    int nearest_index;
    float linear_mps;
    float angular_rps;
} DriveDecision;

DriveDecision analyze_scan(const float *ranges, int count, float stop_distance_m);

#ifdef __cplusplus
}
#endif

#endif
