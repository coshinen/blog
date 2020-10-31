---
layout: post
title:  "LeetCode 48. 旋转图像 中等"
date:   2020-10-31 07:51:42 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array
excerpt: 给定一个 *n* x *n* 的二维`矩阵`表示一个图像，旋转该图像 90 度（顺时针）。
---
> ## 48. Rotate Image
> 
> You are given an *n* x *n* 2D `matrix` representing an image, rotate the image by 90 degrees (clockwise).
> 
> You have to rotate the image [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}, which means you have to modify the input 2D matrix directly. **DO NOT** allocate another 2D matrix and do the rotation.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/08/28/mat1.jpg" style="width: 642px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,2,3],[4,5,6],[7,8,9]]
> <strong>Output:</strong> [[7,4,1],[8,5,2],[9,6,3]]
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/08/28/mat2.jpg" style="width: 800px; height: 321px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
> <strong>Output:</strong> [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> matrix = [[1]]
> <strong>Output:</strong> [[1]]
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,2],[3,4]]
> <strong>Output:</strong> [[3,1],[4,2]]
> </pre>
>  
> **Constraints:**
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
