/*
 * [9주차] 외부 인터럽트(EXTI) — 스위치 입력으로 LED 토글 (STM32F767)
 * -----------------------------------------------------------------
 * 폴링(계속 확인)과 달리, 스위치가 눌리는 "순간"에만 CPU가 반응한다.
 * 흐름: GPIO 입력 설정 → SYSCFG로 핀↔EXTI 연결 → 엣지/마스크 설정 → NVIC 활성화
 * 홀센서·엔코더 신호도 같은 EXTI 방식으로 놓치지 않고 잡는다(→ 5·15주차).
 */
#include "stm32f767xx.h"

#define SW_PIN   13          /* 예: PC13 (사용자 버튼) */
#define LED_PIN  6           /* PC6 */

void exti_switch_init(void)
{
    RCC->AHB1ENR  |= RCC_AHB1ENR_GPIOCEN;   /* GPIOC 클럭 */
    RCC->APB2ENR  |= RCC_APB2ENR_SYSCFGEN;  /* SYSCFG 클럭 — EXTI 핀 매핑에 필요 */

    /* 스위치 핀: 입력(00) + 내부 풀업. LED 핀: 출력(01) */
    GPIOC->MODER  &= ~(3U << (SW_PIN*2));           /* 입력 */
    GPIOC->PUPDR  &= ~(3U << (SW_PIN*2));
    GPIOC->PUPDR  |=  (1U << (SW_PIN*2));           /* 01 = 풀업 */
    GPIOC->MODER  &= ~(3U << (LED_PIN*2));
    GPIOC->MODER  |=  (1U << (LED_PIN*2));          /* 출력 */

    /* SYSCFG_EXTICR: EXTI13 라인을 어느 포트(PC)의 13번 핀에 연결할지 선택.
     * EXTICR[3]가 EXTI12~15 담당, EXTI13은 그 안의 4비트. PC = 0b0010 */
    SYSCFG->EXTICR[3] &= ~(0xFU << 4);
    SYSCFG->EXTICR[3] |=  (0x2U << 4);              /* Port C */

    EXTI->IMR  |= (1U << SW_PIN);   /* 인터럽트 마스크 해제(허용) */
    EXTI->FTSR |= (1U << SW_PIN);   /* 하강 엣지에서 트리거(풀업이라 누르면 High→Low) */

    /* NVIC: EXTI15_10 라인은 여러 핀이 공유하는 하나의 인터럽트 벡터 */
    NVIC_SetPriority(EXTI15_10_IRQn, 2);
    NVIC_EnableIRQ(EXTI15_10_IRQn);
}

/* 인터럽트 서비스 루틴(ISR): 스위치가 눌리면 자동 호출됨 */
void EXTI15_10_IRQHandler(void)
{
    if (EXTI->PR & (1U << SW_PIN)) {   /* 어느 핀이 발생시켰는지 Pending으로 확인 */
        EXTI->PR = (1U << SW_PIN);     /* !! 1을 써서 Pending 클리어(안 하면 무한 재진입) */
        GPIOC->ODR ^= (1U << LED_PIN); /* LED 토글 */
    }
}

int main(void){ exti_switch_init(); while(1){ /* CPU는 다른 일을 하거나 대기 */ } }
