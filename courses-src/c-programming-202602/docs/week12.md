# 12주차 · 포인터 기초
> C언어 · 미래모빌리티학과 | CLO2·CLO4 | 교재 Ch12 | Arduino UNO R4 WiFi

포인터는 C에서 가장 어렵게 느껴지는 주제지만, 출발점은 단순하다. **변수는 값을 저장하고, 포인터는 값이 저장된 주소를 저장한다.** 12주차는 이 한 문장을 실제 코드, 메모리 그림, 배열 순회, Arduino 센서 버퍼, ROS2 메시지 처리 흐름까지 연결해 보는 시간이다.

!!! note "이번 자료에 반영한 원본 강의자료"
    - `12-1. 포인터 기초.pptx`
    - `12-2. 포인터 기초- 실습.pptx`
    - `12-3. 포인터 기초- 도전문제.pptx`

![12주차 학습 목표](img/pdf-crops/week12_learning_goals.png)

---

## 학습 목표

이번 주차를 마치면 학생은 다음을 설명하고 구현할 수 있어야 한다.

- 포인터가 "주소를 저장하는 변수"라는 점을 설명한다.
- 변수의 값, 변수의 주소, 포인터의 값, 포인터가 가리키는 값을 구분한다.
- 주소 연산자 `&`와 간접 참조 연산자 `*`를 코드에서 올바르게 사용한다.
- `int *p`, `char *p`, `double *p`의 차이를 자료형 크기와 연결해 설명한다.
- 포인터 증감 연산이 1바이트가 아니라 자료형 크기만큼 이동한다는 점을 이해한다.
- 배열 이름과 첫 원소 주소의 관계를 설명하고, 포인터로 배열을 순회한다.
- `NULL` 포인터, 초기화하지 않은 포인터, 자료형 불일치가 왜 위험한지 설명한다.
- Arduino/ROS2에서 센서 버퍼와 메시지 배열을 함수에 넘길 때 포인터가 왜 필요한지 이해한다.

---

## 이번 주차의 큰 그림

배열을 배우면 여러 값을 한 덩어리로 저장할 수 있다. 포인터를 배우면 그 덩어리의 **시작 주소**를 함수에 넘기고, 함수 안에서 필요한 만큼 순회할 수 있다.

```c
double average(const int *data, int count)
{
    int sum = 0;
    for (const int *p = data; p < data + count; p++) {
        sum += *p;
    }
    return sum / (double)count;
}
```

위 함수는 배열 전체를 복사하지 않는다. `data`는 첫 번째 원소의 주소이고, `count`는 몇 개를 읽어야 하는지 알려 주는 길이다. 실무 C 코드에서 포인터와 길이를 함께 넘기는 이유가 여기에 있다.

!!! warning "포인터의 첫 안전 규칙"
    포인터는 주소만 알고 길이는 모른다. 배열을 포인터로 넘길 때는 항상 `count`, `size`, `length` 같은 길이 정보도 함께 넘겨야 한다.

---

## 3시간 강의 운영안

| 시간 | 내용 | 교수자 활동 | 학생 활동 |
|------|------|-------------|-----------|
| 0~20분 | 포인터가 필요한 이유 | 값, 주소, 변수 이름을 분리해 설명 | `int a = 10;`의 값과 주소 그림 그리기 |
| 20~50분 | 변수와 메모리 주소 | `&` 출력 예제 시연 | 주소가 실행마다 달라지는 이유 토의 |
| 50~85분 | 포인터 선언과 초기화 | `int *p = &a;`를 그림과 코드로 설명 | `*p = 20;` 실행 결과 예측 |
| 85~115분 | 포인터 사용 시 주의사항 | `NULL`, 미초기화, 자료형 불일치 사례 설명 | 안전한 포인터 체크 코드 작성 |
| 115~145분 | 포인터 증감 연산 | `int *`, `double *` 주소 이동 비교 | 주소 차이가 4/8바이트가 되는지 관찰 |
| 145~165분 | 배열과 포인터 | 배열 이름, `p+i`, `p[i]` 관계 설명 | 포인터로 배열 합계 구하기 |
| 165~180분 | Arduino/ROS2 연결 | 센서 버퍼와 ROS2 배열 메시지 연결 | 형성평가와 도전문제 풀이 |

---

## 이론-실습 연결표

