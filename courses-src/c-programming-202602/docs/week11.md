# 11주차 · 배열(2D)·통신 + WiFi
> C언어 · 미래모빌리티학과 | CLO2·CLO4 | 교재 Ch11 | Arduino UNO R4 WiFi

이번 주차는 1차원 배열을 한 줄의 데이터로 보던 관점을 **표, 격자, 지도, 화면**으로 확장하는 시간이다. 2차원 배열을 이해하면 LED Matrix, 게임판, 좌석표, 이미지, 로봇의 격자 지도처럼 행(row)과 열(column)을 가진 데이터를 C로 표현할 수 있다. 여기에 문자열 배열과 WiFi 명령을 연결하면, 브라우저에서 보낸 `/run`, `/stop`, `/packet` 같은 요청이 C 코드의 조건문과 함수 호출로 이어지는 구조도 이해할 수 있다.

!!! note "이번 자료에 반영한 원본 강의자료"
    - `11-1. 배열-2.pdf`
    - `11-2. 배열-2 실습.pdf`

![11주차 학습 목표](img/pdf-crops/week11_learning_goals.png)

---

## 학습 목표

이번 주차를 마치면 학생은 다음을 설명하고 구현할 수 있어야 한다.

- 순차 탐색과 이진 탐색의 차이를 설명하고, 배열에서 원하는 값을 찾는 흐름을 추적한다.
- `int data[3][5]`처럼 2차원 배열을 선언하고 `data[row][col]` 형식으로 접근한다.
- 2차원 배열 초기화에서 행별 중괄호를 쓰는 이유를 설명한다.
- 중첩 반복문으로 2차원 배열 전체를 출력하거나 계산한다.
- Arduino UNO R4 WiFi의 12x8 LED Matrix를 `frame[8][12]` 배열로 생각한다.
- 문자열 명령과 HTTP 요청을 C의 문자 배열, 문자열 비교, 함수 호출과 연결한다.
- ROS2에서 센서 배열, occupancy grid, 문자열 토픽이 왜 C 배열 개념과 이어지는지 설명한다.

---

## 이번 주차의 큰 그림

10주차에는 `scores[0]`, `scores[1]`처럼 한 줄로 놓인 데이터를 다루었다. 11주차에는 그 한 줄이 여러 줄로 쌓인다.

```c
int scores[2][3] = {
    {90, 85, 77},
    {88, 91, 95}
};
```

위 배열은 "학생 2명 x 과목 3개" 점수표다. `scores[0][2]`는 0번 학생의 2번 과목 점수이고, `scores[1][0]`은 1번 학생의 0번 과목 점수다. 2차원 배열을 어렵게 느끼는 이유는 값이 많아서가 아니라, **첫 번째 인덱스가 행인지 열인지**를 머릿속에서 놓치기 때문이다.

!!! tip "읽는 순서"
    `data[row][col]`은 "row번째 줄로 내려간 뒤 col번째 칸으로 이동한다"라고 읽으면 된다. LED Matrix에서는 `frame[행][열]`, 틱택토에서는 `board[행][열]`, 점수표에서는 `score[학생][과목]`처럼 상황에 맞게 이름을 붙이면 훨씬 덜 헷갈린다.

---

## 3시간 강의 운영안

| 시간 | 내용 | 교수자 활동 | 학생 활동 |
|------|------|-------------|-----------|
| 0~20분 | 10주차 배열 복습 | 1차원 배열, `sizeof`, 반복문 복습 | 배열 원소 개수 계산 퀴즈 |
| 20~45분 | 순차 탐색과 이진 탐색 | 탐색 과정을 그림으로 추적 | 찾는 값이 몇 번 비교되는지 표시 |
| 45~80분 | 2차원 배열 개념 | 행/열, 인덱스, 메모리 배치 설명 | `data[1][2]` 위치 찾기 |
| 80~110분 | 2차원 배열 초기화와 중첩 반복 | 점수표 예제 라이브 코딩 | 학생별 총점·평균 계산 |
| 110~145분 | 실습: 틱택토 판과 격자 출력 | `board[3][3]`, `grid[8][12]` 구조 설명 | 빈 칸 검사, 좌표 입력 처리 |
| 145~170분 | Arduino R4 Matrix + WiFi | `frame[8][12]`, `/run`, `/packet` 연결 | 브라우저에서 보드 상태 확인 |
| 170~180분 | ROS2 연결과 정리 | occupancy grid, 문자열 토픽 연결 | 형성평가 3문제 풀이 |

