# 13주차 · 포인터 활용
> C언어 · 미래모빌리티학과 | CLO2 | 교재 Ch13

이번 주차는 12주차에서 배운 "포인터는 주소를 담는 변수"라는 개념을 실제 프로그램 구조로 확장한다. 포인터와 문자열, 포인터 배열, 배열 포인터, 함수 포인터를 한 번에 다루기 때문에 처음에는 기호가 복잡해 보일 수 있다. 하지만 핵심 질문은 단순하다.

> "값을 직접 들고 있을 것인가, 값이 있는 위치를 가리킬 것인가?"

문자열 목록, 2차원 배열, 메뉴 명령, 센서 처리 함수는 모두 이 질문에서 출발한다. 로봇 프로그램에서는 상태 문자열, 센서 버퍼, 명령 테이블, 콜백 함수가 자주 등장하므로 포인터 활용 문법은 단순 시험 문법이 아니라 이후 ROS2와 장치 제어 코드를 읽기 위한 준비 단계다.

참고한 원본 자료:

- `13-1. 포인터 활용.pptx`
- `13-2. 포인터 활용 실습.pptx`
- `13-3. 포인터 활용 도전문제.pptx`
- `Understanding Pointer Arrays.pptx`

---

## 학습 목표

![포인터 활용 학습 목표](img/pdf-crops/week13_learning_goals.png)

수업이 끝나면 다음을 설명하고 구현할 수 있어야 한다.

- 문자열을 문자 배열과 문자 포인터로 저장하는 차이를 설명한다.
- `char *names[]` 형태의 포인터 배열이 왜 문자열 목록에 적합한지 설명한다.
- `int (*p)[5]` 형태의 배열 포인터가 2차원 배열 처리에 어떻게 쓰이는지 설명한다.
- 함수 포인터와 함수 포인터 배열을 사용하여 메뉴 명령을 함수 호출로 연결한다.
- Arduino UNO R4 WiFi에서 명령 문자열과 함수 포인터를 이용해 LED Matrix 동작을 전환한다.
- ROS2 콜백과 명령 디스패치 구조가 C의 함수 포인터 사고와 어떻게 연결되는지 이해한다.

---

## 이번 주차의 큰 그림

| 구분 | 대표 선언 | 무엇을 가리키는가 | 대표 사용 |
|------|-----------|------------------|-----------|
| 문자 포인터 | `char *p` | 문자열의 첫 문자 주소 | 문자열 상수 참조 |
| 포인터 배열 | `char *names[4]` | 포인터 여러 개 | 문자열 목록, 메뉴 목록 |
| 배열 포인터 | `int (*p)[5]` | 배열 한 줄 전체 | 2차원 배열 행 단위 처리 |
| 함수 포인터 | `int (*fp)(int, int)` | 함수의 시작 주소 | 동작 선택, 콜백, 메뉴 |
| 함수 포인터 배열 | `void (*cmds[])(void)` | 함수 주소 목록 | 명령 디스패치 테이블 |

!!! note "12주차와의 연결"
    12주차는 `int *p`처럼 변수 하나나 배열의 요소를 가리키는 포인터에 집중했다. 13주차는 포인터가 가리키는 대상이 문자열, 배열 한 줄, 함수로 넓어진다. 대상이 바뀌면 선언 모양도 바뀌지만, "주소를 저장하고 그 주소를 통해 접근한다"는 원리는 같다.

---

## 3시간 강의 운영안

| 시간 | 내용 | 교수 활동 | 학생 활동 |
|------|------|-----------|-----------|
| 0~20분 | 12주차 복습 | `&`, `*`, 배열 이름, 포인터 증가를 짧게 재확인 | 주소와 값 구분 퀴즈 |
| 20~55분 | 포인터와 문자열 | 문자 배열과 문자 포인터의 메모리 차이 설명 | 문자열 출력 결과 예측 |
| 55~90분 | 포인터 배열 | 2차원 문자 배열과 포인터 배열 비교 | 메뉴 문자열 목록 구현 |
| 90~120분 | 배열 포인터 | `int (*p)[5]` 선언을 행 단위 관점으로 설명 | 2차원 배열 합계 계산 |
| 120~155분 | 함수 포인터 | 함수 주소, 호출 문법, 함수 포인터 배열 설명 | 계산기 메뉴 구현 |
| 155~180분 | Arduino/ROS2 연결 | 명령 디스패치 테이블과 ROS2 콜백 구조 연결 | 형성평가와 과제 정리 |

