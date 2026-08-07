# 10주차 · 배열 (1차원) + LED 막대그래프
> C언어 · 미래모빌리티학과 | CLO2·CLO3 | 교재 Ch10 | 원본 PDF: `10-1. 배열`, `10-1. 배열-1`, `10-2. 배열-1 실습`, `10-3. 배열 도전 문제`

![원본 강의자료: 배열 학습 목표](img/pdf-crops/week10_learning_goals.png)

## 학습 목표

- 배열이 필요한 상황을 일반 변수와 비교해 설명할 수 있다.
- 1차원 배열을 선언하고, 중괄호 초기화와 인덱스 대입을 사용할 수 있다.
- 배열 인덱스가 0부터 시작한다는 점과 범위 초과 위험을 설명할 수 있다.
- `for`문으로 배열 원소를 출력하고 합계, 평균, 최댓값, 최솟값을 계산할 수 있다.
- `sizeof(배열) / sizeof(배열[0])`로 원소 개수를 구할 수 있다.
- 문자 배열에서 널 문자(`'\0'`) 공간이 필요한 이유를 설명할 수 있다.
- 배열을 함수에 전달할 때 배열 주소와 원소 개수를 함께 넘겨야 하는 이유를 이해할 수 있다.
- Arduino UNO R4 WiFi의 LED Matrix에 배열 데이터를 막대그래프로 표시할 수 있다.

---

## 이번 주차의 큰 그림

지금까지는 값 하나를 변수 하나에 저장했다. 하지만 실제 센서 데이터와 성적 데이터는 대부분 여러 개다. 예를 들어 6개의 점수, 10개의 예약 상태, 최근 5개의 센서값, LiDAR 거리 배열처럼 같은 종류의 값이 반복해서 등장한다. 이 값을 `score1`, `score2`, `score3`처럼 따로 만들면 코드가 길어지고 반복문을 쓰기 어렵다.

배열(array)은 같은 자료형의 값을 하나의 이름으로 묶고, 인덱스(index)로 각 원소에 접근하는 문법이다.

```text
score[0] score[1] score[2] score[3] score[4] score[5]
  23       45       67       89       55       12
```

배열을 배우면 반복문이 훨씬 강력해진다. `for`문 하나로 모든 원소를 출력하고, 합계를 구하고, 평균을 계산하고, 가장 큰 값을 찾을 수 있다. 이 감각은 이후 2차원 배열, 문자열, 포인터, 구조체 배열, ROS2 센서 배열까지 이어진다.

!!! tip "교수자 설명 포인트"
    배열은 "변수를 많이 만드는 문법"이 아니라 "반복문이 데이터를 순회할 수 있게 만드는 구조"다. 학생이 `score[0]`을 첫 번째 값으로 자연스럽게 읽고, 마지막 인덱스가 `개수 - 1`이라는 점을 몸에 익히게 하는 것이 핵심이다.

---

## 3시간 강의 운영안

| 시간 | 내용 | 교수자 진행 포인트 | 학생 활동 |
|---:|---|---|---|
| 0~10분 | 9주차 복습 | 지역변수 여러 개로 점수 6개를 처리하면 불편한 이유 연결 | `score1`~`score6` 코드 관찰 |
| 10~25분 | 배열의 필요성 | 일반 변수와 배열 비교, 같은 자료형 묶음 설명 | 데이터가 여러 개인 사례 말하기 |
| 25~45분 | 배열 선언 | 자료형, 이름, 크기, 원소 4항목 설명 | 선언문을 구성 요소로 분해 |
| 45~65분 | 인덱스와 초기화 | `score[0]`, `score[5]`, 크기와 원소 수 관계 설명 | 인덱스 표 채우기 |
| 65~80분 | 주의 사항 | 범위 초과, 크기보다 많은 초기값, 초기화 누락 설명 | 오류 코드 고치기 |
| 80~105분 | 배열과 반복문 | `for`문으로 출력, 입력, 합계 계산 | 3과목 점수 합계/평균 작성 |
| 105~120분 | `sizeof` 원소 개수 | 전체 바이트와 원소 바이트 비교 | `count` 계산식 완성 |
| 120~135분 | 문자 배열 | 널 문자와 문자열 길이, 배열 크기 설명 | 문자열 배열 크기 수정 |
| 135~155분 | 배열과 함수 | 배열 전체 전달과 배열 원소 전달 차이 설명 | 함수 호출 결과 예측 |
| 155~170분 | 정렬/탐색 맛보기 | 선택 정렬과 순차 탐색 개념만 흐름 중심으로 소개 | 찾을 값이 몇 번째에 있는지 추적 |
| 170~180분 | Arduino/ROS2 연결 | 점수 배열을 LED 막대그래프로 표시, 센서 배열로 확장 | 배열값 1개 수정 후 결과 관찰 |

