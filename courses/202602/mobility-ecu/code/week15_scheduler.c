/*
 * [15주차] 펌웨어 통합 골격 — SysTick 스케줄러 + 인터럽트 구조
 * ----------------------------------------------------------
 * 여러 주기의 작업을 하나의 프로그램으로 묶는다. 정밀 제어는 인터럽트에서,
 * 느린 작업(모니터링 등)은 스케줄러 플래그로 main 루프에서 처리한다.
 *   - TIM1 20kHz 인터럽트 : 전류/센서 ADC 읽고 PWM 듀티 갱신(가장 빠른 제어)
 *   - 홀/엔코더 EXTI       : 위치 변화 → 속도 계산
 *   - SysTick 1ms          : 10ms/100ms/1s 주기 태스크 플래그 세팅
 */
#include <stdint.h>

volatile uint32_t g_ms;                 /* 1ms마다 증가하는 시스템 시간 */
volatile uint8_t f_10ms, f_100ms, f_1s; /* 주기 태스크 실행 요청 플래그 */

/* SysTick 인터럽트: 1ms마다 자동 호출 */
void SysTick_Handler(void)
{
    g_ms++;
    if (g_ms % 10  == 0) f_10ms  = 1;   /* 나머지 연산으로 주기 판별 */
    if (g_ms % 100 == 0) f_100ms = 1;
    if (g_ms % 1000== 0) f_1s    = 1;
}

extern void read_speed_and_control(void); /* PI 제어 등(빠른 주기는 TIM 인터럽트) */
extern void send_telemetry(void);         /* 속도/전압/온도/고장코드 무선 송신 */
extern uint8_t fault_check(void);         /* 과전류·과열 감지 → 고장코드 반환 */

int main(void)
{
    /* init: 클럭, GPIO, ADC, TIM(PWM+20kHz), EXTI(홀), UART, SysTick ... */
    while (1) {
        if (f_10ms)  { f_10ms  = 0; read_speed_and_control(); }
        if (f_100ms) { f_100ms = 0; if (fault_check()) { /* 안전정지 */ } }
        if (f_1s)    { f_1s    = 0; send_telemetry(); }
        /* 페일세이프: AI/고급제어가 실패해도 여기 고전 제어·하드리밋이 항상 동작 */
    }
}
