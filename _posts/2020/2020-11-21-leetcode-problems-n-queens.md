---
layout: post
title:  "LeetCode 51. N 皇后 困难"
date:   2020-11-21 19:38:58 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Backtracking
excerpt:
  n **皇后**难题研究的是如何把 `n` 个皇后放在 `n x n` 的棋盘上并使皇后彼此两两不能攻击的问题。<br>
  给定一个整数 `n`，返回所有不同的 **n 皇后难题**的解决方案。<br>
  每个解决方案都包含一个不同的 n 皇后位置的配置，其中 `'Q'` 和 `'.'` 分别表示一个皇后和一个空格。
---
> ## 51. N-Queens
> 
> The **n-queens** puzzle is the problem of placing `n` queens on an `n x n`
> chessboard such that no two queens attack each other.
> 
> Given an integer `n`, return *all distinct solutions to the **n-queens
> puzzle***.
> 
> Each solution contains a distinct board configuration of the n-queens'
> placement, where `'Q'` and `'.'` both indicate a queen and an empty space,
> respectively.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/queens.jpg" style="width: 600px; height: 268px;">
> 
> <pre>
> <strong>Input:</strong> n = 4
> <strong>Output:</strong> [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
> <strong>Explanation:</strong> There exist two distinct solutions to the 4-queens puzzle as shown above
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> n = 1
> <strong>Output:</strong> [["Q"]]
> </pre>
> 
> **Constraints:**
> 
> * `1 <= n <= 9`

## 解决方案

### 方法一：回溯

```cpp
class Solution {
private:
    vector<string> generateBoard(vector<int> &queens, int n) {
        auto board = vector<string>();
        for (int i = 0; i < n; i++) {
            string row = string(n, '.');
            row[queens[i]] = 'Q';
            board.push_back(row);
        }
        return board;
    }

    void backtrack(vector<vector<string>> &solutions, vector<int> &queens, int n, int row, unordered_set<int> &columns, unordered_set<int> &diagonals1, unordered_set<int> &diagonals2) {
        if (row == n) {
            vector<string> board = generateBoard(queens, n);
            solutions.push_back(board);
        } else {
            for (int i = 0; i < n; i++) {
                if (columns.find(i) != columns.end()) continue;
                int diagonal1 = row - i;
                if (diagonals1.find(diagonal1) != diagonals1.end()) continue;
                int diagonal2 = row + i;
                if (diagonals2.find(diagonal2) != diagonals2.end()) continue;
                queens[row] = i;
                columns.insert(i);
                diagonals1.insert(diagonal1);
                diagonals2.insert(diagonal2);
                backtrack(solutions, queens, n, row + 1, columns, diagonals1, diagonals2);
                queens[row] = -1;
                columns.erase(i);
                diagonals1.erase(diagonal1);
                diagonals2.erase(diagonal2);
            }
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> solutions;
        auto queens = vector<int>(n, -1);
        unordered_set<int> columns, diagonals1, diagonals2;
        backtrack(solutions, queens, n, 0, columns, diagonals1, diagonals2);
        return solutions;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n!)。
  n 是皇后的数量。
* 空间复杂度：*O*(n)。
  递归层数最多为 n，皇后放置位置数组和三个集合最大为 n。

## 参考链接

* [N-Queens - LeetCode](https://leetcode.com/problems/n-queens/){:target="_blank"}
