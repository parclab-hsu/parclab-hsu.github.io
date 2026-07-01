#include <Arduino_LED_Matrix.h>
#include <WiFiS3.h>

#if __has_include("arduino_secrets.h")
#include "arduino_secrets.h"
#else
#define SECRET_SSID "YOUR_WIFI_NAME"
#define SECRET_PASS "YOUR_WIFI_PASSWORD"
#endif

ArduinoLEDMatrix matrix;
WiFiServer server(80);

uint8_t frame[8][12];
char currentState[16] = "NEUTRAL";

void clearFrame() {
  for (int r = 0; r < 8; ++r) {
    for (int c = 0; c < 12; ++c) {
      frame[r][c] = 0;
    }
  }
}

void setPixel(int r, int c) {
  if (r >= 0 && r < 8 && c >= 0 && c < 12) {
    frame[r][c] = 1;
  }
}

void render() {
  matrix.renderBitmap(frame, 8, 12);
}

void drawRun() {
  clearFrame();
  for (int c = 1; c <= 10; ++c) {
    setPixel(6, c);
  }
  setPixel(2, 3);
  setPixel(2, 8);
  render();
}

void drawStop() {
  clearFrame();
  for (int c = 3; c <= 8; ++c) {
    setPixel(1, c);
    setPixel(6, c);
  }
  for (int r = 2; r <= 5; ++r) {
    setPixel(r, 2);
    setPixel(r, 9);
  }
  render();
}

void drawSlow() {
  clearFrame();
  for (int c = 4; c <= 8; ++c) {
    setPixel(6, c);
  }
  setPixel(2, 3);
  setPixel(2, 4);
  setPixel(2, 8);
  setPixel(2, 9);
  render();
}

void setState(const char *state) {
  strncpy(currentState, state, sizeof(currentState) - 1);
  currentState[sizeof(currentState) - 1] = '\0';

  if (strcmp(currentState, "RUN") == 0) {
    drawRun();
  } else if (strcmp(currentState, "STOP") == 0) {
    drawStop();
  } else {
    drawSlow();
  }

  Serial.print("state=");
  Serial.println(currentState);
}

void printWifiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void sendPage(WiFiClient &client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html; charset=utf-8");
  client.println("Connection: close");
  client.println();
  client.println("<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>");
  client.println("<title>UNO R4 WiFi Controller</title></head><body>");
  client.println("<h1>UNO R4 WiFi Controller</h1>");
  client.print("<p>Current state: ");
  client.print(currentState);
  client.println("</p>");
  client.println("<p><a href='/run'><button>RUN</button></a> <a href='/slow'><button>SLOW</button></a> <a href='/stop'><button>STOP</button></a></p>");
  client.println("<p>Packet format: S,distance_cm,speed_cmps,state</p>");
  client.println("</body></html>");
}

void handleRequest(const String &request) {
  if (request.indexOf("GET /run") >= 0) {
    setState("RUN");
  } else if (request.indexOf("GET /slow") >= 0) {
    setState("SLOW");
  } else if (request.indexOf("GET /stop") >= 0) {
    setState("STOP");
  }
}

void setup() {
  Serial.begin(115200);
  matrix.begin();
  setState("SLOW");

  Serial.println("Connecting to WiFi...");
  int status = WiFi.begin(SECRET_SSID, SECRET_PASS);
  while (status != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
    status = WiFi.status();
  }

  Serial.println();
  printWifiStatus();
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) {
    return;
  }

  String request = client.readStringUntil('\r');
  handleRequest(request);

  while (client.available()) {
    client.read();
  }

  sendPage(client);
  delay(1);
  client.stop();
}
