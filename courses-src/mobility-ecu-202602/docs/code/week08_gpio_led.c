/*
 * [8주차] GPIO 출력 — 레지스터 직접 접근으로 LED 제어 (STM32F767)
 * ---------------------------------------------------------------
 * 목표: HAL 함수 없이 "레지스터에 직접 값을 써서" 마이크로프로세서를 이해한다.
 * 핵심 흐름:  클럭 Enable → 모드 설정 → 출력타입/속도 → 값 쓰기
 * (교육용 자작 코드. 실제 핀은 보드 회로도에 맞게 수정)
 */
#include "stm32f767xx.h"

/* LED가 연결된 핀: 예) PC6 (High=꺼짐, Low=켜짐인 보드도 있으니 회로 확인) */
#define LED_PORT   GPIOC
#define LED_PIN    6

void led_gpio_init(void)
{
    /* 1) 포트 클럭 Enable — MCU는 클럭이 없으면 그 주변장치가 아예 동작하지 않는다.
     *    AHB1ENR의 GPIOC 비트를 1로 세팅. */
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOCEN;

    /* 2) MODER: 핀 모드를 '출력(01)'으로. 핀당 2비트를 차지한다.
     *    먼저 해당 2비트를 0으로 지우고(&= ~), 출력값(01)을 OR로 세팅. */
    LED_PORT->MODER &= ~(3U << (LED_PIN * 2));   /* 해당 핀 2비트 클리어 */
    LED_PORT->MODER |=  (1U << (LED_PIN * 2));   /* 01 = General purpose output */

    /* 3) OTYPER: 출력 타입 = Push-Pull(0). (0으로 두면 됨 — 명시적으로 클리어) */
    LED_PORT->OTYPER &= ~(1U << LED_PIN);

    /* 4) OSPEEDR: 출력 속도. 빠를수록 좋은 게 아니다 — 빠른 엣지는 EMI(노이즈)를 유발.
     *    LED 같은 저속 신호는 Low speed(00)면 충분. */
    LED_PORT->OSPEEDR &= ~(3U << (LED_PIN * 2));
}

/* 출력 값 쓰기: ODR(Output Data Register)의 해당 비트를 1/0으로. */
static inline void led_on(void)  { LED_PORT->ODR |=  (1U << LED_PIN); }
static inline void led_off(void) { LED_PORT->ODR &= ~(1U << LED_PIN); }
static inline void led_toggle(void){ LED_PORT->ODR ^=  (1U << LED_PIN); }

/* 대략적인 지연 (교육용 busy-wait. 실전은 SysTick/타이머 사용 — 9·10주차) */
static void crude_delay(volatile uint32_t n){ while(n--) __NOP(); }

int main(void)
{
    led_gpio_init();
    while (1) {
        led_toggle();          /* 1비트 XOR로 On/Off 반전 */
        crude_delay(1000000);  /* 눈에 보이도록 잠깐 대기 */
    }
}