---

## 이론-실습 연결표

| 이론 개념 | 바로 해볼 실습 | 확인 질문 |
|---|---|---|
| 배열은 같은 자료형 값의 묶음이다 | 점수 5개를 배열로 선언하고 출력한다 | 인덱스는 왜 0부터 시작하는가? |
| 반복문은 배열 처리의 기본이다 | 합계, 평균, 최댓값, 순차 탐색을 구현한다 | 배열 크기를 직접 숫자로 반복문에 쓰면 어떤 위험이 있는가? |
| 문자 배열은 널 문자가 필요하다 | `"space"`를 저장할 배열 크기를 고친다 | 문자열 길이와 배열 크기는 왜 같지 않을 수 있는가? |
| 센서 배열과 막대그래프 | Arduino Matrix에 배열값을 막대로 표시한다 | 센서값 배열은 ROS2 `/scan` 배열과 어떻게 닮았는가? |

## 1. 배열이란 무엇인가

배열은 같은 종류의 자료형으로 구성된 데이터의 집합이다. 일반 변수는 값 하나를 저장하지만, 배열은 같은 자료형의 값을 여러 개 저장한다.

![원본 강의자료: 배열의 개념](img/pdf-crops/week10_array_concept.png)

### 배열을 사용하는 이유

학생 50명의 5개 과목 성적을 처리한다고 생각해 보자. 일반 변수만 사용하면 250개의 변수가 필요하다. 배열을 사용하면 한 학생의 점수, 한 과목의 점수, 전체 점수 묶음을 하나의 이름과 번호로 처리할 수 있다.

![원본 강의자료: 배열을 사용하는 이유와 데이터 접근](img/pdf-crops/week10_array_reason_access.png)

| 일반 변수 방식 | 배열 방식 |
|---|---|
| `score1`, `score2`, `score3`처럼 이름이 늘어난다. | `score[0]`, `score[1]`, `score[2]`처럼 번호로 접근한다. |
| 반복문으로 처리하기 어렵다. | `for`문으로 전체를 순회할 수 있다. |
| 값이 많아질수록 수정이 어렵다. | 개수와 반복 조건만 맞추면 구조가 유지된다. |

### Python list와 C 배열의 차이

Python list를 먼저 접한 학생은 C 배열이 답답하게 느껴질 수 있다. C 배열은 크기가 고정되고, 같은 자료형만 저장하며, 범위 검사를 자동으로 해 주지 않는다.

![원본 강의자료: Python list와 C 배열](img/pdf-crops/week10_python_vs_c_array.png)

| 구분 | Python list | C 배열 |
|---|---|---|
| 크기 | 실행 중 변경 가능 | 선언한 크기 기준으로 고정 |
| 자료형 | 여러 타입 혼합 가능 | 같은 자료형 원소 |
| 길이 확인 | `len(nums)` | `sizeof(nums) / sizeof(nums[0])` |
| 범위 검사 | IndexError 발생 | 범위 밖 접근은 미정의 동작 가능 |
| 대표 용도 | 데이터 처리, 빠른 실험 | 임베디드, 하드웨어 제어, 저수준 메모리 |

---

## 2. 배열 선언과 초기화

배열 선언에는 자료형, 배열 이름, 배열 크기, 배열 원소가 관여한다.

![원본 강의자료: 배열 선언을 위한 4가지 항목](img/pdf-crops/week10_declaration_four_items.png)

```c
int score[6] = {23, 45, 67, 89, 55, 12};
```

