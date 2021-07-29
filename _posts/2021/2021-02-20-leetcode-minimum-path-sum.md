---
layout: post
title:  "LeetCode 64. 最小路径和（中等）"
date:   2021-02-20 19:23:04 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Dynamic-Programming
---
> 给定一个包含非负整数的 `m x n` 网格，找出一条从左上到右下的路径，使路径上的数字总和最小。
> 
> **注：**你每次只能向下或向右移动一步。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/05/minpath.jpg" style="width: 242px; height: 242px;">
> 
> **限制条件：**
> 
> * `m == grid.length`
> * `n == grid[i].length`
> * `1 <= m, n <= 200`
> * `0 <= grid[i][j] <= 100`

## 解决方案

### 方法一：动态规划

状态转移方程：

```
当 i > 0 且 j = 0 时，dp[i][0] = dp[i - 1][0] + grid[i][0]。
当 i = 0 且 j > 0 时，dp[0][j] = dp[0][j - 1] + grid[0][j]。
当 i > 0 且 j > 0 时，dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]。
```

```cpp
class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        if (rows == 0 || cols == 0) return 0;
        auto dp = vector<vector<int>>(rows, vector<int>(cols));
        dp[0][0] = grid[0][0];
        for (int i = 1; i < rows; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];
        for (int j = 1; j < cols; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];
        for (int i = 1; i < rows; i++) {
            for (int j = 1; j < cols; j++) {
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
            }
        }
        return dp[rows - 1][cols - 1];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为网格的行数和列数，只需要遍历网格一次。
* 空间复杂度：*O*(mn)。
  动态数组 dp 的大小，同网格。

## 参考链接

* [Minimum Path Sum - LeetCode](https://leetcode.com/problems/minimum-path-sum/){:target="_blank"}
