# Arduino R4 예제

Arduino UNO R4 WiFi는 수업에서 C 문법을 바로 눈으로 확인하기 위한 보드다. 12×8 LED Matrix는 2차원 배열, WiFi는 문자열 명령과 통신 프로토콜을 설명하기 좋다.

## 예제 목록

| 예제 | 주차 | 핵심 개념 | 실행 결과 |
|------|------|-----------|-----------|
| `05_showface` | 5주차 | 조건문, 2차원 배열 | 거리 상태에 따라 LED 표정 변경 |
| `09_face_main` | 7주차 | 함수, 시리얼 명령 | `h`, `a`, `o`, `n` 명령으로 표정 변경 |
| `11_wifi_car` | 11주차 | 문자열, WiFi 서버 | 브라우저 버튼으로 LED 상태 제어 |
| `15_struct_packet` | 14주차 | 구조체, 직렬화 | `S,거리,속도,상태` 패킷 출력 |

## 공통 체크리스트

- 보드: Arduino UNO R4 WiFi
- 시리얼 속도: `115200`
- LED Matrix 라이브러리: `Arduino_LED_Matrix.h`
- WiFi 예제 라이브러리: `WiFiS3.h`

!!! tip "LED Matrix를 배열로 보기"
    LED Matrix는 `frame[8][12]`와 같은 2차원 배열로 생각하면 쉽다. `frame[행][열] = 1`이면 해당 LED를 켠다고 보면 된다.

## 5주차 예제: 조건문이 표정이 된다

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

이 코드는 조건문이 단순한 콘솔 출력이 아니라 **장비의 상태 표시**로 이어진다는 점을 보여 준다.

## 7주차 예제: 명령 문자를 함수로 연결

파일: `code/arduino/09_face_main/09_face_main.ino`

시리얼 모니터에서 다음 문자를 보낸다.

| 명령 | 동작 |
|------|------|
| `h` | happy |
| `a` | angry |
| `o` | surprised |
| `n` | neutral |
| `b` | blink |

## 11주차 예제: WiFi 명령

파일: `code/arduino/11_wifi_car/11_wifi_car.ino`

1. `arduino_secrets.h.example`을 `arduino_secrets.h`로 복사한다.
2. `SECRET_SSID`, `SECRET_PASS`를 수정한다.
3. 업로드 후 시리얼 모니터의 IP 주소를 브라우저에서 연다.

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
