#include <stdio.h>

#define STUDENTS 2
#define SUBJECTS 3
#define GRID_ROWS 8
#define GRID_COLS 12
#define BOARD_SIZE 3

int binary_search(const int data[], int count, int key)
{
    int low = 0;
    int high = count - 1;

    while (low <= high) {
        int mid = (low + high) / 2;

        if (data[mid] == key) {
            return mid;
        }

        if (key < data[mid]) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    return -1;
}

int sequential_search(const int data[], int count, int key)
{
    for (int i = 0; i < count; i++) {
        if (data[i] == key) {
            return i;
        }
    }

    return -1;
}

void print_scores(const int scores[STUDENTS][SUBJECTS])
{
    printf("[score table]\n");

    for (int student = 0; student < STUDENTS; student++) {
        int total = 0;

        printf("student %d:", student);
        for (int subject = 0; subject < SUBJECTS; subject++) {
            printf(" %3d", scores[student][subject]);
            total += scores[student][subject];
        }

        printf(" | total=%3d average=%.1f\n", total, total / (double)SUBJECTS);
    }
}

void clear_grid(char grid[GRID_ROWS][GRID_COLS])
{
    for (int r = 0; r < GRID_ROWS; r++) {
        for (int c = 0; c < GRID_COLS; c++) {
            grid[r][c] = '.';
        }
    }
}

void set_cell(char grid[GRID_ROWS][GRID_COLS], int row, int col, char value)
{
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        grid[row][col] = value;
    }
}

void print_grid(const char grid[GRID_ROWS][GRID_COLS])
{
    printf("\n[8x12 grid]\n");

    for (int r = 0; r < GRID_ROWS; r++) {
        for (int c = 0; c < GRID_COLS; c++) {
            putchar(grid[r][c]);
        }
        putchar('\n');
    }
}

void clear_board(char board[BOARD_SIZE][BOARD_SIZE])
{
    for (int r = 0; r < BOARD_SIZE; r++) {
        for (int c = 0; c < BOARD_SIZE; c++) {
            board[r][c] = ' ';
        }
    }
}

int place_mark(char board[BOARD_SIZE][BOARD_SIZE], int row, int col, char mark)
{
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return 0;
    }

    if (board[row][col] != ' ') {
        return 0;
    }

    board[row][col] = mark;
    return 1;
}

void print_board(const char board[BOARD_SIZE][BOARD_SIZE])
{
    printf("\n[tic-tac-toe board]\n");

    for (int r = 0; r < BOARD_SIZE; r++) {
        printf(" %c | %c | %c \n", board[r][0], board[r][1], board[r][2]);
        if (r < BOARD_SIZE - 1) {
            printf("---+---+---\n");
        }
    }
}

int main(void)
{
    const int sorted[] = {3, 8, 15, 24, 35, 57, 68, 85};
    const int count = (int)(sizeof(sorted) / sizeof(sorted[0]));
    const int key = 24;
    const int seq_index = sequential_search(sorted, count, key);
    const int bin_index = binary_search(sorted, count, key);

    printf("[search]\n");
    printf("key=%d sequential_index=%d binary_index=%d\n\n", key, seq_index, bin_index);

    const int scores[STUDENTS][SUBJECTS] = {
        {90, 85, 77},
        {88, 91, 95}
    };
    print_scores(scores);

    char grid[GRID_ROWS][GRID_COLS];
    clear_grid(grid);
    set_cell(grid, 2, 3, '#');
    set_cell(grid, 2, 4, '#');
    set_cell(grid, 3, 7, '#');
    set_cell(grid, 5, 9, '#');
    set_cell(grid, 6, 1, 'R');
    print_grid(grid);

    char board[BOARD_SIZE][BOARD_SIZE];
    clear_board(board);
    place_mark(board, 0, 0, 'O');
    place_mark(board, 1, 1, 'X');
    place_mark(board, 2, 2, 'O');
    print_board(board);

    return 0;
}
