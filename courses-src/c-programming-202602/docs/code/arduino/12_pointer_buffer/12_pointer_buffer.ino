#include <Arduino_LED_Matrix.h>

ArduinoLEDMatrix matrix;

float samples[] = {18.0f, 24.5f, 31.0f, 44.5f, 38.0f, 29.5f, 52.0f, 47.0f};
const int sampleCount = sizeof(samples) / sizeof(samples[0]);

uint8_t frame[8][12];

void clearFrame()
{
  for (int r = 0; r < 8; ++r) {
    for (int c = 0; c < 12; ++c) {
      frame[r][c] = 0;
    }
  }
}

float averageOf(const float *values, int count)
{
  if (values == nullptr || count <= 0) {
    return 0.0f;
  }

  float sum = 0.0f;
  for (const float *p = values; p < values + count; ++p) {
    sum += *p;
  }
  return sum / count;
}

float maxOf(const float *values, int count)
{
  if (values == nullptr || count <= 0) {
    return 0.0f;
  }

  float maxValue = *values;
  for (const float *p = values + 1; p < values + count; ++p) {
    if (*p > maxValue) {
      maxValue = *p;
    }
  }
  return maxValue;
}

int valueToHeight(float value, float maxValue)
{
  if (maxValue <= 0.0f) {
    return 0;
  }

  int height = (int)((value / maxValue) * 8.0f + 0.5f);
  if (height < 0) {
    return 0;
  }
  if (height > 8) {
    return 8;
  }
  return height;
}

void drawAverageBar(float average, float maxValue)
{
  clearFrame();

  int height = valueToHeight(average, maxValue);
  for (int c = 3; c <= 8; ++c) {
    for (int r = 7; r >= 8 - height; --r) {
      frame[r][c] = 1;
    }
  }

  matrix.renderBitmap(frame, 8, 12);
}

void printSamples()
{
  Serial.println("samples by pointer:");
  int index = 0;
  for (const float *p = samples; p < samples + sampleCount; ++p) {
    Serial.print(index);
    Serial.print(": value=");
    Serial.print(*p, 1);
    Serial.print(" address=");
    Serial.println((uintptr_t)p, HEX);
    index++;
  }
}

void setup()
{
  Serial.begin(115200);
  matrix.begin();

  float average = averageOf(samples, sampleCount);
  float maxValue = maxOf(samples, sampleCount);

  printSamples();
  Serial.print("average=");
  Serial.println(average, 1);
  Serial.print("max=");
  Serial.println(maxValue, 1);

  drawAverageBar(average, maxValue);
}

void loop()
{
}
