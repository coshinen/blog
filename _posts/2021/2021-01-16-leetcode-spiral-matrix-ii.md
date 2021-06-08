---
layout: post
title:  "LeetCode 59. 螺旋矩阵 II（中等）"
date:   2021-01-16 09:07:19 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array
excerpt: 给定一个正整数 `n`，生成一个含 `1` 到 <code>n<sup>2</sup></code> 所有元素并按顺时针螺旋排列的 `n x n` `矩阵`。
---
> ## 59. Spiral Matrix II
> 
> Given a positive integer `n`, generate an `n x n` `matrix` filled with
> elements from `1` to <code>n<sup>2</sup></code> in spiral order.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/spiraln.jpg" style="width: 242px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> n = 3
> <strong>Output:</strong> [[1,2,3],[8,9,4],[7,6,5]]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> n = 1
> <strong>Output:</strong> [[1]]
> </pre>
> 
> **Constraints:**
> 
> * `1 <= n <= 20`

## 解决方案

### 方法一：按层模拟

```cpp
class Solution {
public:
    vector<vector<int>> generateMatrix(int n) {
        int left = 0, right = n - 1, top = 0, bottom = n - 1, num = 1;
        vector<vector<int>> matrix(n, vector<int>(n));
        while (true) {
            for (int col = left; col <= right; col++) matrix[top][col] = num++;
            if (++top > bottom) break;
            for (int row = top; row <= bottom; row++) matrix[row][right] = num++;
            if (--right < left) break;
            for (int col = right; col >= left; col--) matrix[bottom][col] = num++;
            if (--bottom < top) break;
            for (int row = bottom; row >= top; row--) matrix[row][left] = num++;
            if (++left > right) break;
        }
        return matrix;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  生成的矩阵共 n<sup>2</sup> 个元素。
* 空间复杂度：*O*(n<sup>2</sup>)。

## 参考链接

* [Spiral Matrix II - LeetCode](https://leetcode.com/problems/spiral-matrix-ii/){:target="_blank"}