---

## 1. 배열 탐색 복습

### 1.1 순차 탐색

순차 탐색(sequential search)은 배열의 첫 번째 원소부터 마지막 원소까지 차례대로 비교하는 방법이다. 배열이 정렬되어 있지 않아도 사용할 수 있지만, 원하는 값이 뒤쪽에 있거나 없으면 모든 원소를 확인해야 한다.

![순차 탐색 개념](img/pdf-crops/week11_sequential_search_concept.png)

```c
int data[] = {5, 4, 1, 3, 2, 7, 6};
int key = 3;
int found = -1;

for (int i = 0; i < 7; i++) {
    if (data[i] == key) {
        found = i;
        break;
    }
}
```

여기서 중요한 부분은 `break`다. 값을 찾았는데도 계속 반복하면 불필요한 비교를 하게 된다. 배열 탐색 실습에서는 "언제 멈추는가"를 반드시 함께 봐야 한다.

![순차 탐색 코드 시작](img/pdf-crops/week11_sequential_search_code_start.png)
![순차 탐색 분기](img/pdf-crops/week11_sequential_search_code_branch.png)
![순차 탐색 결과](img/pdf-crops/week11_sequential_search_result.png)

### 1.2 이진 탐색

이진 탐색(binary search)은 배열의 가운데 값을 먼저 보고, 찾는 값이 가운데보다 작으면 왼쪽 절반, 크면 오른쪽 절반만 다시 탐색하는 방법이다. 비교 횟수가 빠르게 줄어들지만 조건이 있다. **배열이 먼저 정렬되어 있어야 한다.**

![이진 탐색 개념](img/pdf-crops/week11_binary_search_concept.png)
![이진 탐색 수행 과정](img/pdf-crops/week11_binary_search_process.png)

```c
int binary_search(const int data[], int count, int key)
{
    int low = 0;
    int high = count - 1;

    while (low <= high) {
        int mid = (low + high) / 2;

        if (data[mid] == key) {
            return mid;
        }
        if (key < data[mid]) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    return -1;
}
```

!!! warning "이진 탐색의 전제"
    이진 탐색은 빠르지만, 정렬되지 않은 배열에서는 올바른 결과를 보장하지 않는다. 그래서 10주차와 11주차 실습이 자연스럽게 이어진다. 먼저 선택 정렬로 배열을 정렬하고, 그 다음 이진 탐색을 수행한다.

![이진 탐색 코드 시작](img/pdf-crops/week11_binary_search_code_start.png)
![이진 탐색 함수](img/pdf-crops/week11_binary_search_function.png)
![이진 탐색 결과](img/pdf-crops/week11_binary_search_result.png)

---

## 2. 2차원 배열이란

2차원 배열은 같은 자료형의 값을 행과 열로 배치한 배열이다. 수학의 행렬, 엑셀 표, 좌석표, 게임판, LED Matrix가 모두 2차원 배열로 생각할 수 있는 예다.

```c
int data[3][5];
```

위 선언은 정수 15개를 저장할 수 있는 배열을 만든다.

- 행(row): 3개
- 열(column): 5개
- 전체 원소 수: `3 * 5 = 15`
- 접근 형식: `data[행][열]`

![다차원 배열 개념](img/pdf-crops/week11_multidim_concept.png)
![2차원 배열 인덱스와 참조](img/pdf-crops/week11_2d_index_memory.png)

### 2.1 인덱스는 0부터 시작한다

`int data[3][5];`에서 사용할 수 있는 행 인덱스는 `0, 1, 2`이고, 열 인덱스는 `0, 1, 2, 3, 4`다.

```c
data[1][2] = 10;
```

이 코드는 "1행 2열" 위치에 10을 저장한다. 초보자가 자주 하는 실수는 `data[3][5]`를 마지막 칸이라고 생각하는 것이다. 하지만 `data[3][5]`는 범위를 벗어난 접근이다.

!!! warning "범위 오류"
    `data[3][5]`처럼 선언된 크기와 같은 숫자를 인덱스로 쓰면 안 된다. 크기가 3이면 마지막 인덱스는 2이고, 크기가 5이면 마지막 인덱스는 4다.