| 이론 개념 | 바로 해볼 실습 | 확인 질문 |
|---|---|---|
| 포인터는 주소를 저장한다 | 변수의 값, 주소, 포인터 값을 출력한다 | `p`와 `*p`는 각각 무엇을 의미하는가? |
| 간접 참조는 원본 값을 바꾼다 | `*p = 20;` 실행 전후를 비교한다 | 함수에서 원본 값을 바꾸려면 무엇을 넘겨야 하는가? |
| 포인터 연산은 자료형 크기만큼 이동한다 | `int *`, `double *` 주소 증가를 비교한다 | 주소가 1이 아니라 4 또는 8만큼 바뀌는 이유는 무엇인가? |
| 센서 버퍼 전달 | Arduino 센서 배열을 포인터와 길이로 순회한다 | 포인터만 넘기면 왜 배열 길이를 알 수 없는가? |

## 1. 포인터는 주소를 담는 변수다

포인터(pointer)는 데이터나 프로그램이 저장된 메모리 주소를 가리키는 변수다. 일반 변수는 값을 담고, 포인터 변수는 그 값이 있는 위치를 담는다.

![포인터의 개념](img/pdf-crops/week12_pointer_concept.png)

```c
int a = 10;
int *p = &a;
```

이 두 줄을 그림으로 보면 다음과 같다.

| 이름 | 저장하는 것 | 예 |
|------|-------------|----|
| `a` | 정수 값 | `10` |
| `&a` | 변수 `a`의 주소 | `0x...` |
| `p` | 변수 `a`의 주소 | `&a`와 같은 주소 |
| `*p` | `p`가 가리키는 곳의 값 | `10` |

포인터를 처음 배울 때는 `p`와 `*p`를 반드시 구분해야 한다.

- `p`: 주소
- `*p`: 그 주소에 있는 값

---

## 2. 변수와 메모리 주소

변수를 선언하면 컴파일러와 운영체제가 메모리 공간을 자동으로 배정한다. 프로그래머가 직접 주소를 정하지 않아도, 프로그램은 변수 이름을 통해 해당 주소에 접근한다.

![변수와 메모리 주소](img/pdf-crops/week12_variable_memory_address.png)
![변수 선언과 메모리 공간](img/pdf-crops/week12_variable_memory_space.png)

예를 들어 다음 코드는 정수형, 문자형, 실수형 변수를 만든다.

```c
int a = 10;
char b = 'A';
double c = 3.14;
```

각 변수는 자료형 크기만큼 메모리를 차지한다.

| 자료형 | 일반적인 크기 | 의미 |
|--------|---------------|------|
| `char` | 1바이트 | 문자, 작은 정수 |
| `int` | 보통 4바이트 | 정수 |
| `double` | 보통 8바이트 | 실수 |

!!! note "주소는 실행할 때마다 달라질 수 있다"
    같은 코드를 실행해도 주소값은 매번 달라질 수 있다. 운영체제가 프로그램을 메모리에 올리는 위치가 실행 때마다 달라질 수 있기 때문이다. 따라서 주소의 정확한 숫자를 외우는 것이 아니라, 주소와 값의 관계를 이해해야 한다.

---

## 3. 주소 연산자 `&`

주소 연산자 `&`는 변수의 주소를 구한다.

```c
printf("%p\n", (void *)&a);
```

주소를 출력할 때는 `%p`를 사용하고, `(void *)`로 형 변환하는 것이 표준적인 방식이다.

![주소 참조 연산자 소개](img/pdf-crops/week12_address_operator_intro.png)
![주소 참조 연산자 코드](img/pdf-crops/week12_address_operator_code.png)
![주소 참조 연산자 결과](img/pdf-crops/week12_address_operator_result.png)

### 실습 질문

다음 코드에서 출력되는 값 중 실행할 때마다 달라질 수 있는 것은 무엇인가?

```c
int a = 10;
printf("value = %d\n", a);
printf("address = %p\n", (void *)&a);
```

정답은 주소다. 값 `10`은 코드에서 정했지만, 주소는 실행 환경이 정한다.

---

## 4. 포인터 선언과 초기화

포인터를 선언할 때는 "무엇을 가리키는 포인터인지"를 자료형으로 적는다.

```c
int *pi;
char *pc;
double *pd;
```

![포인터 선언](img/pdf-crops/week12_pointer_declaration.png)
![포인터 자료형 규칙](img/pdf-crops/week12_pointer_type_rule.png)