| 부분 | 의미 |
|---|---|
| `int` | 배열 원소의 자료형 |
| `score` | 배열 이름 |
| `[6]` | 원소 개수 |
| `{23, ...}` | 각 원소의 초기값 |

### 2.1 자료형, 이름, 크기

배열의 자료형은 각 원소의 자료형이다. 정수 배열, 문자 배열, 실수 배열처럼 만들 수 있다.

![원본 강의자료: 배열 자료형 예시](img/pdf-crops/week10_array_type_examples.png)

배열 이름은 전체 묶음의 대표 이름이고, 배열 크기는 원소 개수다.

![원본 강의자료: 배열 이름과 크기](img/pdf-crops/week10_name_and_size.png)

수업에서는 배열 크기를 상수로 두는 습관을 권장한다.

![원본 강의자료: 배열 크기 지정 규칙](img/pdf-crops/week10_size_constant_rule.png)

```c
#define SCORE_COUNT 6

int score[SCORE_COUNT] = {23, 45, 67, 89, 55, 12};
```

!!! warning "배열 크기와 마지막 인덱스"
    `int score[6]`에서 6은 원소 개수다. 유효한 인덱스는 `0`부터 `5`까지다. 마지막 인덱스는 항상 `원소 개수 - 1`이다.

### 2.2 초기값 개수와 배열 크기

배열 크기와 초기값 개수가 같으면 각 원소가 순서대로 채워진다.

![원본 강의자료: 배열 크기와 요소 수가 같은 경우](img/pdf-crops/week10_init_same_count.png)

배열 크기보다 초기값이 많으면 오류가 발생한다. 반대로 초기값이 적으면 나머지는 0으로 채워진다.

![원본 강의자료: 배열 초기값 개수 불일치](img/pdf-crops/week10_init_mismatch.png)

```c
int a[3] = {10, 20, 30};      // 정상
int b[3] = {10, 20, 30, 40};  // 오류
int c[3] = {10};              // c[0]=10, c[1]=0, c[2]=0
```

### 2.3 중괄호 초기화와 인덱스 대입

배열은 중괄호로 한 번에 초기화할 수도 있고, 각 인덱스에 값을 따로 대입할 수도 있다.

![원본 강의자료: 배열의 중괄호 초기화](img/pdf-crops/week10_init_brace_format.png)

![원본 강의자료: 배열 요소 인덱스별 대입](img/pdf-crops/week10_init_index_assignment.png)

```c
int score[3] = {90, 80, 70};

score[0] = 95;
score[1] = 88;
score[2] = 76;
```

특정 인덱스만 초기화하면 나머지 원소는 0으로 채워진다.

![원본 강의자료: 특정 인덱스만 초기화](img/pdf-crops/week10_partial_initialization.png)

### 2.4 배열 사용 시 주의할 사항

![원본 강의자료: 배열을 사용할 때 주의할 사항](img/pdf-crops/week10_array_cautions.png)

| 주의 | 설명 |
|---|---|
| 범위 초과 | `score[6]`처럼 마지막 다음 칸에 접근하지 않는다. |
| 초기화 누락 | 자동으로 의미 있는 값이 들어 있다고 생각하지 않는다. |
| 전체 출력 불가 | 배열 이름 하나로 전체 원소가 예쁘게 출력되지 않는다. |
| 크기 변경 불가 | 선언한 배열 크기는 실행 중 마음대로 늘릴 수 없다. |

---

## 3. 배열과 반복문

배열의 진짜 힘은 반복문과 함께 사용할 때 나온다.

![원본 강의자료: 반복문에서 배열이 필요한 이유](img/pdf-crops/week10_loop_array_need.png)

### 3.1 for문으로 배열 원소 출력

![원본 강의자료: for문으로 배열 요소 출력](img/pdf-crops/week10_for_print_code.png)

```c
#include <stdio.h>

int main(void)
{
    int score[6] = {23, 45, 67, 89, 55, 12};

    for (int i = 0; i < 6; i++) {
        printf("score[%d] = %d\n", i, score[i]);
    }

    return 0;
}
```

