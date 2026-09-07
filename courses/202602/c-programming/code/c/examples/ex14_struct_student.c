#include <stdio.h>

typedef struct {
    char name[16];
    int kor;
    int math;
    int total;
    double avg;
} Student;

Student make_student(const char *name, int kor, int math)
{
    Student s = {"", kor, math, 0, 0.0};

    /* name 은 길이를 알 수 없는 포인터다. strcpy 를 쓰면 name[16] 을
       넘겨도 그대로 써 버리므로, 크기를 명시하는 snprintf 를 쓴다. */
    snprintf(s.name, sizeof(s.name), "%s", name);
    s.total = s.kor + s.math;
    s.avg = s.total / 2.0;
    return s;
}

void update_score(Student *s, int kor, int math)
{
    s->kor = kor;
    s->math = math;
    s->total = s->kor + s->math;
    s->avg = s->total / 2.0;
}

void print_student(const Student *s)
{
    printf("%-8s kor=%3d math=%3d total=%3d avg=%5.1f\n",
           s->name, s->kor, s->math, s->total, s->avg);
}

int main(void)
{
    Student students[3] = {
        make_student("Hong", 90, 85),
        make_student("Lee", 88, 91),
        make_student("Park", 80, 75)
    };

    update_score(&students[2], 95, 92);

    for (int i = 0; i < 3; i++) {
        print_student(&students[i]);
    }

    return 0;
}
