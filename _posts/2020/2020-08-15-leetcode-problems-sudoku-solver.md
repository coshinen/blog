---
layout: post
title:  "LeetCode 37. 数独解法（困难）"
date:   2020-08-15 09:58:35 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Hash-Table Backtracking
excerpt:
  写一个通过填充空单元格来解决数独问题的程序。<br>
  数独解法必须满足**以下所有规则**：<br>
  1. 每个数字 `1-9` 必须在每行中恰好出现一次。<br>
  2. 每个数字 `1-9` 必须在每列中恰好出现一次。<br>
  3. 每个数字 `1-9` 必须在每个 `3x3` 的子网格中恰好出现一次。<br>
  字符 `'.'` 表示空单元格。
---
> ## 37. Sudoku Solver
> 
> Write a program to solve a Sudoku puzzle by filling the empty cells.
> 
> A sudoku solution must satisfy **all of the following rules**:
> 
> 1. Each of the digits `1-9` must occur exactly once in each row.
> 2. Each of the digits `1-9` must occur exactly once in each column.
> 3. Each of the digits `1-9` must occur exactly once in each of the 9 `3x3`
> sub-boxes of the grid.
> 
> The `'.'` character indicates empty cells.
> 
> **Example 1:**
> 
> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Sudoku-by-L2G-20050714.svg/250px-Sudoku-by-L2G-20050714.svg.png" style="height:250px; width:250px">
> 
> <pre>
> <strong>Input:</strong> board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]
> <strong>Output:</strong> [["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","9"]]
> <strong>Explanation:</strong> The input board is shown above and the only valid solution is shown below:
> 
> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Sudoku-by-L2G-20050714_solution.svg/250px-Sudoku-by-L2G-20050714_solution.svg.png" style="height:250px; width:250px">
> </pre>
> 
> **Constraints:**
> 
> * `board.length == 9`
> * `board[i].length == 9`
> * `board[i][j]` is a digit or `'.'`.
> * It is **guaranteed** that the input board has only one solution.

## 解决方案

### 方法一：回溯法

```cpp
class Solution {
private:
    bool rows[9][9] = {false};
    bool columns[9][9] = {false};
    bool boxes[9][9] = {false};

    bool backTrack(vector<vector<char>>& board, int row, int col) {
        while (board[row][col] != '.') {
            if (++col >= 9) {
                col = 0;
                row++;
            }
            if (row >= 9) return true;
        }
        for (int i = 0; i < 9; i++) {
            int boxIdx = (row / 3) * 3 + col / 3;
            if (rows[row][i] || columns[col][i] || boxes[boxIdx][i]) continue;
            rows[row][i] = true;
            columns[col][i] = true;
            boxes[boxIdx][i] = true;
            board[row][col] = i + '1';
            if (backTrack(board, row, col)) {
                return true;
            } else {
                rows[row][i] = false;
                columns[col][i] = false;
                boxes[boxIdx][i] = false;
                board[row][col] = '.';
            }
        }
        return false;
    }

public:
    void solveSudoku(vector<vector<char>>& board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] != '.') {
                    rows[i][board[i][j] - '1'] = true;
                    columns[j][board[i][j] - '1'] = true;
                    boxes[(i / 3) * 3 + j / 3][board[i][j] - '1'] = true;
                }
            }
        }
        backTrack(board, 0, 0);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
  数独大小固定，最多操作 (9!)<sup>9</sup> 次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Sudoku Solver - LeetCode](https://leetcode.com/problems/sudoku-solver/){:target="_blank"}
