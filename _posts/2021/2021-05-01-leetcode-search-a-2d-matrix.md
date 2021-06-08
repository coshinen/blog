---
layout: post
title:  "LeetCode 74. 搜索二维矩阵（中等）"
date:   2021-05-01 09:32:16 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Binary-Search
excerpt:
  写一个高效的算法在 `m x n` 的矩阵中搜索目标值。
  这个矩阵有下面的特性：<br>
  * 每行里的整数从左到右升序排列。<br>
  * 每行的首个整数大于上一行的最后一个整数。
---
> ## 74. Search a 2D Matrix
> 
> Write an efficient algorithm that searches for a value in an `m x n` matrix.
> This matrix has the following properties:
> 
> * Integers in each row are sorted from left to right.
> * The first integer of each row is greater than the last integer of the
> previous row.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/05/mat.jpg" style="width: 322px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
> <strong>Output:</strong> true
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/05/mat2.jpg" style="width: 322px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
> <strong>Output:</strong> false
> </pre>
> 
> **Constraints:**
> 
> * `m == matrix.length`
> * `n == matrix[i].length`
> * `1 <= m, n <= 100`
> * <code>-10<sup>4</sup> <= matrix[i][j], target <= 10<sup>4</sup></code>

## 解决方案

### 方法一：二分查找

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int low = 0, high = m * n - 1;
        while (low <= high) {
            int mid = (high - low) / 2 + low;
            int x = matrix[mid / n][mid % n];
            if (x < target) {
                low = mid + 1;
            } else if (x > target) {
                high = mid - 1;
            } else {
                return true;
            }
        }
        return false;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(logmn)。
  m 和 n 分别为矩阵的行和列数。
* 空间复杂度：*O*(1)。

## 参考链接

* [Search a 2D Matrix - LeetCode](https://leetcode.com/problems/search-a-2d-matrix/){:target="_blank"}
