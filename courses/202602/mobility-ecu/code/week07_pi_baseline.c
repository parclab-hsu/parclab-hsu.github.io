/*
 * [7주차 · 활동 2] PI 속도 제어기 — 검토 대상 baseline
 * ---------------------------------------------------
 * 이 코드는 "돌아가기는 하는데 이상한" 코드다.
 * 실제로 컴파일되고 모터도 돌지만, 특정 상황에서 잘못 동작한다.
 *
 * 과제: 결함 두 곳을 찾아 증상과 함께 설명하고 수정안을 제시하라.
 *       (정상 구현본 week07_pi_control.c는 활동 2가 끝난 뒤 배포한다)
 *
 * 힌트가 필요하면 이 순서로 생각해 본다.
 *   1. 출력이 상한에 걸린 채로 3초 있다가 지령을 낮추면 어떻게 될까?
 *   2. 출력에는 상한이 있다. 적분항 자체에는?
 *   3. 이 제어기는 1ms마다 호출된다. 코드에 곱해진 상수는 얼마인가?
 */
#include <stdint.h>

#define CTRL_PERIOD_S   0.0005f   /* 제어 주기[s] */

typedef struct {
    float kp, ki;            /* 게인 */
    float integ;             /* 적분 누적값(상태) */
    float out_min, out_max;  /* 출력 포화 한계 */
} pi_t;

/* 1ms 주기 태스크에서 호출한다. ref: 목표속도[rpm], meas: 측정속도[rpm] */
float pi_update(pi_t *c, float ref, float meas)
{
    float err = ref - meas;                        /* 오차 = 목표 - 실제 */
    float p   = c->kp * err;                       /* 비례항 */

    c->integ += c->ki * err * CTRL_PERIOD_S;       /* 적분항 누적 */

    float out = p + c->integ;                      /* PI 출력 = P + I */

    /* 출력 포화 */
    if (out > c->out_max) out = c->out_max;
    if (out < c->out_min) out = c->out_min;

    return out;                                    /* → PWM 듀티 지령 */
}

/* 호출 예 (1ms 주기 태스크 안)
 *
 *   static pi_t spd = { .kp = 2.0f, .ki = 10.0f,
 *                       .integ = 0.0f,
 *                       .out_min = 0.0f, .out_max = 60.0f };  // duty 상한 60%
 *
 *   float duty = pi_update(&spd, rpm_ref, rpm_fdb);
 *   pwm_set_duty(duty);
 */
