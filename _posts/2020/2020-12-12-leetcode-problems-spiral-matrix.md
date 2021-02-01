---
layout: post
title:  "LeetCode 54. 螺旋矩阵 中等"
date:   2020-12-12 09:06:20 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array
excerpt: 给定一个 `m x n` 的`矩阵`，返回*按螺旋顺序的*`矩阵`*的所有元素*。
---
> ## 54. Spiral Matrix
> 
> Given an `m x n` `matrix`, return *all elements of the* `matrix` *in spiral
> order*.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/spiral1.jpg" style="width: 242px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,2,3],[4,5,6],[7,8,9]]
> <strong>Output:</strong> [1,2,3,6,9,8,7,4,5]
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/spiral.jpg" style="width: 322px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
> <strong>Output:</strong> [1,2,3,4,8,12,11,10,9,5,6,7]
> </pre>
> 
> **Constraints:**
> 
> * `m == matrix.length`
> * `n == matrix[i].length`
> * `1 <= m, n <= 10`
> * `-100 <= matrix[i][j] <= 100`
> 
> <details>
> <summary>Hint 1</summary>
> Well for some problems, the best way really is to come up with some algorithms
> for simulation. Basically, you need to simulate what the problem asks us to
> do.
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> We go boundary by boundary and move inwards. That is the essential operation.
> First row, last column, last row, first column and then we move inwards by 1
> and then repeat. That's all, that is all the simulation that we need.
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Think about when you want to switch the progress on one of the indexes. If you
> progress on
> <pre>i</pre>
> out of
> <pre>[i, j]</pre>
> , you'd be shifting in the same column. Similarly, by changing values for
> <pre>j</pre>
> , you'd be shifting in the same row. Also, keep track of the end of a boundary
> so that you can move inwards and then keep repeating. It's always best to run
> the simulation on edge cases like a single column or a single row to see if
> anything breaks or not.
> </details>

## 解决方案

### 方法一：按层模拟

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        if (matrix.empty() || matrix[0].empty()) return {};
        vector<int> ret;
        int left = 0, right = matrix[0].size() - 1, top = 0, bottom = matrix.size() - 1;
        while (true) {
            for (int col = left; col <= right; col++) ret.push_back(matrix[top][col]);
            if (++top > bottom) break;
            for (int row = top; row <= bottom; row++) ret.push_back(matrix[row][right]);
            if (--right < left) break;
            for (int col = right; col >= left; col--) ret.push_back(matrix[bottom][col]);
            if (--bottom < top) break;
            for (int row = bottom; row >= top; row--) ret.push_back(matrix[row][left]);
            if (++left > right) break;
        }
        return ret;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为矩阵的行数和列数，矩阵中的每个元素均访问一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Spiral Matrix - LeetCode](https://leetcode.com/problems/spiral-matrix/){:target="_blank"}