`int *pi`는 "정수를 가리키는 포인터"다. `double *pd`는 "실수를 가리키는 포인터"다. 포인터 자체는 주소를 담지만, 포인터의 자료형은 역참조할 때 몇 바이트를 읽어야 하는지 알려 준다.

!!! warning "여러 포인터 선언"
    `int *p, q;`에서 포인터는 `p`뿐이고 `q`는 일반 정수 변수다. 포인터 여러 개를 선언하려면 `int *p, *q;`처럼 각 변수 앞에 `*`를 붙여야 한다.

---

## 5. 절대 주소와 상대 주소

포인터 초기화는 크게 두 가지 관점으로 설명할 수 있다.

| 방식 | 의미 | 주 사용처 |
|------|------|-----------|
| 절대 주소값 | 특정 하드웨어 주소를 직접 지정 | 임베디드 레지스터, 메모리 맵 I/O |
| 상대 주소값 | 변수의 주소를 `&`로 받아 사용 | 일반 C 실습, 응용 프로그램 |

### 5.1 절대 주소값

임베디드 시스템에서는 특정 레지스터 주소를 포인터로 가리켜 하드웨어를 제어할 수 있다. 예를 들어 AVR 계열 보드에서는 데이터 방향 레지스터, 출력 레지스터 같은 고정 주소가 있다.

![절대 주소 소개](img/pdf-crops/week12_absolute_address_intro.png)
![절대 주소 레지스터](img/pdf-crops/week12_absolute_address_registers.png)
![절대 주소 코드](img/pdf-crops/week12_absolute_address_code.png)

하지만 PC 실습에서 임의의 절대 주소를 직접 역참조하면 위험하다. 운영체제가 보호하는 메모리 영역에 접근하면 프로그램이 충돌할 수 있다.

### 5.2 상대 주소값

일반적인 수업 실습에서는 변수의 주소를 받아 포인터에 저장한다.

```c
int a = 10;
int *p = &a;
```

![상대 주소 초기화 절차](img/pdf-crops/week12_relative_address_steps.png)
![상대 주소 초기화 그림](img/pdf-crops/week12_relative_address_diagram.png)

이 코드는 다음 순서로 이해하면 된다.

1. `int a = 10;`으로 정수 변수를 만든다.
2. `&a`로 변수 `a`의 주소를 구한다.
3. `int *p`로 정수를 가리키는 포인터를 만든다.
4. `p = &a;`로 `p`가 `a`를 가리키게 한다.

---

## 6. 간접 참조 연산자 `*`

포인터가 가리키는 곳의 값을 읽거나 바꾸려면 `*`를 사용한다.

```c
int a = 10;
int *p = &a;

printf("%d\n", *p);  // 10
*p = 20;             // a의 값이 20으로 바뀜
```

여기서 `*p = 20;`은 `p`라는 변수 자체를 20으로 바꾸는 것이 아니다. `p`가 가리키는 위치로 가서 그 위치의 값을 20으로 바꾸는 것이다.

![간접 참조 코드 시작](img/pdf-crops/week12_practice_indirect_code_start.png)
![간접 참조 데이터 변경 소개](img/pdf-crops/week12_practice_indirect_change_intro.png)
![간접 참조 데이터 변경 코드](img/pdf-crops/week12_practice_indirect_change_code.png)
![간접 참조 데이터 변경 결과](img/pdf-crops/week12_practice_indirect_change_result.png)

!!! tip "`*`의 두 얼굴"
    `int *p;`에서 `*`는 포인터 선언 표시이고, `printf("%d", *p);`에서 `*`는 간접 참조 연산자다. 같은 기호지만 문맥이 다르다.

---

## 7. 포인터 사용 시 주의사항

포인터는 강력하지만, 잘못 쓰면 프로그램이 바로 불안정해진다. 초반에는 다음 세 가지를 가장 조심해야 한다.

### 7.1 초기화하지 않은 포인터

```c
int *p;
*p = 10;   // 위험
```

`p`가 어디를 가리키는지 모르는 상태에서 `*p`를 사용하면 잘못된 메모리에 접근할 수 있다.

### 7.2 NULL 포인터

```c
int *p = NULL;

if (p != NULL) {
    *p = 10;
}
```

아직 가리킬 대상이 없으면 `NULL`로 초기화한다. 그리고 역참조하기 전에 `p != NULL`인지 검사한다.

![NULL 포인터 주의 코드](img/pdf-crops/week12_pointer_null_warning_code.png)
![NULL 포인터 결과](img/pdf-crops/week12_pointer_null_warning_result.png)