---

## 이론-실습 연결표

| 이론 개념 | 바로 해볼 실습 | 확인 질문 |
|---|---|---|
| 문자열은 문자 배열 또는 문자 포인터로 다룬다 | `char sa[]`와 `char *ps` 출력 결과를 비교한다 | 두 선언은 메모리 관점에서 무엇이 다른가? |
| 포인터 배열은 주소 목록이다 | 메뉴 문자열 목록을 `char *menu[]`로 만든다 | 각 원소가 문자열 자체가 아니라 주소라는 점을 설명할 수 있는가? |
| 함수 포인터는 동작을 값처럼 고른다 | 계산기 메뉴를 함수 포인터 배열로 호출한다 | 명령 번호와 함수 배열 순서가 맞아야 하는 이유는 무엇인가? |
| 콜백과 디스패치 | Arduino 명령 함수와 ROS2 콜백 구조를 비교한다 | 이벤트가 도착했을 때 어떤 함수가 호출되는가? |

## 1. 포인터와 문자열

문자열은 문자들의 배열이다. C에는 별도의 `string` 자료형이 없기 때문에 문자열은 `char` 배열 또는 `char *`로 다룬다. 문자열 끝에는 항상 널 문자 `'\0'`가 들어간다. 그래서 `"ABC"`는 화면에는 세 글자처럼 보이지만 메모리에는 `A`, `B`, `C`, `\0` 네 칸이 필요하다.

![문자열과 포인터 개요](img/pdf-crops/week13_string_array_pointer_intro.png)

```c
char sa[10] = "Spacezone";
char *ps = "Spacezone";
```

두 줄 모두 문자열을 사용할 수 있게 해 주지만 의미가 다르다.

- `sa`는 문자 배열이다. 배열 안에 문자열 문자가 복사되어 저장된다.
- `ps`는 문자 포인터다. 문자열 상수가 저장된 위치의 시작 주소를 담는다.
- `sa[i]`와 `*(ps + i)`는 비슷하게 읽을 수 있지만, 저장 공간을 소유하는 방식이 다르다.

![문자 배열과 문자 포인터 코드](img/pdf-crops/week13_string_array_pointer_code.png)
![문자 배열과 문자 포인터 결과](img/pdf-crops/week13_string_array_pointer_result.png)

!!! warning "문자열 상수 수정 주의"
    `char *ps = "ABC";`처럼 문자열 상수를 가리키는 포인터를 만들고 `ps[0] = 'X';`처럼 수정하려 하면 실행 환경에 따라 오류가 날 수 있다. 수정할 문자열은 `char word[] = "ABC";`처럼 배열에 복사해서 사용한다.

---

## 2. 포인터 배열

포인터 배열은 배열의 각 요소가 포인터인 배열이다. 문자열 여러 개를 저장할 때 특히 자주 사용한다.

```c
const char *menu[] = {"RUN", "SLOW", "STOP", "STATUS"};
```

여기서 `menu`는 문자열 네 개를 직접 담는 2차원 배열이 아니다. 각 요소가 문자열 상수의 시작 주소를 담는다.

![포인터 배열 사용 형식](img/pdf-crops/week13_pointer_array_format.png)
![포인터 배열 선언](img/pdf-crops/week13_pointer_array_declaration.png)

### 2차원 문자 배열과 포인터 배열 비교

2차원 문자 배열은 모든 행의 길이가 같다. 가장 긴 문자열에 맞춰 전체 행 크기를 잡기 때문에 짧은 문자열이 많으면 공간이 낭비된다.

```c
char tasks[][10] = {
    "Desk",
    "Computer",
    "Books",
    "USB",
    "EXIT"
};
```

포인터 배열은 각 문자열의 길이에 맞는 저장 공간을 가리킨다. 그래서 문자열 길이가 서로 다를 때 더 유연하다.

![배열과 포인터 배열 비교](img/pdf-crops/week13_array_vs_pointer_array_table.png)
![2차원 배열의 메모리 낭비](img/pdf-crops/week13_2d_array_memory_waste.png)
![레그드 배열 형태의 포인터 배열](img/pdf-crops/week13_ragged_pointer_array_memory.png)
![포인터 배열의 메모리 효율](img/pdf-crops/week13_pointer_array_efficiency.png)

