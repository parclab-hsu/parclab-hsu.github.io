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

  /* 0~39 를 오가며 RUN / SLOW / STOP 세 상태를 모두 지나간다.
     (tick % 20) 이면 최솟값이 23cm 라 STOP 분기에 영영 닿지 않는다. */
  packet.distance_cm = 45.0f - (tick % 40);
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