반복문의 핵심은 `i < 6`이다. `i <= 6`으로 쓰면 `score[6]`에 접근하게 되어 배열 밖으로 나간다.

### 3.2 입력, 합계, 평균

원본 실습은 3개 과목 점수를 배열에 입력하고 총점과 평균을 출력한다.

![원본 강의자료: 배열로 총점과 평균 출력](img/pdf-crops/week10_score_total_intro.png)

![원본 강의자료: 배열 점수 입력 코드](img/pdf-crops/week10_score_total_input.png)

![원본 강의자료: 배열 총점과 평균 결과](img/pdf-crops/week10_score_total_result.png)

```c
#include <stdio.h>

#define SUBJECT_COUNT 3

int main(void)
{
    int score[SUBJECT_COUNT];
    int sum = 0;

    for (int i = 0; i < SUBJECT_COUNT; i++) {
        printf("%d번째 과목 점수: ", i + 1);
        scanf_s("%d", &score[i]);
        sum += score[i];
    }

    printf("총점: %d\n", sum);
    printf("평균: %.2f\n", (double)sum / SUBJECT_COUNT);
    return 0;
}
```

!!! tip "입력과 계산을 한 번에 할 수도 있다"
    점수를 입력받는 반복문 안에서 바로 합계를 누적하면 별도의 두 번째 반복문이 필요 없다. 다만 처음 배우는 단계에서는 입력 반복문과 계산 반복문을 분리해 인덱스 흐름을 확인해도 좋다.

### 3.3 랜덤 배열

배열은 랜덤 값 여러 개를 저장하고 출력할 때도 편하다.

![원본 강의자료: 배열 요소 값을 랜덤하게 출력](img/pdf-crops/week10_random_array_intro.png)

![원본 강의자료: srand와 rand로 배열 채우기](img/pdf-crops/week10_random_array_seed.png)

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define COUNT 10

int main(void)
{
    int data[COUNT];

    srand((unsigned int)time(NULL));

    for (int i = 0; i < COUNT; i++) {
        data[i] = rand() % 100;
        printf("data[%d] = %d\n", i, data[i]);
    }

    return 0;
}
```

---

## 4. 배열 원소 개수 구하기

배열 원소 개수는 전체 배열 바이트 수를 원소 하나의 바이트 수로 나누면 된다.

![원본 강의자료: 배열 요소의 개수 구하기](img/pdf-crops/week10_sizeof_count_intro.png)

![원본 강의자료: sizeof로 배열 원소 개수 계산](img/pdf-crops/week10_sizeof_count_code.png)

```c
int point[] = {23, 35, 2, 9, 75, 96, 82, 16, 48, 85, 33, 67, 95, 37};
int count = sizeof(point) / sizeof(point[0]);
```

주의할 점은 이 계산식이 함수 매개변수로 넘어간 배열에는 그대로 적용되지 않는다는 것이다. 함수에 배열을 넘기면 배열 전체가 아니라 첫 원소의 주소가 전달되기 때문이다. 그래서 함수에는 배열과 원소 개수를 함께 넘겨야 한다.

---

## 5. 문자 배열과 널 문자

문자열은 문자 배열에 저장한다. C 문자열은 마지막에 널 문자(`'\0'`)가 있어야 끝을 알 수 있다.

원본 실습은 공간이 부족한 문자 배열 문제를 보여 준다.

![원본 강의자료: 문자 배열 널 문자 공간 부족](img/pdf-crops/week10_char_array_null_problem.png)

```c
char chs1[6] = "apple";       // a p p l e '\0'
char chs2[6] = "apple";
```

`"apple"`은 글자 5개처럼 보이지만 실제 저장에는 마지막 널 문자까지 6칸이 필요하다.

### 문자열 길이 구하기

![원본 강의자료: 입력한 문자열 길이 구하기](img/pdf-crops/week10_string_length_intro.png)

![원본 강의자료: 문자열 길이 코드](img/pdf-crops/week10_string_length_code.png)

```c
#include <stdio.h>

