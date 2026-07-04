#include <stdio.h>

void print_array(const int arr[], int count);
int sum_array(const int arr[], int count);
double average_array(const int arr[], int count);
int min_array(const int arr[], int count);
int max_array(const int arr[], int count);
int find_index(const int arr[], int count, int target);
void selection_sort(int arr[], int count);
void print_moving_average3(const int arr[], int count);

int main(void)
{
    int scores[] = {23, 45, 67, 89, 55, 12};
    int count = (int)(sizeof(scores) / sizeof(scores[0]));
    int target = 67;

    printf("[original]\n");
    print_array(scores, count);
    printf("count = %d\n", count);
    printf("sum = %d\n", sum_array(scores, count));
    printf("average = %.2f\n", average_array(scores, count));
    printf("min = %d\n", min_array(scores, count));
    printf("max = %d\n", max_array(scores, count));

    int index = find_index(scores, count, target);
    if (index >= 0) {
        printf("%d is at index %d\n", target, index);
    } else {
        printf("%d was not found\n", target);
    }

    printf("\n[moving average window=3]\n");
    print_moving_average3(scores, count);

    selection_sort(scores, count);
    printf("\n[sorted]\n");
    print_array(scores, count);

    return 0;
}

void print_array(const int arr[], int count)
{
    for (int i = 0; i < count; i++) {
        printf("arr[%d] = %d\n", i, arr[i]);
    }
}

int sum_array(const int arr[], int count)
{
    int sum = 0;

    for (int i = 0; i < count; i++) {
        sum += arr[i];
    }

    return sum;
}

double average_array(const int arr[], int count)
{
    if (count <= 0) {
        return 0.0;
    }

    return (double)sum_array(arr, count) / count;
}

int min_array(const int arr[], int count)
{
    int min_value = arr[0];

    for (int i = 1; i < count; i++) {
        if (arr[i] < min_value) {
            min_value = arr[i];
        }
    }

    return min_value;
}

int max_array(const int arr[], int count)
{
    int max_value = arr[0];

    for (int i = 1; i < count; i++) {
        if (arr[i] > max_value) {
            max_value = arr[i];
        }
    }

    return max_value;
}

int find_index(const int arr[], int count, int target)
{
    for (int i = 0; i < count; i++) {
        if (arr[i] == target) {
            return i;
        }
    }

    return -1;
}

void selection_sort(int arr[], int count)
{
    for (int start = 0; start < count - 1; start++) {
        int min_index = start;

        for (int i = start + 1; i < count; i++) {
            if (arr[i] < arr[min_index]) {
                min_index = i;
            }
        }

        if (min_index != start) {
            int temp = arr[start];
            arr[start] = arr[min_index];
            arr[min_index] = temp;
        }
    }
}

void print_moving_average3(const int arr[], int count)
{
    const int window = 3;

    for (int i = window - 1; i < count; i++) {
        int sum = 0;

        for (int j = i - window + 1; j <= i; j++) {
            sum += arr[j];
        }

        printf("arr[%d..%d] average = %.2f\n",
               i - window + 1,
               i,
               (double)sum / window);
    }
}
