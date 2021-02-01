---
layout: post
title:  "LeetCode 52. N 皇后 II 困难"
date:   2020-11-28 07:24:14 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Backtracking
excerpt: n **皇后**难题研究的是如何把 `n` 个皇后放在 `n x n` 的棋盘上并使皇后彼此两两不能攻击的问题。给定一个整数 `n`，返回 **n 皇后难题**不同解决方案的数量。
---
> ## 52. N-Queens II
> 
> The **n-queens** puzzle is the problem of placing `n` queens on an `n x n`
> chessboard such that no two queens attack each other.
> 
> Given an integer `n`, return *the number of distinct solutions to the
> **n-queens puzzle***.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/queens.jpg" style="width: 600px; height: 268px;">
> 
> <pre>
> <strong>Input:</strong> n = 4
> <strong>Output:</strong> 2
> <strong>Explanation:</strong> There are two distinct solutions to the 4-queens puzzle as shown.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> n = 1
> <strong>Output:</strong> 1
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
    int backtrack(int n, int row, unordered_set<int> &columns, unordered_set<int> &diagonals1, unordered_set<int> &diagonals2) {
        if (row == n) {
            return 1;
        } else {
            int count = 0;
            for (int i = 0; i < n; i++) {
                if (columns.find(i) != columns.end()) continue;
                int diagonal1 = row - i;
                if (diagonals1.find(diagonal1) != diagonals1.end()) continue;
                int diagonal2 = row + i;
                if (diagonals2.find(diagonal2) != diagonals2.end()) continue;
                columns.insert(i);
                diagonals1.insert(diagonal1);
                diagonals2.insert(diagonal2);
                count += backtrack(n, row + 1, columns, diagonals1, diagonals2);
                columns.erase(i);
                diagonals1.erase(diagonal1);
                diagonals2.erase(diagonal2);
            }
            return count;
        }
    }

public:
    int totalNQueens(int n) {
        unordered_set<int> columns, diagonals1, diagonals2;
        return backtrack(n, 0, columns, diagonals1, diagonals2);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n!)。
  n 是皇后的数量。
* 空间复杂度：*O*(n)。
  递归层数最多为 n，皇后放置位置数组和三个集合最大为 n。

## 参考链接

* [N-Queens II - LeetCode](https://leetcode.com/problems/n-queens-ii/){:target="_blank"}
