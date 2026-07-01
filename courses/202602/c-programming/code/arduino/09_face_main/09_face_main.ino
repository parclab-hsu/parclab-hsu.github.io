#include <Arduino_LED_Matrix.h>

ArduinoLEDMatrix matrix;

uint8_t frame[8][12];

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

void eyes() {
  setPixel(2, 3);
  setPixel(2, 4);
  setPixel(2, 8);
  setPixel(2, 9);
}

void faceNeutral() {
  eyes();
  for (int c = 4; c <= 8; ++c) {
    setPixel(6, c);
  }
}

void faceHappy() {
  eyes();
  for (int c = 3; c <= 9; ++c) {
    setPixel(6, c);
  }
}

void faceAngry() {
  setPixel(1, 2);
  setPixel(1, 3);
  setPixel(2, 4);
  setPixel(1, 10);
  setPixel(1, 9);
  setPixel(2, 8);
  for (int c = 4; c <= 8; ++c) {
    setPixel(5, c);
  }
}

void faceSurprised() {
  eyes();
  setPixel(5, 5);
  setPixel(5, 6);
  setPixel(5, 7);
  setPixel(6, 5);
  setPixel(6, 7);
}

void faceBlink() {
  setPixel(3, 3);
  setPixel(3, 4);
  setPixel(3, 8);
  setPixel(3, 9);
  for (int c = 4; c <= 8; ++c) {
    setPixel(6, c);
  }
}

void showFace(void (*drawFace)()) {
  clearFrame();
  drawFace();
  render();
}

void printHelp() {
  Serial.println("Commands: h=happy, a=angry, o=surprised, n=neutral, b=blink, ?=help");
}

void runCommand(char cmd) {
  switch (cmd) {
    case 'h':
      showFace(faceHappy);
      Serial.println("happy");
      break;
    case 'a':
      showFace(faceAngry);
      Serial.println("angry");
      break;
    case 'o':
      showFace(faceSurprised);
      Serial.println("surprised");
      break;
    case 'n':
      showFace(faceNeutral);
      Serial.println("neutral");
      break;
    case 'b':
      showFace(faceBlink);
      Serial.println("blink");
      break;
    case '?':
      printHelp();
      break;
    default:
      Serial.print("unknown command: ");
      Serial.println(cmd);
      printHelp();
      break;
  }
}

void setup() {
  Serial.begin(115200);
  matrix.begin();
  printHelp();
  showFace(faceNeutral);
}

void loop() {
  if (Serial.available() <= 0) {
    return;
  }

  char cmd = Serial.read();
  if (cmd == '\n' || cmd == '\r' || cmd == ' ') {
    return;
  }

  runCommand(cmd);
}
