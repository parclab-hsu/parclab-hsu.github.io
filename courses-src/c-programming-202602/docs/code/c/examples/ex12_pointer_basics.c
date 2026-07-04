#include <stdio.h>

void print_address_demo(void)
{
    int count = 23;
    double voltage = 3.3;
    char state = 'R';

    printf("[address demo]\n");
    printf("count value=%d address=%p\n", count, (void *)&count);
    printf("voltage value=%.1f address=%p\n", voltage, (void *)&voltage);
    printf("state value=%c address=%p\n\n", state, (void *)&state);
}

void change_value_through_pointer(void)
{
    int speed = 10;
    int *p_speed = &speed;

    printf("[indirect reference]\n");
    printf("before: speed=%d *p_speed=%d\n", speed, *p_speed);
    *p_speed = 30;
    printf("after : speed=%d *p_speed=%d\n\n", speed, *p_speed);
}

void swap_by_pointer(int *left, int *right)
{
    if (left == NULL || right == NULL) {
        return;
    }

    int temp = *left;
    *left = *right;
    *right = temp;
}

double average_by_pointer(const int *data, int count)
{
    if (data == NULL || count <= 0) {
        return 0.0;
    }

    int sum = 0;
    for (const int *p = data; p < data + count; p++) {
        sum += *p;
    }

    return sum / (double)count;
}

void print_array_by_pointer(const int *data, int count)
{
    printf("[array by pointer]\n");
    for (const int *p = data; p < data + count; p++) {
        printf("value=%3d address=%p\n", *p, (const void *)p);
    }
}

int main(void)
{
    print_address_demo();
    change_value_through_pointer();

    int left = 7;
    int right = 12;
    printf("[swap]\n");
    printf("before: left=%d right=%d\n", left, right);
    swap_by_pointer(&left, &right);
    printf("after : left=%d right=%d\n\n", left, right);

    int samples[] = {100, 200, 300, 400, 500};
    int count = (int)(sizeof(samples) / sizeof(samples[0]));
    print_array_by_pointer(samples, count);
    printf("average=%.1f\n\n", average_by_pointer(samples, count));

    int *safe = NULL;
    if (safe != NULL) {
        *safe = 1;
    } else {
        printf("[null check]\npointer is NULL, so it is not dereferenced.\n");
    }

    return 0;
}
