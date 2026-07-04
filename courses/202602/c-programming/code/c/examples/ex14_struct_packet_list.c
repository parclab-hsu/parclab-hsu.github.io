#include <stdio.h>
#include <string.h>

typedef struct {
    float distance_cm;
    float speed_cmps;
    char state[16];
} SensorPacket;

typedef struct Node {
    SensorPacket packet;
    struct Node *next;
} Node;

void serialize_packet(const SensorPacket *packet, char *out, int out_size)
{
    snprintf(out, out_size, "S,%.1f,%.1f,%s",
             packet->distance_cm, packet->speed_cmps, packet->state);
}

int parse_packet(const char *line, SensorPacket *packet)
{
    char tag = '\0';

    return sscanf(line, "%c,%f,%f,%15s",
                  &tag, &packet->distance_cm, &packet->speed_cmps,
                  packet->state) == 4 && tag == 'S';
}

void print_packet(const SensorPacket *packet)
{
    printf("distance=%5.1f cm, speed=%5.1f cm/s, state=%s\n",
           packet->distance_cm, packet->speed_cmps, packet->state);
}

int main(void)
{
    SensorPacket first = {42.0f, 25.0f, "RUN"};
    SensorPacket second = {18.5f, 5.0f, "SLOW"};
    Node n1 = {first, NULL};
    Node n2 = {second, NULL};
    char line[64];
    SensorPacket received = {0.0f, 0.0f, ""};

    n1.next = &n2;

    for (Node *cur = &n1; cur != NULL; cur = cur->next) {
        serialize_packet(&cur->packet, line, sizeof(line));
        printf("serial: %s\n", line);
    }

    if (parse_packet("S,31.5,12.0,STOP", &received)) {
        print_packet(&received);
    }

    return 0;
}
