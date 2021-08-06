---
layout: post
title:  "LeetCode 37. 数独解法（困难）"
date:   2020-08-15 09:58:35 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Hash-Table Backtracking
---
> 写一个通过填充空单元格来解决数独问题的程序。
> 
> 数独解法必须满足**以下所有规则**：
> 
> 1. 每个数字 `1-9` 必须在每行中恰好出现一次。
> 2. 每个数字 `1-9` 必须在每列中恰好出现一次。
> 3. 每个数字 `1-9` 必须在每个 `3x3` 的子网格中恰好出现一次。
> 
> 字符 `'.'` 表示空单元格。
> 
> <img style="height:250px; width:250px" src="https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714svg.png">
> <img style="height:250px; width:250px" src="https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714_solutionsvg.png">
> 
> **限制条件：**
> 
> * `board.length == 9`
> * `board[i].length == 9`
> * `board[i][j]` 是一个数或 `'.'`。
> * 本题**已确保**输入网格只有一个解决方案。

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