---

## 3. 2차원 배열 초기화

2차원 배열도 1차원 배열처럼 선언과 동시에 값을 넣을 수 있다. 다만 행과 열이 보이도록 중괄호를 나누어 쓰는 것이 좋다.

### 3.1 권장하지 않는 초기화

```c
int data[3][5] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
```

컴파일은 가능하지만 어느 값이 어느 행에 들어가는지 눈에 잘 보이지 않는다.

![2차원 배열 초기화 - 나열](img/pdf-crops/week11_2d_init_flat.png)

### 3.2 권장하는 초기화

```c
int data[3][5] = {
    {1, 2, 3, 4, 5},
    {6, 7, 8, 9, 10},
    {11, 12, 13, 14, 15}
};
```

행별로 중괄호를 나누면 코드가 표처럼 보인다. 2차원 배열은 눈으로 구조를 확인하는 것이 중요하므로, 수업에서는 이 방식을 기본으로 사용한다.

![2차원 배열 초기화 - 행별 구분](img/pdf-crops/week11_2d_init_grouped.png)
![2차원 배열 메모리 배치](img/pdf-crops/week11_2d_memory_layout.png)

### 3.3 메모리에는 한 줄로 저장된다

C에서 2차원 배열은 화면에는 표처럼 보이지만, 메모리에는 행 우선(row-major) 순서로 연속 저장된다.

```text
data[0][0], data[0][1], data[0][2], ...
data[1][0], data[1][1], data[1][2], ...
```

이 사실은 나중에 포인터와 배열을 배울 때 중요해진다. 지금은 "겉으로는 표, 내부적으로는 연속된 칸"이라고 이해하면 충분하다.

---

## 4. 중첩 반복문으로 2차원 배열 다루기

2차원 배열 전체를 출력하거나 합계를 구하려면 반복문이 두 겹 필요하다.

```c
for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 5; c++) {
        printf("%3d", data[r][c]);
    }
    printf("\n");
}
```

바깥쪽 반복문은 행을 바꾸고, 안쪽 반복문은 열을 이동한다. 그래서 `printf("\n")`은 안쪽 반복문이 끝난 뒤 실행해야 한 행 출력이 끝난다.

| 반복문 | 의미 | 자주 쓰는 변수 |
|--------|------|----------------|
| 바깥쪽 반복문 | 행을 하나씩 선택 | `r`, `row`, `student` |
| 안쪽 반복문 | 선택된 행 안에서 열을 이동 | `c`, `col`, `subject` |

---

## 5. 실습 1: 선택 정렬 복습

11주차 실습 PDF는 10주차 배열 활용을 이어 받아 선택 정렬, 순차 탐색, 이진 탐색을 다시 다룬다. 이 부분은 "2차원 배열로 넘어가기 전, 1차원 배열을 함수와 반복문으로 충분히 다룰 수 있는가"를 확인하는 복습 구간이다.

![선택 정렬 실습 안내](img/pdf-crops/week11_practice_selection_sort_intro.png)
![선택 정렬 코드 시작](img/pdf-crops/week11_practice_selection_sort_code_start.png)
![선택 정렬 결과](img/pdf-crops/week11_practice_selection_sort_result.png)

---

## 6. 실습 2: 2차원 배열로 점수표 만들기

가장 좋은 2차원 배열 예제는 점수표다.

```c
int scores[2][3] = {
    {90, 85, 77},
    {88, 91, 95}
};
```

이 배열은 다음 표와 같다.

| 학생 | 국어 | 영어 | 수학 |
|------|------|------|------|
| 0번 학생 | 90 | 85 | 77 |
| 1번 학생 | 88 | 91 | 95 |

학생별 총점은 한 행의 합이고, 과목별 평균은 한 열의 평균이다. 그래서 같은 2차원 배열이라도 문제에 따라 반복문의 기준이 달라진다.

```c
for (int student = 0; student < 2; student++) {
    int total = 0;
    for (int subject = 0; subject < 3; subject++) {
        total += scores[student][subject];
    }
    printf("%d번 학생 총점: %d\n", student, total);
}
```

