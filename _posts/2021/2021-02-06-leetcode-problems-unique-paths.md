---
layout: post
title:  "LeetCode 62. 不同的路径（中等）"
date:   2021-02-06 20:02:36 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Dynamic-Programming
excerpt:
  一个机器人位于一个 `m x n` 网格的左上角（起点在下图中标记为 "Start"）。<br>
  机器人每次只能向下或向右移动一步。
  机器人试图到达网格的右下角（在下图中标记为 "Finish"）。<br>
  共有多少条不同的路径？
---
> ## 62. Unique Paths
> 
> A robot is located at the top-left corner of a `m x n` grid (marked 'Start' in
> the diagram below).
> 
> The robot can only move either down or right at any point in time. The robot
> is trying to reach the bottom-right corner of the grid (marked 'Finish' in the
> diagram below).
> 
> How many possible unique paths are there?
> 
> **Example 1:**
> 
> <img src="https://assets.leetcode.com/uploads/2018/10/22/robot_maze.png" style="width: 400px; height: 183px;">
> 
> <pre>
> <strong>Input:</strong> m = 3, n = 7
> <strong>Output:</strong> 28
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> m = 3, n = 2
> <strong>Output:</strong> 3
> <strong>Explanation:</strong>
> From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:
> 1. Right -> Down -> Down
> 2. Down -> Down -> Right
> 3. Down -> Right -> Down
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> m = 7, n = 3
> <strong>Output:</strong> 28
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> m = 3, n = 3
> <strong>Output:</strong> 6
> </pre>
> 
> **Constraints:**
> 
> * `1 <= m, n <= 100`
> * It's guaranteed that the answer will be less than or equal to <code>2 * 10<sup>9</sup></code>.

## 解决方案

### 方法一：动态规划

转移方程：f(i, j) = f(i - 1, j) + f(i, j - 1)

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<vector<int>> f(m, vector<int>(n));
        for (int i = 0; i < m; i++) f[i][0] = 1;
        for (int j = 0; j < n; j++) f[0][j] = 1;
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                f[i][j] = f[i - 1][j] + f[i][j - 1];
            }
        }
        return f[m - 1][n - 1];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
* 空间复杂度：*O*(mn)。
  存储所有状态所需的空间。

## 参考链接

* [Unique Paths - LeetCode](https://leetcode.com/problems/unique-paths/){:target="_blank"}