!!! tip "레그드 배열"
    레그드 배열(ragged array)은 각 행의 길이가 일정하지 않은 배열 구조를 말한다. C에서 문자열 목록을 `char *items[]`로 구성하면 각 문자열 길이에 맞춰 참조할 수 있어 레그드 배열처럼 사용할 수 있다.

---

## 3. 포인터 배열은 언제 쓰는가

보충 자료는 포인터 배열이 단순히 문자열 목록에만 쓰이는 것이 아니라 "여러 주소를 묶어 관리하는 구조"라는 점을 강조한다.

![포인터 배열을 쓰는 이유](img/pdf-crops/week13_pointer_arrays_when_why.png)
![여러 문자열 포인터를 다룰 때](img/pdf-crops/week13_pointer_arrays_strings.png)
![동적으로 할당된 데이터 관리](img/pdf-crops/week13_pointer_arrays_dynamic_data.png)
![다차원 배열 대체](img/pdf-crops/week13_pointer_arrays_multidim_replace.png)
![함수 포인터 배열과 명령 디스패치](img/pdf-crops/week13_pointer_arrays_function_dispatch.png)
![배열 데이터 버퍼 관리](img/pdf-crops/week13_pointer_arrays_buffer_management.png)
![포인터 배열 요약](img/pdf-crops/week13_pointer_arrays_summary.png)

정리하면 포인터 배열은 다음 상황에 적합하다.

- 문자열 목록처럼 각 항목의 길이가 서로 다를 때
- 여러 버퍼나 여러 데이터 블록의 주소를 한곳에 모아 관리할 때
- 메뉴 번호를 함수나 문자열에 매핑할 때
- 2차원 배열처럼 보이지만 각 행의 길이가 다를 수 있는 구조가 필요할 때

---

## 4. 배열 포인터

배열 포인터는 "배열 전체를 가리키는 포인터"다. 선언이 헷갈리기 쉽지만 괄호를 기준으로 읽으면 된다.

```c
int a[5] = {10, 20, 30, 40, 50};
int (*ap)[5] = &a;
```

`ap`는 `int` 하나를 가리키는 포인터가 아니다. `int` 5개짜리 배열 하나를 가리킨다. 따라서 `(*ap)[0]`, `(*ap)[1]`처럼 배열 전체를 먼저 꺼낸 뒤 요소에 접근한다.

![배열 포인터 개념](img/pdf-crops/week13_array_pointer_concept.png)
![배열 이름과 배열 포인터 구분](img/pdf-crops/week13_array_name_vs_array_pointer.png)

### 2차원 배열에서의 배열 포인터

2차원 배열은 메모리에 연속된 행(row) 단위로 저장된다. 이때 `int (*row)[4]`처럼 선언하면 한 행씩 이동하며 처리할 수 있다.

```c
int grid[2][4] = {
    {10, 20, 30, 40},
    {50, 60, 70, 80}
};

int (*row)[4] = grid;
printf("%d\n", row[1][2]);  // 70
```

`row + 1`은 `int` 하나가 아니라 `int[4]` 한 줄만큼 이동한다. 그래서 2차원 배열을 함수에 넘길 때 열 개수를 선언에 포함해야 한다.

![2차원 배열 메모리 공간](img/pdf-crops/week13_2d_array_memory_space.png)
![2차원 배열 합계 과정](img/pdf-crops/week13_2d_array_sum_diagram.png)

---

## 5. 함수 포인터

함수도 메모리 어딘가에 저장되어 있고, 함수 이름은 그 함수의 시작 주소처럼 사용할 수 있다. 함수 포인터는 그 주소를 저장한다.

```c
int add(int a, int b) { return a + b; }

int (*fp)(int, int) = add;
int result = fp(10, 20);
```

`int (*fp)(int, int)`는 "정수 두 개를 받아 정수를 반환하는 함수를 가리키는 포인터"라는 뜻이다. 괄호가 중요하다.

![함수 포인터 개념](img/pdf-crops/week13_function_pointer_concept.png)
![함수 포인터 사용 형식](img/pdf-crops/week13_function_pointer_syntax.png)
![함수 포인터와 함수](img/pdf-crops/week13_function_pointer_diagram.png)

### 함수 포인터 배열

메뉴 프로그램에서는 번호에 따라 다른 함수를 호출해야 한다. `if`, `else if`, `switch`로도 가능하지만, 명령이 많아지면 함수 포인터 배열이 더 깔끔하다.

