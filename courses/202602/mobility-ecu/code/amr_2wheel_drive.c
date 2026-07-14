/*
 * [AMR 실습] 2륜 차동구동 — TB6612 H-브리지로 좌/우 모터 제어
 * ----------------------------------------------------------
 * 브러시 DC 모터 2개를 각각 H-브리지 1채널로 구동한다.
 *   IN1/IN2 : 회전 방향,  PWM : 속도(듀티)
 * 좌/우 속도를 다르게 주면 로봇이 회전한다(차동구동). HAL 스타일(가독성 우선).
 */
#include "stm32f4xx_hal.h"

extern TIM_HandleTypeDef htim3;   /* PWM: CH1=좌, CH2=우 */

/* TB6612 방향 핀 (예시). 실제 배선에 맞게 수정 */
#define AIN1_PORT GPIOC
#define AIN1 GPIO_PIN_8
#define AIN2 GPIO_PIN_9   /* 좌모터 방향 */
#define BIN1 GPIO_PIN_10
#define BIN2 GPIO_PIN_11  /* 우모터 방향 */

/* 한 모터 구동: dir>0 정방향, dir<0 역방향, dir==0 정지. duty 0.0~1.0 */
static void motor_drive(GPIO_TypeDef* port, uint16_t in1, uint16_t in2,
                        uint32_t tim_ch, int dir, float duty)
{
    /* 방향 결정 (진리표: IN1=H,IN2=L → 정방향 / L,H → 역방향 / L,L → 정지) */
    HAL_GPIO_WritePin(port, in1, dir > 0 ? GPIO_PIN_SET : GPIO_PIN_RESET);
    HAL_GPIO_WritePin(port, in2, dir < 0 ? GPIO_PIN_SET : GPIO_PIN_RESET);

    /* 속도 = PWM 듀티. CCR = ARR * duty */
    if (duty < 0) duty = 0; if (duty > 1) duty = 1;
    __HAL_TIM_SET_COMPARE(&htim3, tim_ch,
                          (uint32_t)(__HAL_TIM_GET_AUTORELOAD(&htim3) * duty));
}

/* 좌/우 속도 지령으로 로봇 주행: v(-1~1 전진/후진), w(-1~1 회전) */
void amr_drive(float v, float w)
{
    float left  = v - w;   /* 차동구동 믹싱: 좌 = 전진 - 회전 */
    float right = v + w;   /*               우 = 전진 + 회전 */

    motor_drive(AIN1_PORT, AIN1, AIN2, TIM_CHANNEL_1,
                left  > 0 ? 1 : (left  < 0 ? -1 : 0), left  < 0 ? -left  : left);
    motor_drive(AIN1_PORT, BIN1, BIN2, TIM_CHANNEL_2,
                right > 0 ? 1 : (right < 0 ? -1 : 0), right < 0 ? -right : right);
}
/* 예: amr_drive(0.5f, 0)=직진, amr_drive(0, 0.5f)=제자리 좌회전, amr_drive(0,0)=정지 */