### 7.3 자료형 불일치

`int *`로 `double` 값을 제대로 다룰 수 없다. 포인터 자료형은 가리키는 데이터 자료형과 맞아야 한다.

![포인터 자료형 불일치 주의](img/pdf-crops/week12_pointer_type_mismatch_warning.png)

---

## 8. 포인터 연산

포인터 연산은 일반 숫자 연산처럼 보이지만 실제로는 주소 이동이다.

![포인터 연산자](img/pdf-crops/week12_pointer_operators.png)
![포인터 연산 규칙](img/pdf-crops/week12_pointer_rules.png)

포인터에 `1`을 더하면 주소가 1바이트 증가하는 것이 아니라, 포인터가 가리키는 자료형 크기만큼 이동한다.

| 포인터 | `p + 1` 이동량 |
|--------|----------------|
| `char *p` | 1바이트 |
| `int *p` | 보통 4바이트 |
| `double *p` | 보통 8바이트 |

![포인터 타입별 증감 연산](img/pdf-crops/week12_pointer_increment_types.png)
![포인터 증감과 메모리 주소](img/pdf-crops/week12_pointer_increment_address.png)
![int 포인터 증감](img/pdf-crops/week12_pointer_increment_int.png)
![double 포인터 증감](img/pdf-crops/week12_pointer_increment_double.png)

### 8.1 `p++`와 `(*p)++`는 다르다

```c
p++;      // 포인터가 다음 원소를 가리킴
(*p)++;   // 포인터가 가리키는 값이 1 증가
```

괄호가 중요하다. `p`를 움직이는지, `*p`의 값을 바꾸는지 구분해야 한다.

---

## 9. 포인터와 배열

배열 이름은 많은 상황에서 첫 원소의 주소처럼 동작한다.

```c
int a[5] = {100, 200, 300, 400, 500};
int *pa = a;       // pa = &a[0]
```

![포인터와 배열의 관계](img/pdf-crops/week12_pointer_array_relation.png)

다음 세 표현은 같은 원소를 가리킨다.

```c
a[2]
*(a + 2)
*(pa + 2)
```

![배열 포인터 메모리](img/pdf-crops/week12_array_pointer_memory.png)

### 9.1 배열 원소 출력

```c
for (int i = 0; i < 5; i++) {
    printf("%d\n", *(pa + i));
}
```

이 코드는 `a[i]` 대신 `*(pa + i)`를 사용한다. 결과는 같지만, 포인터가 배열을 어떻게 순회하는지 보여 준다.

![배열 포인터 증가](img/pdf-crops/week12_array_pointer_preinc.png)
![배열 포인터 감소](img/pdf-crops/week12_array_pointer_predec.png)
![배열 값 증가](img/pdf-crops/week12_array_value_increment.png)

---

## 10. 실습 1: 주소 출력

변수의 값과 주소를 함께 출력한다.

![주소 출력 실습 코드](img/pdf-crops/week12_practice_address_code_start.png)
![주소 출력 실습 결과](img/pdf-crops/week12_practice_address_result.png)

학생이 확인해야 할 점은 두 가지다.

- 값은 코드에서 정한 값으로 출력된다.
- 주소는 실행 환경에 따라 달라질 수 있다.

---

## 11. 실습 2: 포인터로 값 변경

다음 실습은 포인터가 원래 변수의 값을 바꿀 수 있음을 보여 준다.

```c
int a = 10;
int *p = &a;
*p = 30;
printf("%d\n", a);  // 30
```

이 실습은 함수의 call-by-reference를 이해하는 출발점이다. 다음 주차에는 포인터를 함수 인자로 넘겨 두 변수의 값을 바꾸는 `swap` 예제로 확장한다.

---

## 12. 실습 3: 포인터 증감 연산

![포인터 증감 코드 시작](img/pdf-crops/week12_practice_increment_code_start.png)
![포인터 증감 결과](img/pdf-crops/week12_practice_increment_result.png)

주소가 얼마나 증가하는지 관찰할 때는 단순히 숫자만 보지 말고 자료형도 함께 봐야 한다.

```c
char c;
int i;
double d;

char *pc = &c;
int *pi = &i;
double *pd = &d;
```

`pc + 1`, `pi + 1`, `pd + 1`은 모두 `+1`처럼 보이지만 실제 주소 이동량은 서로 다르다.

---

