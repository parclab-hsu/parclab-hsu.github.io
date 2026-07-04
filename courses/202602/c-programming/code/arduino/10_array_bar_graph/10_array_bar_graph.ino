#include <Arduino_LED_Matrix.h>

ArduinoLEDMatrix matrix;

const int scores[] = {23, 45, 67, 89, 55, 12};
const int scoreCount = sizeof(scores) / sizeof(scores[0]);

uint8_t frame[8][12];

void clearFrame()
{
  for (int r = 0; r < 8; r++) {
    for (int c = 0; c < 12; c++) {
      frame[r][c] = 0;
    }
  }
}

int scoreToHeight(int score)
{
  int height = score / 12;

  if (height < 1) {
    height = 1;
  }
  if (height > 8) {
    height = 8;
  }

  return height;
}

double averageScore(const int arr[], int count)
{
  int sum = 0;

  for (int i = 0; i < count; i++) {
    sum += arr[i];
  }

  return (double)sum / count;
}

void drawBarGraph(const int arr[], int count)
{
  clearFrame();

  for (int i = 0; i < count; i++) {
    int height = scoreToHeight(arr[i]);
    int x0 = i * 2;

    for (int h = 0; h < height; h++) {
      int y = 7 - h;

      if (x0 >= 0 && x0 < 12) {
        frame[y][x0] = 1;
      }
      if (x0 + 1 < 12) {
        frame[y][x0 + 1] = 1;
      }
    }
  }

  matrix.renderBitmap(frame, 8, 12);
}

void printScores(const int arr[], int count)
{
  Serial.print("scores = {");
  for (int i = 0; i < count; i++) {
    Serial.print(arr[i]);
    if (i < count - 1) {
      Serial.print(", ");
    }
  }
  Serial.println("}");
}

void setup()
{
  Serial.begin(115200);
  matrix.begin();

  Serial.println("10_array_bar_graph: array -> LED matrix");
  printScores(scores, scoreCount);
  Serial.print("count = ");
  Serial.println(scoreCount);
  Serial.print("average = ");
  Serial.println(averageScore(scores, scoreCount), 2);

  drawBarGraph(scores, scoreCount);
  Serial.println("LED matrix shows one vertical bar for each score.");
}

void loop()
{
}
