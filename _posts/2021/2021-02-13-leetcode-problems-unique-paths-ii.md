---
layout: post
title:  "LeetCode 63. 不同的路径 II 中等"
date:   2021-02-13 09:40:35 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Dynamic-Programming
excerpt:
  一个机器人位于一个 `m x n` 网格的左上角（起点在下图中标记为 "Start"）。<br>
  机器人每次只能向下或向右移动一步。
  机器人试图到达网格的右下角（在下图中标记为 "Finish"）。<br>
  现在考虑如果有一些障碍物添加到网格中。
  共有多少条不同的路径？<br>
  网格中的障碍物和空格分别用 `1` 和 `0` 标记。
---
> ## 63. Unique Paths II
> 
> A robot is located at the top-left corner of a `m x n` grid (marked 'Start' in
> the diagram below).
> 
> The robot can only move either down or right at any point in time. The robot
> is trying to reach the bottom-right corner of the grid (marked 'Finish' in the
> diagram below).
> 
> Now consider if some obstacles are added to the grids. How many unique paths
> would there be?
> 
> An obstacle and space is marked as 1 and 0 respectively in the grid.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/04/robot1.jpg" style="width: 242px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]
> <strong>Output:</strong> 2
> <strong>Explanation:</strong> There is one obstacle in the middle of the 3x3 grid above.
> There are two ways to reach the bottom-right corner:
> 1. Right -> Right -> Down -> Down
> 2. Down -> Down -> Right -> Right
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/04/robot2.jpg" style="width: 162px; height: 162px;">
> 
> <pre>
> <strong>Input:</strong> obstacleGrid = [[0,1],[0,0]]
> <strong>Output:</strong> 1
> </pre>
> 
> **Constraints:**
> 
> * `m == obstacleGrid.length`
> * `n == obstacleGrid[i].length`
> * `1 <= m, n <= 100`
> * `obstacleGrid[i][j]` is `0` or `1`.
> 
> <details>
> <summary>Hint 1</summary>
> The robot can only move either down or right. Hence any cell in the first row
> can only be reached from the cell left to it. However, if any cell has an
> obstacle, you don't let that cell contribute to any path. So, for the first
> row, the number of ways will simply be
> <pre>
> if obstacleGrid[i][j] is not an obstacle
>      obstacleGrid[i,j] = obstacleGrid[i,j - 1] 
> else
>      obstacleGrid[i,j] = 0
> </pre>
> You can do a similar processing for finding out the number of ways of reaching
> the cells in the first column.
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> For any other cell, we can find out the number of ways of reaching it, by
> making use of the number of ways of reaching the cell directly above it and
> the cell to the left of it in the grid. This is because these are the only two
> directions from which the robot can come to the current cell.
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Since we are making use of pre-computed values along the iteration, this
> becomes a dynamic programming problem.
> <pre>
> if obstacleGrid[i][j] is not an obstacle
>      obstacleGrid[i,j] = obstacleGrid[i,j - 1]  + obstacleGrid[i - 1][j]
> else
>      obstacleGrid[i,j] = 0
> </pre>
> </details>

## 解决方案

### 方法一：动态规划+滚动数组

转移方程：`u(i, j) == 0` 表示有障碍物。

```
f(i, j) = 0,                         u(i, j) == 0
f(i, j) = f(i - 1, j) + f(i, j - 1), u(i, j) != 0
```

```cpp
class Solution {
public:
    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
        int m = obstacleGrid.size(), n = obstacleGrid[0].size();
        vector<int> f(n);
        f[0] = (obstacleGrid[0][0] == 0);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++){
                if (obstacleGrid[i][j] == 1) {
                    f[j] = 0;
                    continue;
                }
                if (j >= 1 && obstacleGrid[i][j - 1] == 0) f[j] += f[j - 1];
            }
        }
        return f.back();
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 为网格的行数，n 为网格的列数，只需要遍历一次网格。
* 空间复杂度：*O*(n)。
  用滚动数组来保存每一行的状态。

## 参考链接

* [Unique Paths II - LeetCode](https://leetcode.com/problems/unique-paths-ii/){:target="_blank"}