![2차원 배열 점수 입력 실습 안내](img/pdf-crops/week11_practice_score2d_intro.png)
![2차원 배열 점수 입력 코드](img/pdf-crops/week11_practice_score2d_code_start.png)
![2차원 배열 점수 결과](img/pdf-crops/week11_practice_score2d_result.png)

---

## 7. 실습 3: 틱택토 판 만들기

틱택토는 3x3 게임판을 쓰므로 2차원 배열 개념을 설명하기 좋다.

```c
char board[3][3] = {
    {' ', ' ', ' '},
    {' ', ' ', ' '},
    {' ', ' ', ' '}
};
```

`board[row][col]`에 `'O'` 또는 `'X'`를 넣으면 해당 칸에 말이 놓인다. 여기서 중요한 검사는 두 가지다.

- 입력한 행과 열이 0~2 범위 안에 있는가?
- 이미 말이 놓인 칸은 아닌가?

![틱택토 실습 개요](img/pdf-crops/week11_practice_tictactoe_intro.png)
![틱택토 게임판과 좌표 입력](img/pdf-crops/week11_practice_tictactoe_board_input.png)
![틱택토 코드 시작](img/pdf-crops/week11_practice_tictactoe_code_start.png)
![틱택토 결과](img/pdf-crops/week11_practice_tictactoe_result.png)

!!! tip "왜 게임판 예제가 좋은가"
    게임판 예제는 배열 인덱스가 실제 위치와 바로 연결된다. 학생이 `board[2][1]`을 수정했을 때 화면의 어느 칸이 바뀌는지 눈으로 확인할 수 있어 2차원 배열 감각을 잡기 좋다.

---

## 8. 실습 4: 여러 학급의 점수표

2차원 배열을 익힌 뒤에는 "학급 수"라는 한 층을 더 붙여 생각할 수 있다. 예를 들어 학급 3개, 학생 2명, 과목 3개라면 개념적으로는 3차원 배열에 가깝다.

```c
int scores[3][2][3];
```

하지만 처음부터 3차원 배열을 쓰면 어렵다. 수업에서는 먼저 2차원 배열로 한 학급의 점수표를 완성하고, 반복문으로 학급을 바꾸는 방식으로 확장한다.

![학급별 점수표 실습 안내](img/pdf-crops/week11_practice_classes_intro.png)
![학급별 점수 코드 시작](img/pdf-crops/week11_practice_classes_code_start.png)
![학급별 총점 평균 코드](img/pdf-crops/week11_practice_classes_total_avg.png)
![학급별 점수 결과](img/pdf-crops/week11_practice_classes_result.png)

---

## 9. 3차원 배열 맛보기

3차원 배열은 `[면][행][열]` 구조다.

```c
int data[2][3][5];
```

이 배열은 3행 5열짜리 표가 2장 있다고 생각하면 된다.

| 차원 | 예시 | 의미 |
|------|------|------|
| 1차원 | `scores[6]` | 점수 6개 |
| 2차원 | `scores[2][3]` | 학생 2명 x 과목 3개 |
| 3차원 | `scores[3][2][3]` | 학급 3개 x 학생 2명 x 과목 3개 |

![3차원 배열 선언](img/pdf-crops/week11_3d_array_declare.png)
![3차원 배열 초기화](img/pdf-crops/week11_3d_array_init.png)
![3차원 배열 출력](img/pdf-crops/week11_3d_array_output.png)

!!! note "이번 주차에서 3차원 배열은 어디까지?"
    3차원 배열은 개념을 맛보는 정도로 다룬다. 완전히 익히는 것보다 `[면][행][열]` 순서로 인덱스가 늘어난다는 점과, 반복문도 3중 반복으로 확장된다는 점을 이해하는 것이 목표다.

---

## 10. Arduino UNO R4 WiFi: Matrix LED를 2차원 배열로 보기

Arduino UNO R4 WiFi의 LED Matrix는 8행 12열이다. 그래서 다음 배열과 거의 같은 구조로 생각할 수 있다.

```cpp
uint8_t frame[8][12];
```

`frame[2][3] = 1;`이면 2행 3열 LED를 켠다는 뜻이다. 2차원 배열의 행과 열이 실제 LED 위치로 연결되기 때문에, 콘솔 예제보다 훨씬 직관적이다.

