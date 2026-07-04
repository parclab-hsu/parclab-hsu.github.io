#include <stdio.h>

typedef int (*BinaryOp)(int, int);

static int add(int a, int b)
{
    return a + b;
}

static int subtract(int a, int b)
{
    return a - b;
}

static int multiply(int a, int b)
{
    return a * b;
}

static int divide_safe(int a, int b)
{
    if (b == 0) {
        printf("division by zero is not allowed\\n");
        return 0;
    }
    return a / b;
}

int main(void)
{
    const char *names[] = {"add", "subtract", "multiply", "divide"};
    BinaryOp operations[] = {add, subtract, multiply, divide_safe};
    int count = (int)(sizeof(operations) / sizeof(operations[0]));

    int a = 20;
    int b = 5;

    printf("function pointer menu\\n");
    for (int i = 0; i < count; ++i) {
        int result = operations[i](a, b);
        printf("%d. %s(%d, %d) = %d\\n", i, names[i], a, b, result);
    }

    printf("\\nchange menu order and observe which function is called.\\n");
    return 0;
}
