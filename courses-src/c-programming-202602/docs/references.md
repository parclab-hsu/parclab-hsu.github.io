# 주차별 참고 자료 · 외부 레퍼런스

## 미래모빌리티학과 · C언어

> 강의 개념을 더 깊이·다른 시각으로 이해하도록 **권위 있는 외부 출처**를 주차별로 정리했다.
> (저작권상 외부 이미지는 이 문서에 옮기지 않는다. 아래 링크에서 직접 그림·설명을 확인하자.
> 이 과목의 개념 다이어그램은 각 주차 강의 페이지의 원본 그림 24종을 참고.)
> **읽는 법**: 먼저 강의안으로 개념을 잡고 → 아래 레퍼런스로 보강 → 예제로 확인.

---

## 공통 · 항상 곁에 두는 레퍼런스
- **cppreference (C 표준 레퍼런스)** — https://en.cppreference.com/w/c · 모든 표준 함수·문법의 정확한 정의.
- **Arduino 언어 레퍼런스** — https://docs.arduino.cc/language-reference/ · 보드 함수·문법.
- **Arduino UNO R4 WiFi 공식** — https://docs.arduino.cc/hardware/uno-r4-wifi/ · 핀맵·LED 매트릭스·사양.
- **GCC 공식** — https://gcc.gnu.org/onlinedocs/ · 컴파일러 옵션(`-Wall -Wextra`)·경고 의미.
- **Learn-C.org (인터랙티브 입문)** — https://www.learn-c.org/ · 브라우저에서 바로 실행하며 학습.

---

## 1주차 · OT·환경설정·왜 C인가
- 컴파일러 vs 인터프리터 개념 — https://en.wikipedia.org/wiki/Compiler · https://en.wikipedia.org/wiki/Interpreter_(computing)
- C 언어 개요·역사 — https://en.wikipedia.org/wiki/C_(programming_language)
- 왜 임베디드는 C인가(트렌드) — [2026 트렌드 검토](review.md)

## 2주차 · 표준 출력(printf)
- `printf` 형식 지정자 정확한 규칙 — https://en.cppreference.com/w/c/io/fprintf · **표로 정리된 형식·폭·정밀도**.
- 이스케이프 시퀀스(`\n`,`\t`) — https://en.cppreference.com/w/c/language/escape

## 3주차 · 입력·변수·자료형
- C 자료형과 크기 — https://en.cppreference.com/w/c/language/type · https://en.cppreference.com/w/c/types/limits
- 정수 오버플로 개념 — https://en.wikipedia.org/wiki/Integer_overflow
- 2의 보수(음수 표현) — https://en.wikipedia.org/wiki/Two%27s_complement · **비트 그림으로 이해하기 좋음**.

## 4주차 · 연산자
- **연산자 우선순위·결합성 표** — https://en.cppreference.com/w/c/language/operator_precedence · 시험·실수 방지 필수.
- 비트 연산 — https://en.wikipedia.org/wiki/Bitwise_operation · **각 연산의 비트 다이어그램**.

## 5주차 · 조건문 + LED 표정
- `if`/`switch` 문법 — https://en.cppreference.com/w/c/language/if · https://en.cppreference.com/w/c/language/switch
- Arduino LED 매트릭스 튜토리얼 — https://docs.arduino.cc/tutorials/uno-r4-wifi/led-matrix/ · **좌표·프레임 예시 그림**.

## 6주차 · 반복문 + 애니메이션
- `for`/`while`/`do-while` — https://en.cppreference.com/w/c/language/for · https://en.cppreference.com/w/c/language/while
- `break`/`continue` — https://en.cppreference.com/w/c/language/break

## 7주차 · 함수 + 시리얼 제어
- 함수 선언·정의 — https://en.cppreference.com/w/c/language/functions
- 함수 포인터 개념 — https://en.wikipedia.org/wiki/Function_pointer · 디스패치 테이블 아이디어.

## 8주차 · 중간고사
- 코드 추적 연습 — [정보처리기사 실기](exam-prep.md)

## 9주차 · 함수와 변수(스코프)
- 스코프·저장 기간(storage duration) — https://en.cppreference.com/w/c/language/storage_duration
- 변수 범위 개념 — https://en.wikipedia.org/wiki/Scope_(computer_science)

## 10주차 · 배열(1D) + 막대그래프
- 배열 — https://en.cppreference.com/w/c/language/array
- 이진 탐색 — https://en.wikipedia.org/wiki/Binary_search_algorithm · **탐색 범위 좁히는 그림**.
- 이동평균(필터) — https://en.wikipedia.org/wiki/Moving_average

## 11주차 · 배열(2D)·통신 + WiFi
- C 문자열 처리 — https://en.cppreference.com/w/c/string/byte · `strlen`/`strcpy`/`strcmp`/`strtok`.
- 점유격자(occupancy grid) — https://en.wikipedia.org/wiki/Occupancy_grid_mapping · **로봇 맵 그림**.

## 12주차 · 포인터 기초
- 포인터 — https://en.cppreference.com/w/c/language/pointer
- 포인터 개념(그림) — https://en.wikipedia.org/wiki/Pointer_(computer_programming) · **주소→값 화살표 그림**.
- 메모리 세그먼트(스택/힙/데이터) — https://en.wikipedia.org/wiki/Data_segment

## 13주차 · 포인터 활용·재귀
- 재귀 — https://en.wikipedia.org/wiki/Recursion_(computer_science) · **호출 트리 그림**.
- 하노이탑 — https://en.wikipedia.org/wiki/Tower_of_Hanoi · **이동 애니메이션**.

## 14주차 · 구조체 + 연결리스트
- 구조체 — https://en.cppreference.com/w/c/language/struct
- 연결리스트 — https://en.wikipedia.org/wiki/Linked_list · **노드→노드 포인터 그림**.
- 동적 메모리(malloc/free) — https://en.cppreference.com/w/c/memory/malloc

## 15주차 · C↔ROS2·로봇·기말
- **ROS2 공식 문서** — https://docs.ros.org/en/humble/ · 토픽·노드·pub/sub 개념 그림.
- **micro-ROS**(MCU가 ROS2 노드) — https://micro.ros.org/
- Stella N2 로봇 — https://idearobot.gitbook.io/stella-n2

---

## 🖼 "이해를 돕는 그림"은 어디서 보나
- **개념 다이어그램(이 과목 원본 24종)**: 각 주차 강의 페이지 · [심화 개념 노트](advanced-notes.md)에 임베드됨.
- **외부 그림**: 위 링크(위키백과·cppreference·Arduino 공식)에서 직접 확인 — 저작권상 여기 옮기지 않음.
- **직접 실행하며 보기**: [Learn-C.org](https://www.learn-c.org/) 또는 [godbolt.org](https://godbolt.org/)(컴파일러 결과 시각화).

> 링크는 **공식·표준 출처 위주**로 골랐다(광고성·부정확 사이트 지양). 접속 안 되면 검색어로: "cppreference \<함수명\>", "Arduino \<기능\>".