int main(void)
{
    char text[20];
    int length = 0;

    printf("문자열 입력: ");
    scanf_s("%19s", text, (unsigned int)sizeof(text));

    while (text[length] != '\0') {
        length++;
    }

    printf("문자열 길이: %d\n", length);
    return 0;
}
```

!!! warning "문자 배열 크기"
    입력받을 최대 글자 수보다 배열 크기를 1 크게 잡아야 한다. 마지막 한 칸은 `'\0'`이 들어갈 공간이다.

---

## 6. 배열과 함수

배열은 함수에서도 사용할 수 있다. 이때 배열 원소 전체가 복사되는 것이 아니라 배열의 시작 주소가 전달된다.

![원본 강의자료: 배열로 사용자 정의 함수 호출](img/pdf-crops/week10_array_function_intro.png)

![원본 강의자료: 배열로 함수 호출 흐름](img/pdf-crops/week10_array_function_flow.png)

```c
int sum_array(const int arr[], int count)
{
    int sum = 0;

    for (int i = 0; i < count; i++) {
        sum += arr[i];
    }

    return sum;
}
```

함수 선언에서 `const int arr[]`라고 쓰면 "이 함수는 배열 값을 읽기만 하고 바꾸지 않겠다"는 뜻을 드러낼 수 있다.

### 배열 전체 전달과 배열 원소 전달

배열 전체를 함수에 넘기면 원본 배열을 함수 안에서 바꿀 수 있다. 하지만 배열의 한 원소만 넘기면 그 값은 일반 변수처럼 복사되어 전달된다.

![원본 강의자료: 배열 요소를 인수로 전달](img/pdf-crops/week10_element_argument_intro.png)

![원본 강의자료: 배열 요소 인수 전달 코드](img/pdf-crops/week10_element_argument_code.png)

```c
void change_value(int value)
{
    value = 100;
}

void change_array(int arr[])
{
    arr[0] = 100;
}
```

| 호출 | 결과 |
|---|---|
| `change_value(score[0]);` | `score[0]` 원본은 바뀌지 않는다. |
| `change_array(score);` | `score[0]` 원본이 바뀔 수 있다. |

---

## 7. 배열 활용: 예약 관리 프로그램

배열은 "여러 상태"를 저장할 때도 쓸 수 있다. 원본 실습의 예약 관리 프로그램은 10개의 자동차 모델 예약 상태를 `0`과 `1`로 저장한다.

![원본 강의자료: 예약 관리 프로그램](img/pdf-crops/week10_reservation_intro.png)

![원본 강의자료: 예약 관리 코드 시작](img/pdf-crops/week10_reservation_code_start.png)

```c
int reserved[10] = {0};

/* 0이면 예약 가능, 1이면 이미 예약됨 */
reserved[model - 1] = 1;
```

여기서 사용자가 1번 모델을 입력하면 배열 인덱스는 `0`이다. 사용자 번호와 배열 인덱스가 1 차이 난다는 점이 중요하다.

| 사용자 입력 | 배열 인덱스 |
|---:|---:|
| 1 | 0 |
| 2 | 1 |
| 10 | 9 |

---

## 8. 정렬과 탐색 맛보기

정렬과 탐색은 배열이 있어야 자연스럽게 설명할 수 있는 대표 알고리즘이다. 이번 주차에서는 원리를 맛보고, 깊은 분석은 이후 심화에서 다룬다.

### 선택 정렬

선택 정렬(selection sort)은 아직 정렬되지 않은 부분에서 가장 작은 값을 찾아 앞쪽으로 교환하는 방식이다.

![원본 강의자료: 선택 정렬 개념](img/pdf-crops/week10_selection_sort_concept.png)

![원본 강의자료: 선택 정렬 코드](img/pdf-crops/week10_selection_sort_code.png)

### 순차 탐색

순차 탐색(sequential search)은 배열의 처음부터 끝까지 하나씩 비교하면서 원하는 값을 찾는 방법이다.

![원본 강의자료: 순차 탐색 개념](img/pdf-crops/week10_sequential_search_concept.png)

![원본 강의자료: 순차 탐색 코드](img/pdf-crops/week10_sequential_search_code.png)

```c
int find_index(const int arr[], int count, int target)
{
    for (int i = 0; i < count; i++) {
        if (arr[i] == target) {
            return i;
        }
    }

    return -1;
}
```

---

## 9. C 실습 예제: 통계, 탐색, 이동평균

예제 파일: [`code/c/examples/ex10_array_stats.c`](code/c/examples/ex10_array_stats.c)

이 예제는 하나의 배열로 다음 내용을 모두 확인한다.

- 전체 원소 출력
- 원소 개수 계산
- 합계와 평균
- 최댓값과 최솟값
- 순차 탐색
- 선택 정렬
- 윈도우 3 이동평균

```c
int scores[] = {23, 45, 67, 89, 55, 12};
int count = (int)(sizeof(scores) / sizeof(scores[0]));

