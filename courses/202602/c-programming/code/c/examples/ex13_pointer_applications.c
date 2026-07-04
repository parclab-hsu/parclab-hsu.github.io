#include <stdio.h>

static void print_string_examples(void)
{
    char word[] = "RUN";
    const char *state = "SLOW";

    printf("[string]\\n");
    printf("word  = %s, first = %c\\n", word, word[0]);
    printf("state = %s, first = %c\\n", state, state[0]);

    word[0] = 'F';
    printf("changed word = %s\\n\\n", word);
}

static void print_pointer_array(void)
{
    const char *modes[] = {"STOP", "SLOW", "RUN", "STATUS"};
    int count = (int)(sizeof(modes) / sizeof(modes[0]));

    printf("[pointer array]\\n");
    for (int i = 0; i < count; ++i) {
        printf("%d: %s (%p)\\n", i, modes[i], (const void *)modes[i]);
    }
    printf("\\n");
}

static int sum_grid(const int (*grid)[4], int rows)
{
    int sum = 0;
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < 4; ++c) {
            sum += grid[r][c];
        }
    }
    return sum;
}

static void min_max_avg(const int *values, int count, int *min_value, int *max_value, double *avg)
{
    int min_v = values[0];
    int max_v = values[0];
    int sum = 0;

    for (int i = 0; i < count; ++i) {
        if (values[i] < min_v) {
            min_v = values[i];
        }
        if (values[i] > max_v) {
            max_v = values[i];
        }
        sum += values[i];
    }

    *min_value = min_v;
    *max_value = max_v;
    *avg = (double)sum / count;
}

int main(void)
{
    print_string_examples();
    print_pointer_array();

    int grid[2][4] = {
        {10, 20, 30, 40},
        {50, 60, 70, 80}
    };

    printf("[array pointer]\\n");
    printf("grid total = %d\\n\\n", sum_grid(grid, 2));

    int samples[] = {72, 85, 61, 90, 77};
    int min_value = 0;
    int max_value = 0;
    double avg = 0.0;

    min_max_avg(samples, 5, &min_value, &max_value, &avg);

    printf("[multiple output parameters]\\n");
    printf("min = %d, max = %d, avg = %.1f\\n", min_value, max_value, avg);

    return 0;
}
