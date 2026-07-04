#include <Arduino_LED_Matrix.h>

ArduinoLEDMatrix matrix;

using CommandHandler = void (*)();

const char *commandNames[] = {
  "clear",
  "run",
  "slow",
  "stop"
};

uint8_t clearFrame[8][12] = {
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
};

uint8_t runFrame[8][12] = {
  {0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0},
  {0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0},
  {0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0},
  {0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0},
  {0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0},
  {0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0}
};

uint8_t slowFrame[8][12] = {
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0},
  {0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
  {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
};

uint8_t stopFrame[8][12] = {
  {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
  {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1},
  {1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1},
  {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
};

void showClear()
{
  matrix.renderBitmap(clearFrame, 8, 12);
}

void showRun()
{
  matrix.renderBitmap(runFrame, 8, 12);
}

void showSlow()
{
  matrix.renderBitmap(slowFrame, 8, 12);
}

void showStop()
{
  matrix.renderBitmap(stopFrame, 8, 12);
}

CommandHandler handlers[] = {
  showClear,
  showRun,
  showSlow,
  showStop
};

const int commandCount = sizeof(handlers) / sizeof(handlers[0]);

void printMenu()
{
  Serial.println();
  Serial.println("Pointer dispatch menu");
  for (int i = 0; i < commandCount; ++i) {
    Serial.print(i);
    Serial.print(": ");
    Serial.println(commandNames[i]);
  }
  Serial.println("Type a command number.");
}

void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    ;
  }

  matrix.begin();
  showClear();
  printMenu();
}

void loop()
{
  if (!Serial.available()) {
    return;
  }

  int choice = Serial.parseInt();
  while (Serial.available()) {
    Serial.read();
  }

  if (choice < 0 || choice >= commandCount) {
    Serial.println("Invalid command.");
    printMenu();
    return;
  }

  Serial.print("run handler: ");
  Serial.println(commandNames[choice]);
  handlers[choice]();
}