print_array(scores, count);
printf("average = %.2f\n", average(scores, count));
selection_sort(scores, count);
```

!!! note "이동평균과 모빌리티"
    이동평균은 최근 몇 개의 센서값을 평균내어 흔들림을 줄이는 기본 필터다. 배열은 최근 샘플을 저장하는 창(window)이 되고, 반복문은 창 안의 값을 합산한다.

---

## 10. Arduino UNO R4 WiFi: LED 막대그래프

예제 파일: [`code/arduino/10_array_bar_graph/10_array_bar_graph.ino`](code/arduino/10_array_bar_graph/10_array_bar_graph.ino)

배열에 저장된 점수를 12x8 LED Matrix의 막대그래프로 표시한다. 점수 배열의 각 원소는 막대 하나가 되고, 점수는 0~8 높이로 환산된다.

```cpp
const int scores[] = {23, 45, 67, 89, 55, 12};

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
```

수업 진행:

1. `scores[]`의 값을 바꾼다.
2. 시리얼 모니터에서 평균과 각 원소를 확인한다.
3. LED Matrix의 막대 높이가 점수와 함께 변하는지 본다.
4. `SCORE_COUNT`를 바꾸면 반복문의 조건과 막대 위치가 어떻게 달라져야 하는지 토론한다.

---

## 11. ROS2 센서 배열과의 연결

ROS2의 LiDAR 메시지에는 거리값이 배열처럼 들어 있다. C 수업의 1차원 배열은 나중에 다음 구조를 이해하는 기초가 된다.

```cpp
void scanCallback(const sensor_msgs::msg::LaserScan::SharedPtr msg)
{
    const auto &ranges = msg->ranges;

    for (size_t i = 0; i < ranges.size(); i++) {
        // ranges[i]는 i번째 방향의 거리값이다.
    }
}
```

수업에서 배운 배열 관점으로 보면 다음과 같다.

| C 배열 | ROS2 LiDAR 배열 |
|---|---|
| `score[i]` | `ranges[i]` |
| `count` | `ranges.size()` |
| 평균, 최솟값 | 평균 거리, 가장 가까운 장애물 |
| 범위 초과 주의 | `i < ranges.size()` 조건 |

---

## 12. 도전 문제

원본 도전 문제는 주석 채우기, 반복문 변환, 문자 배열 공간, 원소 개수 계산을 다룬다.

![원본 강의자료: 배열 주석 채우기 도전](img/pdf-crops/week10_challenge_comment_array.png)

![원본 강의자료: 배열 대입을 for문으로 변환](img/pdf-crops/week10_challenge_for_convert.png)

![원본 강의자료: 문자 배열 공간 도전](img/pdf-crops/week10_challenge_char_space.png)

![원본 강의자료: sizeof로 원소 개수 구하기 도전](img/pdf-crops/week10_challenge_count_sizeof.png)

### 도전 10-1 - 대입문을 반복문으로 바꾸기

다음 코드를 `for`문으로 바꾸어라.

```c
score[0] = 0;
score[1] = 0;
score[2] = 0;
score[3] = 0;
score[4] = 0;
```

### 도전 10-2 - 문자 배열 크기 고치기

`"space"`를 저장하려면 `char chs[5]`가 충분한가? 부족하다면 몇 칸이 필요한가?

### 도전 10-3 - 원소 개수 계산식 완성

```c
int point[] = {38, 96, 14, 27, 55};
int count;