## 13. 실습 4: 포인터로 배열 합계 구하기

배열 합계를 포인터로 구해 본다.

```c
int a[] = {100, 200, 300, 400, 500};
int *pa = a;
int total = 0;

for (int i = 0; i < 5; i++) {
    total += *(pa + i);
}
```

![배열 포인터 코드](img/pdf-crops/week12_practice_array_pointer_code.png)
![배열 포인터 요약](img/pdf-crops/week12_practice_array_pointer_summary.png)
![char 배열 포인터 코드](img/pdf-crops/week12_practice_array_pointer_char_code.png)
![char 배열 포인터 결과](img/pdf-crops/week12_practice_array_pointer_char_result.png)
![for문 배열 포인터 코드](img/pdf-crops/week12_practice_array_pointer_for_code.png)
![for문 배열 포인터 결과](img/pdf-crops/week12_practice_array_pointer_for_result.png)

---

## 14. 도전문제

### 도전 1: 주소와 포인터 관계 채우기

정수형 변수 `num`을 23으로 초기화하고, 포인터 `p`가 `num`을 가리키게 만든다.

![도전문제 주소 표](img/pdf-crops/week12_challenge_address_table.png)
![도전문제 포인터 빈칸](img/pdf-crops/week12_challenge_pointer_blank.png)
![도전문제 포인터 정답 예시](img/pdf-crops/week12_challenge_pointer_answer.png)

### 도전 2: 포인터로 배열 합계 구하기

다음 흐름을 완성한다.

```c
p = a;
hap += *p++;
```

`*p++`는 현재 포인터가 가리키는 값을 더한 뒤, 포인터를 다음 원소로 이동한다. 이 표현은 짧지만 초보자에게는 어렵다. 처음에는 다음처럼 풀어 쓰는 것이 안전하다.

```c
hap += *p;
p++;
```

![도전문제 배열 합계 빈칸](img/pdf-crops/week12_challenge_array_sum_blank.png)

---

## 15. C 실습 예제

### 15.1 포인터 기초 실습

예제 파일: [`code/c/examples/ex12_pointer_basics.c`](code/c/examples/ex12_pointer_basics.c)

이 예제는 다음을 한 번에 확인한다.

- 변수 주소 출력
- 포인터를 통한 값 변경
- 포인터와 배열 순회
- `swap_by_pointer` 함수
- `NULL` 체크

### 15.2 포인터 도전 실습

예제 파일: [`code/c/examples/ex12_pointer_challenges.c`](code/c/examples/ex12_pointer_challenges.c)

이 예제는 도전문제와 연결해 다음을 다룬다.

- `*p++`를 풀어 쓰는 방법
- 배열 포인터로 합계 구하기
- 구조체 배열에서 `p->field`와 `(p + i)->field` 사용하기

!!! note "구조체 포인터는 미리 맛보기"
    구조체는 14주차에 본격적으로 다루지만, 도전문제 원본에 구조체 포인터가 포함되어 있어 맛보기로만 소개한다. 지금은 `p->kor`가 `(*p).kor`의 짧은 표기라는 정도만 이해하면 충분하다.

---

## 16. Arduino UNO R4 WiFi: 센서 버퍼를 포인터로 순회하기

예제 파일: [`code/arduino/12_pointer_buffer/12_pointer_buffer.ino`](code/arduino/12_pointer_buffer/12_pointer_buffer.ino)

이 예제는 가상 센서값 배열을 포인터로 순회해 평균과 최댓값을 구하고, 평균값을 LED Matrix 막대그래프로 표시한다.

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

여기서 `values`는 배열의 첫 주소다. `count`는 몇 개의 센서값을 읽어야 하는지 알려 준다. 이 패턴은 ROS2에서 `ranges`, `data`, `points` 같은 배열 메시지를 처리할 때도 반복해서 등장한다.

---

## 17. ROS2와의 연결

포인터는 ROS2 C/C++ 코드에서 다음 상황에 자주 등장한다.

| 수업 개념 | ROS2/로봇 연결 |
|-----------|----------------|
| `const float *ranges` | LiDAR 거리 배열의 시작 주소 |
| `count` 또는 `size` | 배열 길이 |
| `p++` | 다음 센서값으로 이동 |
| `*p` | 현재 센서값 읽기 |
| `NULL` 체크 | 유효하지 않은 포인터 접근 방지 |
| `struct Packet *p` | 센서 패킷 구조체를 함수에 전달 |

