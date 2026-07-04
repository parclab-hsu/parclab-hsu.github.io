char currentState[8] = "IDLE";

void setState(const char *state)
{
  int i = 0;

  while (state[i] != '\0' && i < 7) {
    currentState[i] = state[i];
    i++;
  }

  currentState[i] = '\0';
}

void printHelp(void)
{
  Serial.println("Commands: r=RUN, s=STOP, i=IDLE, ?=help");
}

void handleCommand(char cmd)
{
  static int commandCount = 0;
  commandCount++;

  if (cmd == 'r') {
    setState("RUN");
    digitalWrite(LED_BUILTIN, HIGH);
  } else if (cmd == 's') {
    setState("STOP");
    digitalWrite(LED_BUILTIN, LOW);
  } else if (cmd == 'i') {
    setState("IDLE");
    digitalWrite(LED_BUILTIN, LOW);
  } else if (cmd == '?') {
    printHelp();
  } else {
    Serial.print("unknown command: ");
    Serial.println(cmd);
  }

  Serial.print("state=");
  Serial.print(currentState);
  Serial.print(", commands=");
  Serial.println(commandCount);
}

void printHeartbeat(void)
{
  static unsigned long lastPrintMs = 0;
  unsigned long now = millis();

  if (now - lastPrintMs < 2000) {
    return;
  }

  lastPrintMs = now;
  Serial.print("heartbeat state=");
  Serial.println(currentState);
}

void setup(void)
{
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  while (!Serial) {
  }

  Serial.println("09_scope_state: global state + static counters");
  printHelp();
}

void loop(void)
{
  if (Serial.available() > 0) {
    char cmd = Serial.read();

    if (cmd != '\n' && cmd != '\r' && cmd != ' ') {
      handleCommand(cmd);
    }
  }

  printHeartbeat();
}
