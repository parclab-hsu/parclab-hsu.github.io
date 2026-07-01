#include "stella_n2_bridge/scan_logic.h"

#include <float.h>
#include <math.h>

static int is_valid_range(float value) {
    return isfinite(value) && value > 0.01f;
}

DriveDecision analyze_scan(const float *ranges, int count, float stop_distance_m) {
    DriveDecision decision;
    decision.action = DRIVE_STOP;
    decision.nearest_m = FLT_MAX;
    decision.nearest_index = -1;
    decision.linear_mps = 0.0f;
    decision.angular_rps = 0.0f;

    if (ranges == 0 || count <= 0) {
        return decision;
    }

    for (int i = 0; i < count; ++i) {
        if (is_valid_range(ranges[i]) && ranges[i] < decision.nearest_m) {
            decision.nearest_m = ranges[i];
            decision.nearest_index = i;
        }
    }

    if (decision.nearest_index < 0) {
        return decision;
    }

    int center = count / 2;
    int center_band = count / 8;
    if (center_band < 1) {
        center_band = 1;
    }

    if (decision.nearest_m < stop_distance_m) {
        decision.action = DRIVE_STOP;
        return decision;
    }

    if (decision.nearest_index >= center - center_band &&
        decision.nearest_index <= center + center_band) {
        decision.linear_mps = 0.05f;
        if (decision.nearest_index < center) {
            decision.action = DRIVE_TURN_RIGHT;
            decision.angular_rps = -0.45f;
        } else {
            decision.action = DRIVE_TURN_LEFT;
            decision.angular_rps = 0.45f;
        }
        return decision;
    }

    decision.action = DRIVE_FORWARD;
    decision.linear_mps = 0.12f;
    decision.angular_rps = 0.0f;
    return decision;
}
