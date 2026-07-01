#include <stdio.h>
#include <string.h>

typedef struct {
    float distance_cm;
    float speed_cmps;
    char state[16];
} SensorPacket;

int parse_sensor_packet(const char *line, SensorPacket *packet) {
    char tag = '\0';
    int count = sscanf(
        line,
        " %c,%f,%f,%15[^\r\n]",
        &tag,
        &packet->distance_cm,
        &packet->speed_cmps,
        packet->state
    );
    return count == 4 && tag == 'S';
}

int main(void) {
    const char *line = "S,42.0,25.0,RUN";
    SensorPacket packet = {0};

    if (parse_sensor_packet(line, &packet)) {
        printf("distance=%.1f cm\n", packet.distance_cm);
        printf("speed=%.1f cm/s\n", packet.speed_cmps);
        printf("state=%s\n", packet.state);
    } else {
        printf("invalid packet: %s\n", line);
    }

    return 0;
}