![Arduino R4 Matrix LED 회로](img/pdf-crops/week11_arduino_matrix_circuit.png)
![Arduino R4 Matrix LED 보드](img/pdf-crops/week11_arduino_matrix_board.png)
![Arduino R4 Matrix LED 코드](img/pdf-crops/week11_arduino_matrix_code.png)

### 10.1 기존 예제 실행

예제 파일: [`code/arduino/11_wifi_car/11_wifi_car.ino`](code/arduino/11_wifi_car/11_wifi_car.ino)

1. [`arduino_secrets.h.example`](code/arduino/11_wifi_car/arduino_secrets.h.example)을 같은 폴더에 `arduino_secrets.h` 이름으로 복사한다.
2. `SECRET_SSID`, `SECRET_PASS` 값을 본인 WiFi 정보로 바꾼다.
3. Arduino IDE에서 UNO R4 WiFi 보드와 포트를 선택한다.
4. 업로드 후 시리얼 모니터를 `115200`으로 열고 IP 주소를 확인한다.
5. 같은 네트워크의 브라우저에서 `http://보드IP/`로 접속한다.
6. `RUN`, `SLOW`, `STOP` 버튼을 눌러 LED Matrix 상태가 바뀌는지 확인한다.
7. `http://보드IP/packet`에 접속해 `S,42.0,25.0,RUN` 형식의 문자열 패킷을 확인한다.

!!! warning "WiFi 실습 확인 순서"
    IP 주소가 출력되지 않으면 코드 문제가 아니라 네트워크 연결 문제일 가능성이 높다. SSID, 비밀번호, 2.4GHz 지원 여부, 보드와 PC가 같은 네트워크에 있는지부터 확인한다.

---

## 11. 문자열 배열과 통신 명령

C에서 문자열은 `char` 배열이다.

```c
char currentState[16] = "RUN";
```

위 코드는 실제로 다음 문자들을 저장한다.

```text
'R', 'U', 'N', '\0'
```

마지막 `'\0'`은 문자열의 끝을 표시하는 널 문자다. 통신 프로그램에서 문자열을 다룰 때는 버퍼 크기와 끝 문자를 항상 고려해야 한다.

Arduino 예제의 핵심은 문자열 명령을 상태 변경으로 연결하는 것이다.

```cpp
if (request.indexOf("GET /run") >= 0) {
  setState("RUN");
} else if (request.indexOf("GET /stop") >= 0) {
  setState("STOP");
}
```

브라우저에서 `/run`을 요청하면 보드는 문자열을 읽고, 그 문자열 안에 `"GET /run"`이 있는지 검사한다. 찾으면 `currentState`를 `"RUN"`으로 바꾸고 LED Matrix 그림도 바꾼다.

---

## 12. ROS2와의 연결

2차원 배열과 문자열은 ROS2에서도 계속 등장한다.

| C 개념 | Arduino 실습 | ROS2에서의 확장 |
|--------|--------------|-----------------|
| 2차원 배열 | `frame[8][12]` LED Matrix | occupancy grid, costmap, 이미지 |
| 중첩 반복문 | 모든 LED를 지우거나 그리기 | 격자 지도 전체 탐색 |
| 문자열 | HTTP 요청 `/run`, `/stop` | 토픽 이름, 명령 문자열, 로그 |
| 문자열 패킷 | `S,42.0,25.0,RUN` | 센서값을 메시지로 직렬화 |
| 탐색 | 배열에서 값 찾기 | 장애물 셀, 특정 상태 찾기 |

ROS2의 occupancy grid는 로봇 주변 공간을 격자로 표현한다. 각 칸은 비어 있음, 장애물, 모름 같은 값을 가진다. C 수업에서 `grid[row][col]`을 출력하는 연습은 나중에 로봇 지도를 읽고 판단하는 기초가 된다.

```text
0 0 0 1 1 0
0 0 0 1 0 0
0 1 0 0 0 0
```

이런 지도에서 `1`은 장애물, `0`은 이동 가능한 공간이라고 정하면, 로봇은 2차원 배열을 읽어 움직일 방향을 판단할 수 있다.

---

## 13. C 실습 예제

예제 파일: [`code/c/examples/ex11_2d_grid_search.c`](code/c/examples/ex11_2d_grid_search.c)

이 예제는 다음을 한 파일에서 확인한다.

