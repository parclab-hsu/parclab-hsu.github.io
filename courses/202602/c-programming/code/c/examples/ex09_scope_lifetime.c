#include <stdio.h>

int global_count = 0;
int number = 3;

void local_counter(void);
void static_counter(void);
void global_counter(void);
void shadowing_demo(void);
void parameter_demo(int value);

int main(void)
{
    printf("[local counter]\n");
    local_counter();
    local_counter();

    printf("\n[static counter]\n");
    static_counter();
    static_counter();

    printf("\n[global counter]\n");
    global_counter();
    global_counter();

    printf("\n[shadowing]\n");
    shadowing_demo();
    printf("global number in main = %d\n", number);

    printf("\n[parameter copy]\n");
    int score = 70;
    parameter_demo(score);
    printf("score in main = %d\n", score);

    return 0;
}

void local_counter(void)
{
    int count = 0;
    count++;
    printf("local count = %d\n", count);
}

void static_counter(void)
{
    static int count = 0;
    count++;
    printf("static count = %d\n", count);
}

void global_counter(void)
{
    global_count++;
    printf("global count = %d\n", global_count);
}

void shadowing_demo(void)
{
    int number = 8;
    printf("local number in shadowing_demo = %d\n", number);
}

void parameter_demo(int value)
{
    value = 100;
    printf("value in parameter_demo = %d\n", value);
}
