/*
 * [5·6주차] BLDC 6-step 정류 — 홀센서 위치로 상(相) 전환
 * ------------------------------------------------------
 * 홀센서 3개(Ha,Hb,Hc)가 회전자 위치를 알려주면, 그 위치에 맞는
 * "두 상만 통전"하도록 6개 스위치를 켠다(6-step). 위치가 바뀔 때마다
 * EXTI 인터럽트로 이 함수를 호출해 다음 스텝으로 넘어간다.
 * (교육용 자작 코드)
 */
#include <stdint.h>

/* 각 상의 상태:  +1 = 상단 스위치 On(전류 유입), -1 = 하단 On(전류 유출), 0 = 개방 */
typedef struct { int8_t u, v, w; } phase_t;

/* 홀 3비트를 하나의 숫자로: HallSum = Ha*4 + Hb*2 + Hc  (000,111은 오류/미사용) */
static inline uint8_t hall_sum(uint8_t ha, uint8_t hb, uint8_t hc){
    return (uint8_t)((ha << 2) | (hb << 1) | hc);
}

/* 6-step 정방향 룩업테이블: 홀 조합 → 어느 두 상을 통전할지.
 * (모터마다 홀 배치가 다르므로 실제 모터에 맞춰 매핑을 확인/수정해야 한다) */
static phase_t commutation_fwd(uint8_t hs)
{
    switch (hs) {
        case 0b101: return (phase_t){ +1,  0, -1 };  /* U→W */
        case 0b100: return (phase_t){ +1, -1,  0 };  /* U→V */
        case 0b110: return (phase_t){  0, -1, +1 };  /* W→V */
        case 0b010: return (phase_t){ -1,  0, +1 };  /* W→U */
        case 0b011: return (phase_t){ -1, +1,  0 };  /* V→U */
        case 0b001: return (phase_t){  0, +1, -1 };  /* V→W */
        default:    return (phase_t){  0,  0,  0 };  /* 0/7: 정지(오류 방지) */
    }
}

/* 위 phase_t를 실제 PWM 채널로 반영(개념):
 *   +1 → 상단 스위치에 PWM 듀티 인가(속도 제어), -1 → 하단 스위치 On, 0 → 양쪽 Off
 * 유니폴라 PWM: 상단만 PWM하고 하단은 On 유지 → 하단 On 구간에 션트로 전류 정확 센싱 */
extern void apply_phase(phase_t p, uint16_t duty);  /* timer 드라이버에서 구현 */

volatile uint8_t g_hall;
/* 홀 신호 변화 시(EXTI0/1/2) 호출: 위치 갱신 → 즉시 다음 스텝 통전 */
void hall_isr(uint8_t ha, uint8_t hb, uint8_t hc, uint16_t throttle_duty)
{
    g_hall = hall_sum(ha, hb, hc);
    apply_phase(commutation_fwd(g_hall), throttle_duty);
}
