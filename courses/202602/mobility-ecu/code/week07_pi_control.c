/*
 * [7주차] PI 속도 제어기 — 목표 속도를 오차 없이 따라가기
 * -----------------------------------------------------
 * P(비례): 오차에 비례해 즉시 반응(빠르지만 정상상태 오차 남음)
 * I(적분): 오차를 계속 누적해 남은 오차를 0으로(느리지만 정확)
 * 둘을 합친 PI가 모터 속도제어의 표준. 일정 주기(예 1ms)마다 호출한다.
 */
#include <stdint.h>

typedef struct {
    float kp, ki;        /* 게인. 초기값 예: Kp=J*wc^2/KT, Ki=Kp/5 */
    float integ;         /* 적분 누적값(상태) */
    float out_min, out_max;  /* 출력 포화(안티 와인드업용 한계) */
} pi_t;

/* dt: 호출 주기[s] (예: 0.001). ref: 목표속도, meas: 측정속도 */
float pi_update(pi_t *c, float ref, float meas, float dt)
{
    float err = ref - meas;              /* 오차 = 목표 - 실제 */
    float p   = c->kp * err;             /* 비례항 */
    c->integ += c->ki * err * dt;        /* 적분항 누적 */

    /* 안티 와인드업: 적분값이 출력 한계를 넘어 부풀지 않도록 제한 */
    if (c->integ > c->out_max) c->integ = c->out_max;
    if (c->integ < c->out_min) c->integ = c->out_min;

    float out = p + c->integ;            /* PI 출력 = P + I */
    if (out > c->out_max) out = c->out_max;   /* 최종 포화 */
    if (out < c->out_min) out = c->out_min;
    return out;                          /* → PWM 듀티 지령으로 사용 */
}