```c
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

int (*ops[])(int, int) = {add, sub, mul};
int choice = 1;
printf("%d\n", ops[choice](10, 3));  // sub 호출, 7 출력
```

![함수 포인터 배열의 역할](img/pdf-crops/week13_function_pointer_array_role.png)
![함수 포인터 배열 선언](img/pdf-crops/week13_function_pointer_array_syntax.png)

!!! note "ROS2 콜백과의 연결"
    ROS2에서 특정 토픽 메시지가 도착했을 때 호출되는 콜백 함수도 "나중에 호출될 함수"라는 관점에서 함수 포인터 사고와 연결된다. C++ ROS2 코드에서는 객체와 람다 표현식까지 함께 쓰지만, 기본 아이디어는 이벤트에 맞는 동작 함수를 연결한다는 것이다.

---

## 6. 실습 1: 문자열과 포인터

목표는 문자 배열과 문자 포인터의 차이를 실행 결과로 확인하는 것이다.

![문자열 실습 코드 시작](img/pdf-crops/week13_practice_string_code_start.png)
![문자열 실습 결과](img/pdf-crops/week13_practice_string_result.png)

수업 중에는 다음을 학생에게 질문한다.

1. `sa`와 `ps`는 각각 무엇을 저장하고 있는가?
2. `sa + i`와 `ps + i`는 어떤 주소를 뜻하는가?
3. `*(ps + i)`는 왜 `ps[i]`와 같은 결과를 내는가?

---

## 7. 실습 2: 포인터 배열로 메뉴 문자열 처리

포인터 배열을 사용하면 문자열 메뉴를 간단하게 만들 수 있다.

![포인터 문자열 메뉴 코드](img/pdf-crops/week13_practice_pointer_string_menu_code.png)
![포인터 문자열 메뉴 결과](img/pdf-crops/week13_practice_pointer_string_menu_result.png)

학생 실습에서는 다음 기능을 추가한다.

- 범위를 벗어난 번호를 입력하면 "잘못된 선택" 출력
- `EXIT`를 입력하거나 번호 5를 입력하면 반복 종료
- 메뉴 문자열을 하나 더 추가하고 전체 개수를 `sizeof`로 계산

---

## 8. 실습 3: 배열 포인터

배열 포인터 실습은 `int (*ap)[5]` 선언을 눈에 익히는 것이 목표다.

![배열 포인터 실습 소개](img/pdf-crops/week13_practice_array_pointer_intro.png)
![배열 포인터 실습 코드](img/pdf-crops/week13_practice_array_pointer_code.png)
![배열 포인터 실습 결과](img/pdf-crops/week13_practice_array_pointer_result.png)

핵심은 `ap`가 `a[0]`의 주소가 아니라 `a` 배열 전체의 주소를 담는다는 점이다. 실제 요소에 접근하려면 `(*ap)[cnt]`처럼 한 번 괄호로 배열을 꺼낸 뒤 인덱스를 붙인다.

---

## 9. 실습 4: 다차원 배열 처리

2차원 배열 합계를 구할 때 배열 포인터가 자연스럽게 등장한다.

![2차원 배열 합계 코드](img/pdf-crops/week13_practice_2d_array_sum_code.png)
![2차원 배열 합계 결과](img/pdf-crops/week13_practice_2d_array_sum_result.png)

```c
int total2d(const int (*grid)[4], int rows)
{
    int sum = 0;
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < 4; ++c) {
            sum += grid[r][c];
        }
    }
    return sum;
}
```

`const int (*grid)[4]`에서 `4`는 열 개수다. 함수가 한 행의 크기를 알아야 `grid[r][c]` 주소를 계산할 수 있다.

---

## 10. 실습 5: 함수 포인터와 메뉴

함수 포인터 실습은 "함수 이름도 주소처럼 다룰 수 있다"는 것을 확인하는 활동이다.

![함수 포인터 사용 형식 코드](img/pdf-crops/week13_practice_function_pointer_syntax_code.png)
![함수 포인터 사용 결과](img/pdf-crops/week13_practice_function_pointer_syntax_result.png)

함수 포인터 배열로 바꾸면 메뉴 번호와 함수 호출을 표처럼 연결할 수 있다.

![함수 포인터 배열 코드 시작](img/pdf-crops/week13_practice_function_pointer_array_code_start.png)
![함수 포인터 배열 호출부](img/pdf-crops/week13_practice_function_pointer_array_calls.png)
![함수 포인터 배열 결과](img/pdf-crops/week13_practice_function_pointer_array_result.png)