count = sizeof(point) / sizeof(point[0]);
```

---

## 13. 자주 막히는 지점

| 막히는 지점 | 증상 | 해결 |
|---|---|---|
| 인덱스 1부터 시작 | 첫 원소를 `score[1]`로 착각 | C 배열은 `score[0]`이 첫 원소 |
| 반복 조건 오류 | `i <= count`로 배열 밖 접근 | `i < count` 사용 |
| 배열 크기와 마지막 인덱스 혼동 | `int a[6]`에서 `a[6]` 사용 | 마지막은 `a[5]` |
| 문자열 널 문자 누락 | 마지막 글자가 깨지거나 이상 출력 | 문자 수보다 1칸 크게 선언 |
| 함수에서 원소 개수 계산 | 매개변수 배열에 `sizeof` 사용 | 호출할 때 `count`도 함께 전달 |
| 배열 전체 출력 | `printf("%d", arr)` 사용 | 반복문으로 원소를 하나씩 출력 |

---

## 14. 형성평가 체크포인트

- [ ] 배열 선언에서 자료형, 이름, 크기, 원소를 구분할 수 있다.
- [ ] 크기 6 배열의 유효 인덱스가 0~5임을 설명할 수 있다.
- [ ] 배열 초기값이 적을 때 나머지가 0으로 채워짐을 설명할 수 있다.
- [ ] `for`문으로 배열 원소를 모두 출력할 수 있다.
- [ ] `sizeof(arr) / sizeof(arr[0])` 계산식을 사용할 수 있다.
- [ ] 문자 배열에 널 문자 공간이 필요함을 설명할 수 있다.
- [ ] 배열을 함수에 넘길 때 원소 개수를 함께 넘겨야 함을 설명할 수 있다.
- [ ] 배열 데이터를 Arduino LED 막대그래프로 시각화할 수 있다.

---


## 📚 참고 레퍼런스 (외부)
- 배열 https://en.cppreference.com/w/c/language/array
- 이진 탐색 https://en.wikipedia.org/wiki/Binary_search_algorithm
- 이동평균 https://en.wikipedia.org/wiki/Moving_average
- 전체 정리: [참고 자료 모음](references.md)

## 연습문제

1. `int a[6];`의 유효한 인덱스 범위는?
2. `int a[3] = {10};`에서 `a[1]`과 `a[2]`의 값은?
3. `int data[] = {4, 8, 12, 16};`의 원소 개수를 구하는 식을 쓰시오.
4. `"robot"`을 저장하려면 `char name[]`은 최소 몇 칸이 필요한가?
5. 배열을 함수에 넘길 때 원소 개수도 함께 넘겨야 하는 이유는?
6. 순차 탐색은 어떤 순서로 값을 찾는가?
7. `score[i]`를 0~8 LED 높이로 바꿀 때 너무 큰 값은 어떻게 처리해야 하는가?

??? success "정답 및 해설"
    1. `0`부터 `5`까지다.
    2. 둘 다 `0`이다. 초기값이 부족한 나머지 원소는 0으로 채워진다.
    3. `sizeof(data) / sizeof(data[0])`
    4. 6칸이다. 글자 5개와 마지막 널 문자 `'\0'` 1개가 필요하다.
    5. 함수 안에서는 배열 전체 크기를 `sizeof`로 알 수 없고, 배열의 시작 주소처럼 전달되기 때문이다.
    6. 첫 원소부터 마지막 원소까지 하나씩 비교한다.
    7. LED Matrix 높이의 최댓값인 8로 제한한다. 최솟값도 필요하면 0 또는 1로 제한한다.

## 참조

- 원본 PDF: `10-1. 배열`, `10-1. 배열-1`, `10-2. 배열-1 실습`, `10-3. 배열 도전 문제`
- C 예제: [`code/c/examples/ex10_array_stats.c`](code/c/examples/ex10_array_stats.c)
- Arduino 예제: [`code/arduino/10_array_bar_graph/10_array_bar_graph.ino`](code/arduino/10_array_bar_graph/10_array_bar_graph.ino)
- 배경 개념: [Arduino R4 예제](code/arduino.md), [C와 ROS2](code/ros2.md)
