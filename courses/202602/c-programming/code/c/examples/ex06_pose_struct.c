#include <stdio.h>
#include <string.h>

typedef struct {
    float x_m;
    float y_m;
    float yaw_deg;
} Pose2D;

static void serialize_pose(const Pose2D *pose, char *out, int out_size) {
    snprintf(out, out_size, "P,%.2f,%.2f,%.1f", pose->x_m, pose->y_m, pose->yaw_deg);
}

static int parse_pose(const char *line, Pose2D *pose) {
    char tag = '\0';
    int count = sscanf(line, " %c,%f,%f,%f", &tag, &pose->x_m, &pose->y_m, &pose->yaw_deg);
    return count == 4 && tag == 'P';
}

int main(void) {
    Pose2D robot = {1.25f, -0.40f, 90.0f};
    char line[64];
    Pose2D parsed = {0};

    serialize_pose(&robot, line, sizeof(line));
    printf("serialized: %s\n", line);

    if (parse_pose(line, &parsed)) {
        printf("parsed: x=%.2f y=%.2f yaw=%.1f\n", parsed.x_m, parsed.y_m, parsed.yaw_deg);
    } else {
        printf("parse failed\n");
    }

    return 0;
}