---

## 11. 도전문제

### 도전 1: 문자열 포인터 추적

![문자열 포인터 도전문제](img/pdf-crops/week13_challenge_string_pointer_prompt.png)
![문자열 포인터 도전문제 풀이](img/pdf-crops/week13_challenge_string_pointer_answer.png)

핵심 질문:

- `ps = st;` 이후 `ps`는 무엇을 가리키는가?
- `sizeof(st)`는 문자열 길이와 같은가?
- `*(ps + cnt)`는 어떤 문자를 출력하는가?

### 도전 2: 포인터 배열로 문자열 목록 출력

![포인터 배열 도전문제](img/pdf-crops/week13_challenge_pointer_array_prompt.png)
![포인터 배열 도전문제 풀이](img/pdf-crops/week13_challenge_pointer_array_answer.png)

핵심 질문:

- `sizeof(dept) / sizeof(dept[0])`는 무엇을 계산하는가?
- `dept[cnt]`는 문자열인가, 문자열의 주소인가?
- 2차원 문자 배열로 바꾸면 어떤 장단점이 생기는가?

### 도전 3: 배열 포인터 선언 완성

![배열 포인터 도전문제](img/pdf-crops/week13_challenge_array_pointer_prompt.png)
![배열 포인터 도전문제 풀이](img/pdf-crops/week13_challenge_array_pointer_answer.png)

핵심 질문:

- `int (*ap)[5]`에서 괄호가 빠지면 의미가 어떻게 바뀌는가?
- `ap = &a;`와 `ap = a;`는 왜 다르게 보아야 하는가?
- `(*ap)[cnt]`에서 `*ap`는 무엇인가?

---

## 12. C 실습 예제

예제 파일:

- [`code/c/examples/ex13_pointer_applications.c`](code/c/examples/ex13_pointer_applications.c)
- [`code/c/examples/ex13_function_pointer_menu.c`](code/c/examples/ex13_function_pointer_menu.c)

첫 번째 예제는 문자열 포인터, 포인터 배열, 배열 포인터, 다중 결과 반환을 한 파일에서 확인한다. 두 번째 예제는 함수 포인터 배열로 계산기 메뉴를 구성한다.

수업 운영 팁:

1. 먼저 실행 결과만 보여 주고, 어떤 함수가 어떤 데이터를 가리키는지 학생에게 표시하게 한다.
2. `const char *menu[]`에서 `const`를 제거했을 때 어떤 위험이 생기는지 설명한다.
3. 함수 포인터 선언을 직접 쓰기 어렵다면 `typedef`로 별칭을 만든 버전을 함께 보여 준다.

---

## 13. Arduino UNO R4 WiFi 예제

예제 파일: [`code/arduino/13_pointer_dispatch/13_pointer_dispatch.ino`](code/arduino/13_pointer_dispatch/13_pointer_dispatch.ino)

이 예제는 포인터 배열과 함수 포인터 배열을 보드 동작과 연결한다.

- `const char *commandNames[]`로 명령 이름 목록을 만든다.
- `void (*handlers[])()`로 각 명령에 대응하는 함수 주소를 저장한다.
- 시리얼 모니터에서 `0`, `1`, `2`, `3`을 입력하면 LED Matrix 표시가 바뀐다.
- 메뉴 항목과 함수 배열의 순서가 맞아야 한다는 점을 실습으로 확인한다.

이 구조는 나중에 ROS2에서 `/cmd_vel`, `/mode`, `/led_state` 같은 명령을 받아 동작 함수를 호출하는 방식과 연결된다.

---

## 14. ROS2와의 연결

함수 포인터와 포인터 배열은 ROS2 C++ 코드에서 다음 개념으로 이어진다.

| C에서의 개념 | ROS2에서의 연결 |
|-------------|----------------|
| 문자열 포인터 배열 | 토픽 이름, 상태 이름, 명령 이름 목록 |
| 배열 포인터 | LiDAR range 배열, occupancy grid 행 단위 처리 |
| 함수 포인터 | 콜백 함수, 명령 처리 함수 |
| 함수 포인터 배열 | 명령 디스패치 테이블, 상태별 처리 함수 |
| 출력 매개변수 | 여러 센서 분석 결과를 한 번에 채우는 함수 |

예를 들어 로봇 명령을 처리할 때 다음과 같은 흐름을 생각할 수 있다.