예를 들어 LiDAR에서 360개의 거리값이 들어오면, 함수는 배열 전체를 복사하지 않고 시작 주소와 길이를 받아 처리한다.

```c
int count_close_obstacles(const float *ranges, int count, float threshold)
{
    int close_count = 0;
    for (const float *p = ranges; p < ranges + count; p++) {
        if (*p > 0.0f && *p < threshold) {
            close_count++;
        }
    }
    return close_count;
}
```

이 코드는 C 포인터 문법이 단순한 시험 문제가 아니라 로봇 센서 처리의 기본 도구임을 보여 준다.

---

## 18. 자주 막히는 지점

| 막히는 지점 | 원인 | 해결 |
|-------------|------|------|
| `p`와 `*p`를 혼동 | 주소와 값을 구분하지 못함 | `p=주소`, `*p=그 주소의 값`으로 읽기 |
| `int *p, q;`에서 `q`도 포인터라고 생각 | `*`가 변수별로 적용됨 | `int *p, *q;`처럼 각각 표시 |
| 주소 출력이 이상함 | `%d`로 주소 출력 | `%p`와 `(void *)` 사용 |
| `p++` 후 값이 바뀐다고 생각 | 포인터 이동과 값 변경 혼동 | `p++`는 주소 이동, `(*p)++`는 값 증가 |
| 배열을 함수에 넘기면 길이도 자동으로 전달된다고 생각 | 배열은 시작 주소처럼 전달됨 | 길이를 별도 인자로 전달 |
| `NULL` 역참조 | 유효한 주소가 아님 | `if (p != NULL)` 체크 |

---

## 19. 형성평가 체크포인트

- [ ] `&a`와 `*p`의 의미를 말할 수 있다.
- [ ] `int *p = &a;`를 그림으로 설명할 수 있다.
- [ ] `*p = 20;`이 원래 변수 `a`를 바꾸는 이유를 설명할 수 있다.
- [ ] `p++`와 `(*p)++`의 차이를 말할 수 있다.
- [ ] `int *`와 `double *`의 증가 연산 결과가 다른 이유를 설명할 수 있다.
- [ ] 배열을 포인터로 함수에 넘길 때 길이 인자가 필요한 이유를 설명할 수 있다.
- [ ] Arduino/ROS2 센서 배열 처리에서 포인터가 쓰이는 위치를 예로 들 수 있다.

---

## 연습문제

1. `int a = 10; int *p = &a; *p = 30;` 실행 후 `a`의 값은?
2. `p`와 `*p`의 차이를 한 문장으로 설명하라.
3. `int a[5] = {1, 2, 3, 4, 5}; int *p = a;`에서 `*(p + 2)`의 값은?
4. `int *p = NULL; *p = 10;`이 위험한 이유는?
5. `double *pd; pd++;`를 실행하면 주소는 보통 몇 바이트 이동하는가?
6. `hap += *p++;`를 두 줄로 풀어 쓰면 어떻게 되는가?
7. 배열을 함수에 포인터로 넘길 때 `count`를 함께 넘겨야 하는 이유는?

??? success "정답 및 해설"
    1. `30`이다. `*p`는 `a`가 저장된 위치의 값을 뜻한다.
    2. `p`는 주소이고, `*p`는 그 주소에 저장된 값이다.
    3. `3`이다. `p + 2`는 세 번째 원소를 가리킨다.
    4. `NULL`은 아무것도 가리키지 않으므로 역참조하면 잘못된 메모리 접근이 된다.
    5. 보통 8바이트다. `double`의 일반적인 크기가 8바이트이기 때문이다.
    6. `hap += *p;` 다음 줄에 `p++;`로 풀어 쓸 수 있다.
    7. 포인터는 시작 주소만 알고 배열 길이는 모르기 때문이다.

---

## 참조

- C 예제: [`code/c/examples/ex12_pointer_basics.c`](code/c/examples/ex12_pointer_basics.c)
- C 도전 예제: [`code/c/examples/ex12_pointer_challenges.c`](code/c/examples/ex12_pointer_challenges.c)
- Arduino 예제: [`code/arduino/12_pointer_buffer/12_pointer_buffer.ino`](code/arduino/12_pointer_buffer/12_pointer_buffer.ino)
- Arduino 예제 목록: [`code/arduino.md`](code/arduino.md)
- ROS2 연결 개요: [`ros2-robot.md`](ros2-robot.md)
