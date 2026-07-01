typedef struct {
  float distance_cm;
  float speed_cmps;
  char state[16];
} SensorPacket;

void serializePacket(const SensorPacket *packet, char *out, int outSize) {
  snprintf(
    out,
    outSize,
    "S,%.1f,%.1f,%s",
    packet->distance_cm,
    packet->speed_cmps,
    packet->state
  );
}

void setup() {
  Serial.begin(115200);
  Serial.println("15_struct_packet: struct -> text packet");
}

void loop() {
  static int tick = 0;
  SensorPacket packet;
  char line[64];

  packet.distance_cm = 42.0f - (tick % 20);
  packet.speed_cmps = packet.distance_cm < 15.0f ? 0.0f : 25.0f;

  if (packet.distance_cm < 15.0f) {
    strncpy(packet.state, "STOP", sizeof(packet.state));
  } else if (packet.distance_cm < 30.0f) {
    strncpy(packet.state, "SLOW", sizeof(packet.state));
  } else {
    strncpy(packet.state, "RUN", sizeof(packet.state));
  }
  packet.state[sizeof(packet.state) - 1] = '\0';

  serializePacket(&packet, line, sizeof(line));
  Serial.println(line);

  tick++;
  delay(1000);
}
