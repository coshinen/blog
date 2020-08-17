---
layout: post
title:  "LeetCode 37. 数独解法 困难"
date:   2020-08-15 09:58:35 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hash-Table Backtracking
excerpt: 写一个通过填充空格来解决数独问题的程序。
---
> ## 37. Sudoku Solver | Hard
> 
> Write a program to solve a Sudoku puzzle by filling the empty cells.
> 
> A sudoku solution must satisfy **all of the following rules**:
> 
> 1. Each of the digits `1-9` must occur exactly once in each row.
> 2. Each of the digits `1-9` must occur exactly once in each column.
> 3. Each of the the digits `1-9` must occur exactly once in each of the 9 `3x3` sub-boxes of the grid.
> 
> Empty cells are indicated by the character `'.'`.
> 
> ![Sudoku-by-L2G-20050714](https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Sudoku-by-L2G-20050714.svg/250px-Sudoku-by-L2G-20050714.svg.png)
> 
> A sudoku puzzle...
> 
> ![Sudoku-by-L2G-20050714_solution](https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Sudoku-by-L2G-20050714_solution.svg/250px-Sudoku-by-L2G-20050714_solution.svg.png)
> 
> ...and its solution numbers marked in red.
> 
> **Note:**
> 
> * The given board contain only digits `1-9` and the character `'.'`.
> * You may assume that the given Sudoku puzzle will have a single unique solution.
> * The given board size is always `9x9`.

## 解决方案

### 方法一：回溯法（Backtracking）

```cpp
class Solution {
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
* 时间复杂度：_O_(1)，数独大小固定，最多操作 (9!)<sup>9</sup> 次。
* 空间复杂度：_O_(1)。

## 参考链接

* [Sudoku Solver - LeetCode](https://leetcode.com/problems/sudoku-solver/){:target="_blank"}
