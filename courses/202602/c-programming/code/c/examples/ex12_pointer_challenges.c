#include <stdio.h>

struct Student {
    char name[12];
    int kor;
    int math;
    int sum;
    int total;
};

int sum_with_post_increment(const int *data, int count)
{
    int total = 0;
    const int *p = data;

    for (int i = 0; i < count; i++) {
        total += *p;
        p++;
    }

    return total;
}

int sum_with_compact_expression(const int *data, int count)
{
    int total = 0;
    const int *p = data;

    for (int i = 0; i < count; i++) {
        total += *p++;
    }

    return total;
}

void pointer_to_array_demo(void)
{
    int table[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    int (*row)[3] = table;

    printf("[pointer to array]\n");
    printf("table[1][2]=%d\n", table[1][2]);
    printf("row[1][2]=%d\n", row[1][2]);
    printf("*(*(row + 1) + 2)=%d\n\n", *(*(row + 1) + 2));
}

void struct_pointer_demo(void)
{
    struct Student students[3] = {
        {"Hong", 90, 85, 0, 0},
        {"Lee", 88, 91, 0, 0},
        {"Kim", 80, 75, 0, 0}
    };
    struct Student *p = students;

    for (int i = 0; i < 3; i++) {
        (p + i)->sum = (p + i)->kor + (p + i)->math;
        (p + i)->total = (p + i)->sum;
    }

    printf("[struct pointer preview]\n");
    for (int i = 0; i < 3; i++) {
        printf("%s sum=%d\n", (p + i)->name, (p + i)->sum);
    }
}

int main(void)
{
    int scores[] = {88, 99, 87};
    int count = (int)(sizeof(scores) / sizeof(scores[0]));

    printf("[array sum]\n");
    printf("expanded expression total=%d\n", sum_with_post_increment(scores, count));
    printf("compact expression total=%d\n\n", sum_with_compact_expression(scores, count));

    pointer_to_array_demo();
    struct_pointer_demo();

    return 0;
}
