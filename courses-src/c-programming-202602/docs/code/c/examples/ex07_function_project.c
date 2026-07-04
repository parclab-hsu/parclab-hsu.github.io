#include <stdio.h>

int input_score(const char *label);
char grade_fun(int score);
void print_result(int midterm, int final_exam, double average, char grade);

int main(void)
{
    int midterm = input_score("midterm");
    int final_exam = input_score("final");
    double average = (midterm + final_exam) / 2.0;
    char grade = grade_fun((int)average);

    print_result(midterm, final_exam, average, grade);
    return 0;
}

int input_score(const char *label)
{
    int score;

    while (1) {
        printf("%s score (0-100): ", label);
        scanf_s("%d", &score);

        if (score >= 0 && score <= 100) {
            return score;
        }

        printf("Score must be between 0 and 100. Try again.\n");
    }
}

char grade_fun(int score)
{
    if (score >= 90) {
        return 'A';
    }

    if (score >= 80) {
        return 'B';
    }

    if (score >= 70) {
        return 'C';
    }

    if (score >= 60) {
        return 'D';
    }

    return 'F';
}

void print_result(int midterm, int final_exam, double average, char grade)
{
    printf("\n[Function Project Result]\n");
    printf("midterm: %d\n", midterm);
    printf("final: %d\n", final_exam);
    printf("average: %.1f\n", average);
    printf("grade: %c\n", grade);
}
