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

        /* 이 파일은 code/index.md 의 gcc 명령으로도 빌드되도록 표준 scanf 를 쓴다.
           Visual Studio 2022 에서는 강의 표준대로 scanf_s("%d", &score) 로 바꾼다.
           숫자가 아닌 입력이 버퍼에 남아 무한 반복하는 것을 막으려면 비워 준다. */
        if (scanf("%d", &score) != 1) {
            int ch;
            while ((ch = getchar()) != '\n' && ch != EOF) { }
            printf("Please enter a number.\n");
            continue;
        }

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
