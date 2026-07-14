/*
 * [10주차] 주변장치 3종 — ADC(센서) · Timer PWM(모터) · UART(통신)
 * ---------------------------------------------------------------
 * 로봇의 "보고(ADC) · 움직이고(PWM) · 말하는(UART)" 기본기.
 * (교육용 간략 예제 — 실제는 클럭/핀 설정을 CubeMX나 레퍼런스매뉴얼로 맞춘다)
 */
#include "stm32f767xx.h"
#include <stdio.h>

/* ---------------- ADC: 아날로그 전압 → 12비트 숫자(0~4095) ---------------- */
uint16_t adc_read(void)
{
    ADC1->CR2 |= ADC_CR2_SWSTART;                 /* 변환 시작 */
    while (!(ADC1->SR & ADC_SR_EOC)) { }          /* EOC(변환완료) 플래그 대기(폴링) */
    return (uint16_t)ADC1->DR;                    /* 결과 읽기 → 플래그 자동 클리어 */
}
/* 변환식: 전압 = ADC값 / 4095 * Vref(3.3V). 예: 쓰로틀/배터리 분압 전압 계산 */
float adc_to_voltage(uint16_t raw){ return (float)raw * 3.3f / 4095.0f; }

/* ---------------- Timer PWM: 모터 속도(듀티) 만들기 ---------------- */
/* TIM_CCR 값이 듀티를 결정. duty(0.0~1.0) → CCR = ARR * duty */
void pwm_set_duty(float duty)
{
    if (duty < 0) duty = 0; if (duty > 1) duty = 1;   /* 안전 클램프 */
    TIM3->CCR1 = (uint32_t)((float)TIM3->ARR * duty); /* 좌모터 채널 예시 */
}

/* ---------------- UART: 문자 1개 송신(디버깅/원격 명령) ---------------- */
void uart_putc(char c)
{
    while (!(USART2->ISR & USART_ISR_TXE)) { }   /* 송신버퍼 빌 때까지 대기 */
    USART2->TDR = (uint8_t)c;
}
/* printf 리타게팅: 이 함수를 정의하면 printf가 UART로 나간다(Teleplot 등) */
int __io_putchar(int ch){ uart_putc((char)ch); return ch; }

int main(void)
{
    /* (init 생략) 아래는 10주차 통합 실습의 핵심 루프 개념 */
    while (1) {
        uint16_t raw = adc_read();               /* 1) 쓰로틀/센서 읽기 */
        float v = adc_to_voltage(raw);
        float duty = v / 3.3f;                    /* 2) 전압을 듀티로 매핑(예시) */
        pwm_set_duty(duty);                       /* 3) 모터 PWM 출력 */
        printf(">throttle:%.2f\n", v);           /* 4) Teleplot 포맷으로 UART 출력 */
    }
}