```c
typedef void (*CommandHandler)(void);

const char *names[] = {"stop", "slow", "run"};
CommandHandler handlers[] = {stopRobot, slowRobot, runRobot};
```

ROS2에서는 이 구조가 토픽 메시지 수신 콜백, 상태 전환 함수, 명령 처리 함수로 확장된다. 지금은 C 문법으로 작은 메뉴를 만들지만, 이후 로봇 프로그램에서는 같은 생각으로 더 큰 이벤트 처리 구조를 읽게 된다.

---

## 15. 자주 막히는 지점

| 막히는 지점 | 설명 방법 |
|-------------|-----------|
| `char *p`와 `char p[]`를 혼동 | 포인터는 주소를 담고, 배열은 저장 공간을 가진다고 구분한다. |
| `char *names[]`와 `char (*names)[]`를 혼동 | 앞은 포인터 배열, 뒤는 배열을 가리키는 포인터다. 괄호 위치를 먼저 본다. |
| `int (*ap)[5]`가 어렵다 | `ap`를 먼저 찾고, 괄호 안의 `*ap` 때문에 포인터라고 읽은 뒤, 바깥 `[5]`로 배열 크기를 읽는다. |
| 함수 포인터 호출이 낯설다 | `fp(10, 20)`은 `add(10, 20)`처럼 함수 주소를 통해 호출하는 문법이라고 설명한다. |
| 함수 포인터 배열이 과하다고 느낌 | 메뉴, 명령 처리, 콜백처럼 선택지가 많아지는 프로그램에서 구조가 단순해진다는 예를 보여 준다. |

---

## 16. 형성평가 체크포인트

- [ ] 문자열 상수와 문자 배열의 저장 방식 차이를 설명할 수 있다.
- [ ] `const char *items[]`가 포인터 배열임을 설명할 수 있다.
- [ ] 2차원 배열을 함수로 넘길 때 열 개수가 필요한 이유를 설명할 수 있다.
- [ ] `int (*fp)(int, int)` 선언을 읽을 수 있다.
- [ ] 함수 포인터 배열로 메뉴 명령을 함수와 연결할 수 있다.
- [ ] Arduino 예제에서 명령 이름 배열과 함수 배열의 순서가 왜 중요한지 설명할 수 있다.

---


## 📚 참고 레퍼런스 (외부)
- 재귀(호출 트리) https://en.wikipedia.org/wiki/Recursion_(computer_science)
- 하노이탑 https://en.wikipedia.org/wiki/Tower_of_Hanoi
- 전체 정리: [참고 자료 모음](references.md)

## 연습문제

1. `char word[] = "RUN";`과 `char *state = "RUN";`의 차이를 저장 공간 관점에서 설명하시오.
2. `const char *modes[] = {"STOP", "SLOW", "RUN"};`에서 `modes[1]`과 `modes[1][0]`의 의미를 각각 설명하시오.
3. `int a[5]; int (*ap)[5] = &a;`에서 `(*ap)[2]`는 무엇을 의미하는가?
4. `int (*op)(int, int);`가 가리킬 수 있는 함수의 형태를 예로 작성하시오.
5. 함수 포인터 배열이 `switch` 문보다 유리한 상황을 하나 설명하시오.

??? success "정답 및 해설"
    1. `word`는 수정 가능한 문자 배열이고, `state`는 문자열 상수의 시작 주소를 담는 포인터다.
    2. `modes[1]`은 `"SLOW"` 문자열의 시작 주소이고, `modes[1][0]`은 문자 `'S'`다.
    3. `ap`가 가리키는 배열에서 세 번째 요소를 의미한다.
    4. 예: `int add(int a, int b) { return a + b; }`
    5. 메뉴 항목이 많거나 명령과 함수를 표처럼 연결해야 할 때 함수 포인터 배열이 유리하다.

---

## 참조

- C 예제: [`code/c/examples/ex13_pointer_applications.c`](code/c/examples/ex13_pointer_applications.c)
- 함수 포인터 메뉴 예제: [`code/c/examples/ex13_function_pointer_menu.c`](code/c/examples/ex13_function_pointer_menu.c)
- Arduino 예제: [`code/arduino/13_pointer_dispatch/13_pointer_dispatch.ino`](code/arduino/13_pointer_dispatch/13_pointer_dispatch.ino)
- 복습: [12주차 · 포인터 기초](week12.md)
