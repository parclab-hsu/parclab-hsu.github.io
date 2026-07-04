# Arduino R4 예제

Arduino UNO R4 WiFi는 C 문법을 눈에 보이는 장치 동작으로 확인하기 좋은 보드다. 이 강의에서는 12x8 LED Matrix, 시리얼 명령, WiFi, 문자열 패킷을 사용하여 콘솔에서 배운 문법을 실제 장치 제어 흐름으로 연결한다.

## 예제 목록

| 예제 | 주차 | 핵심 개념 | 실행 결과 |
|------|------|-----------|-----------|
| `05_showface` | 5주차 | 조건문, 2차원 배열 | 거리 상태에 따라 LED 표정 변경 |
| `06_loop_animation` | 6주차 | 반복문, 중첩 반복 | 점 이동, 막대 증가, 테두리 출력 |
| `09_face_main` | 7주차 | 함수, 시리얼 명령 | `h`, `a`, `o`, `n` 명령으로 표정 변경 |
| `09_scope_state` | 9주차 | 전역 변수, static 지역 변수 | 상태 문자열과 명령 카운트 유지 |
| `10_array_bar_graph` | 10주차 | 1차원 배열, 평균, 막대그래프 | 점수 배열을 LED Matrix 막대로 표시 |
| `11_wifi_car` | 11주차 | 2차원 배열, 문자열, WiFi 서버 | 브라우저 버튼으로 LED 상태 제어 |
| `12_pointer_buffer` | 12주차 | 포인터, 배열 순회, 센서 버퍼 | 포인터로 가상 센서값 평균을 계산해 LED 막대 표시 |
| `13_pointer_dispatch` | 13주차 | 포인터 배열, 함수 포인터 배열 | 시리얼 명령 번호를 LED 동작 함수와 연결 |
| `15_struct_packet` | 14주차 | 구조체, 직렬화 | `S,거리,속도,상태` 패킷 출력 |

## 공통 체크리스트

- 보드: Arduino UNO R4 WiFi
- 시리얼 속도: `115200`
- LED Matrix 라이브러리: `Arduino_LED_Matrix.h`
- WiFi 예제 라이브러리: `WiFiS3.h`

!!! tip "LED Matrix를 배열로 보기"
    LED Matrix를 `frame[8][12]` 같은 2차원 배열로 생각하면 쉽다. `frame[row][col] = 1`이면 해당 LED를 켠다고 보면 된다.

## 5주차 예제: 조건문이 표정을 바꾼다

파일: `code/arduino/05_showface/05_showface.ino`

```cpp
if (distance_cm < 15.0) {
  showFace(faceSurprised);
} else if (distance_cm < 30.0) {
  showFace(faceAngry);
} else {
  showFace(faceHappy);
}
```

조건문의 결과가 콘솔 출력에 그치지 않고 장치 상태 표시로 이어진다는 점을 보여 준다.

## 6주차 예제: 반복문이 애니메이션을 만든다

파일: `code/arduino/06_loop_animation/06_loop_animation.ino`

```cpp
for (int c = 0; c < 12; ++c) {
  clearFrame();
  setPixel(3, c);
  render();
  delay(80);
}
```

열 번호를 반복 변수로 사용해 LED 점이 왼쪽에서 오른쪽으로 움직이는 것처럼 보이게 한다.

## 7주차 예제: 명령 문자를 함수로 연결

파일: `code/arduino/09_face_main/09_face_main.ino`

| 명령 | 동작 |
|------|------|
| `h` | happy |
| `a` | angry |
| `o` | surprised |
| `n` | neutral |
| `b` | blink |

## 9주차 예제: 상태를 어디에 저장할까

파일: `code/arduino/09_scope_state/09_scope_state.ino`

```cpp
char currentState[8] = "IDLE";

void handleCommand(char cmd)
{
  static int commandCount = 0;
  commandCount++;
}
```

`currentState`는 여러 함수가 함께 읽는 전역 상태이고, `commandCount`는 명령 처리 함수 안에서만 필요한 누적값이므로 `static` 지역 변수로 둔다.

## 10주차 예제: 배열이 막대그래프가 된다

파일: `code/arduino/10_array_bar_graph/10_array_bar_graph.ino`

```cpp
const int scores[] = {23, 45, 67, 89, 55, 12};
const int scoreCount = sizeof(scores) / sizeof(scores[0]);
```

점수 배열의 각 요소를 LED Matrix의 세로 막대로 표시한다.

## 11주차 예제: WiFi 명령

파일: `code/arduino/11_wifi_car/11_wifi_car.ino`

1. `arduino_secrets.h.example`을 `arduino_secrets.h`로 복사한다.
2. `SECRET_SSID`, `SECRET_PASS`를 수정한다.
3. 업로드 후 시리얼 모니터의 IP 주소를 브라우저에서 연다.
4. `/run`, `/slow`, `/stop` 버튼으로 LED Matrix 상태를 바꾼다.
5. `/packet` 경로에서 `S,42.0,25.0,RUN` 형식의 문자열 패킷을 확인한다.

## 12주차 예제: 포인터로 센서 버퍼 순회

파일: `code/arduino/12_pointer_buffer/12_pointer_buffer.ino`

```cpp
float averageOf(const float *values, int count)
{
  float sum = 0.0f;
  for (const float *p = values; p < values + count; ++p) {
    sum += *p;
  }
  return sum / count;
}
```

가상 센서값 배열을 포인터로 순회해 평균과 최댓값을 계산하고, 평균을 LED Matrix 막대로 표시한다.

## 13주차 예제: 포인터 배열과 함수 포인터 배열

파일: `code/arduino/13_pointer_dispatch/13_pointer_dispatch.ino`

```cpp
const char *commandNames[] = {"clear", "run", "slow", "stop"};
void (*handlers[])() = {showClear, showRun, showSlow, showStop};
```

시리얼 모니터에서 `0`, `1`, `2`, `3`을 입력하면 같은 인덱스의 함수가 호출된다. 명령 이름 배열과 함수 포인터 배열의 순서를 맞추는 것이 핵심이다.

## 14주차 예제: 구조체 패킷

파일: `code/arduino/15_struct_packet/15_struct_packet.ino`

출력 예:

```text
S,42.0,25.0,RUN
```

이 문자열은 15주차 ROS2 브리지에서 다시 구조체로 파싱할 수 있다.

## 공식 문서

- [Arduino UNO R4 WiFi 하드웨어 문서](https://docs.arduino.cc/hardware/uno-r4-wifi/)
- [Arduino UNO R4 WiFi LED Matrix 튜토리얼](https://docs.arduino.cc/tutorials/uno-r4-wifi/led-matrix/)
