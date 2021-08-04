---
layout: post
title:  "LeetCode 48. 旋转图像（中等）"
date:   2020-10-31 07:51:42 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array
---
> 给定一个 *n* x *n* 的二维`矩阵`表示一个图像，旋转该图像 90 度（顺时针）。
> 
> 你必须原地旋转图片，这意味着你必须直接修改输入的 2D 矩阵。
> **不要**分配另一个 2D 矩阵然后做旋转。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/08/28/mat1.jpg" style="width: 642px; height: 242px;">
> 
> **限制条件：**
> 
> * `matrix.length == n`
> * `matrix[i].length == n`
> * `1 <= n <= 20`
> * `-1000 <= matrix[i][j] <= 1000`

## 解决方案

### 方法一：先转置再翻转

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int tmp = matrix[j][i];
                matrix[j][i] = matrix[i][j];
                matrix[i][j] = tmp;
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n / 2; j++) {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[i][n - j - 1];
                matrix[i][n - j - 1] = tmp;
            }
        }
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
* 空间复杂度：*O*(1)。
  原地翻转矩形，只借助了一个临时变量 `tmp`。

## 参考链接

* [Rotate Image - LeetCode](https://leetcode.com/problems/rotate-image/){:target="_blank"}
