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

void eyesNormal() {
  setPixel(2, 3);
  setPixel(2, 4);
  setPixel(2, 8);
  setPixel(2, 9);
}

void mouthSmile() {
  for (int c = 3; c <= 9; ++c) {
    setPixel(6, c);
  }
  setPixel(5, 2);
  setPixel(5, 10);
}

void mouthFlat() {
  for (int c = 4; c <= 8; ++c) {
    setPixel(6, c);
  }
}

void mouthO() {
  setPixel(5, 5);
  setPixel(5, 6);
  setPixel(5, 7);
  setPixel(6, 5);
  setPixel(6, 7);
}

void faceHappy() {
  eyesNormal();
  mouthSmile();
}

void faceAngry() {
  setPixel(1, 2);
  setPixel(1, 3);
  setPixel(2, 4);
  setPixel(1, 10);
  setPixel(1, 9);
  setPixel(2, 8);
  mouthFlat();
}

void faceSurprised() {
  eyesNormal();
  mouthO();
}

void showFace(void (*drawFace)()) {
  clearFrame();
  drawFace();
  render();
}

void setup() {
  Serial.begin(115200);
  matrix.begin();
  Serial.println("05_showface: conditional state -> LED face");
}

void loop() {
  const float distances[] = {42.0, 24.0, 8.0};

  for (int i = 0; i < 3; ++i) {
    float distance_cm = distances[i];

    Serial.print("distance_cm=");
    Serial.println(distance_cm);

    if (distance_cm < 15.0) {
      Serial.println("state=STOP");
      showFace(faceSurprised);
    } else if (distance_cm < 30.0) {
      Serial.println("state=SLOW");
      showFace(faceAngry);
    } else {
      Serial.println("state=RUN");
      showFace(faceHappy);
    }

    delay(1500);
  }
}