- 순차 탐색과 이진 탐색
- 2차원 배열 점수표 출력
- 학생별 총점과 평균
- 8x12 격자 출력
- 틱택토 보드에 말 놓기

실행 흐름은 다음과 같다.

```text
1. 정렬된 배열에서 24를 이진 탐색한다.
2. 학생 2명 x 과목 3개 점수표를 출력한다.
3. 8x12 격자에 장애물과 로봇 위치를 표시한다.
4. 3x3 틱택토 판에 O와 X를 놓고 출력한다.
```

---

## 14. 자주 막히는 지점

| 막히는 지점 | 원인 | 해결 |
|-------------|------|------|
| `data[3][5]`에 접근함 | 크기와 마지막 인덱스를 혼동 | `3행`이면 마지막 행은 `2`, `5열`이면 마지막 열은 `4` |
| 출력이 한 줄로 붙음 | 안쪽 반복문 뒤 줄바꿈 누락 | 행 반복이 끝날 때 `printf("\n")` 실행 |
| 행과 열이 뒤바뀜 | `data[row][col]` 의미를 놓침 | 변수 이름을 `r`, `c` 대신 `student`, `subject`처럼 구체화 |
| 이진 탐색이 실패함 | 정렬되지 않은 배열 사용 | 먼저 정렬하거나 순차 탐색 사용 |
| 문자열 비교에 `==` 사용 | 배열 주소를 비교함 | C 문자열은 `strcmp` 사용 |
| WiFi 예제가 접속되지 않음 | 네트워크 문제 | SSID, 비밀번호, 같은 네트워크, 2.4GHz 확인 |

---

## 15. 형성평가 체크포인트

- [ ] `int data[3][5];`의 전체 원소 개수를 말할 수 있다.
- [ ] `data[1][2]`가 몇 행 몇 열인지 설명할 수 있다.
- [ ] 2차원 배열을 중첩 반복문으로 출력할 수 있다.
- [ ] 이진 탐색은 정렬된 배열에서만 사용해야 함을 설명할 수 있다.
- [ ] `frame[8][12]`가 Arduino LED Matrix와 어떻게 연결되는지 설명할 수 있다.
- [ ] 문자열 끝에 `'\0'`이 필요한 이유를 말할 수 있다.
- [ ] `/packet` 문자열이 ROS2 메시지로 확장되는 흐름을 설명할 수 있다.

---

## 연습문제

1. `int map[8][12];`의 전체 원소 개수는 몇 개인가?
2. `int data[3][5];`에서 마지막 원소의 인덱스는 무엇인가?
3. 2차원 배열 전체를 출력할 때 반복문이 두 겹 필요한 이유를 설명하라.
4. 이진 탐색을 사용하기 전에 배열에 대해 반드시 확인해야 할 조건은 무엇인가?
5. `"RUN"`을 저장하기 위한 `char` 배열의 최소 크기는 몇 칸인가?
6. `frame[2][8] = 1;`은 LED Matrix에서 어떤 의미인가?
7. `S,42.0,25.0,RUN` 같은 문자열 패킷을 ROS2와 연결하면 어떤 장점이 있는가?

??? success "정답 및 해설"
    1. `96`개다. `8 * 12 = 96`.
    2. `data[2][4]`다. 인덱스는 0부터 시작한다.
    3. 바깥 반복문은 행을 이동하고, 안쪽 반복문은 선택된 행 안에서 열을 이동하기 때문이다.
    4. 배열이 오름차순 또는 내림차순으로 정렬되어 있어야 한다.
    5. 4칸이다. `'R'`, `'U'`, `'N'`, `'\0'`이 필요하다.
    6. 2행 8열 LED를 켠다는 의미다.
    7. 문자열 하나로 거리, 속도, 상태를 함께 보낼 수 있어 PC 브리지나 ROS2 노드에서 파싱해 메시지로 바꾸기 쉽다.

---

## 참조

- 예제 코드: [`code/c/examples/ex11_2d_grid_search.c`](code/c/examples/ex11_2d_grid_search.c)
- Arduino 예제: [`code/arduino/11_wifi_car/11_wifi_car.ino`](code/arduino/11_wifi_car/11_wifi_car.ino)
- Arduino 예제 목록: [`code/arduino.md`](code/arduino.md)
- ROS2 연결 개요: [`ros2-robot.md`](ros2-robot.md)
