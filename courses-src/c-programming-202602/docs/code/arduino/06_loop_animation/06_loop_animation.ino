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

void scanDot() {
  for (int c = 0; c < 12; ++c) {
    clearFrame();
    setPixel(3, c);
    render();
    delay(80);
  }
}

void showBar(int level) {
  clearFrame();

  for (int c = 0; c < level; ++c) {
    setPixel(6, c);
    setPixel(7, c);
  }

  render();
}

void growBar() {
  for (int level = 1; level <= 12; ++level) {
    showBar(level);
    delay(90);
  }

  for (int level = 11; level >= 1; --level) {
    showBar(level);
    delay(90);
  }
}

void drawBorder() {
  clearFrame();

  for (int c = 0; c < 12; ++c) {
    setPixel(0, c);
    setPixel(7, c);
  }

  for (int r = 0; r < 8; ++r) {
    setPixel(r, 0);
    setPixel(r, 11);
  }

  render();
}

void setup() {
  Serial.begin(115200);
  matrix.begin();
  Serial.println("06_loop_animation: for/while/nested loop demo");
}

void loop() {
  scanDot();
  growBar();
  drawBorder();
  delay(500);
}
