---
layout: post
title:  "LeetCode 62. 不同的路径（中等）"
date:   2021-02-06 20:02:36 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Dynamic-Programming
---
> 一个机器人位于一个 `m x n` 网格的左上角（起点在下图中标记为 "Start"）。
> 
> 机器人每次只能向下或向右移动一步。
> 机器人试图到达网格的右下角（在下图中标记为 "Finish"）。
> 
> 共有多少条不同的路径？
> 
> <img src="https://assets.leetcode.com/uploads/2018/10/22/robot_maze.png" style="width: 400px; height: 183px;">
> 
> **限制条件：**
> 
> * `1 <= m, n <= 100`
> * 已确保答案会小于或等于 <code>2 * 10<sup>9</sup></code>。

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
