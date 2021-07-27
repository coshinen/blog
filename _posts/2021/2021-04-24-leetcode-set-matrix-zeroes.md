---
layout: post
title:  "LeetCode 73. 矩阵置零（中等）"
date:   2021-04-24 20:58:04 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array
---
> 给定一个 *`m x n`* 的矩阵。
> 如果一个元素为 **0**，则设置所在行和列的所有元素为 **0**。
> [原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}置换。
> 
> **进阶：**
> 
> * 一个直观的解决方案是使用 *O*(mn) 的额外空间，但这并不是一个好主意。
> * 一个简单的改进是使用 *O*(m + n) 的额外空间，但仍不是最佳的解决方案。
> * 你能想出一个常量空间的解决方案吗？
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/08/17/mat1.jpg" style="width: 450px; height: 169px;">
> 
> **限制条件：**
> 
> * `m == matrix.length`
> * `n == matrix[0].length`
> * `1 <= m, n <= 200`
> * <code>-2<sup>31</sup> <= matrix[i][j] <= 2<sup>31</sup> - 1</code>
> 
> <details>
> <summary>提示 1</summary>
> 如果矩阵的任何单元有一个零，我们可以使用额外的内存来记录它的行数和列数。
> 但如果你不想使用额外的内存，那么你可以操作数组来代替。
> 即精准模拟问题所说的。
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 在迭代时把单元设置为零可能会导致差异。
> 如果使用其他整数值作为标记呢？
> 对于 0(1) 空间的问题仍有更好的方法。
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 我们可以使用 2 个 set 来保存需要设置为零的行/列的记录。
> 但对于一个 O(1) 空间的解决方案，可以使用一行或一列来跟踪该信息。
> </details>
> 
> <details>
> <summary>提示 4</summary>
> 我们可以使用每一行和每一列的第一个单元作为标志。
> 该标志将确定行或列是否已设置为零。
> </details>

## 解决方案

### 方法一：标记数组

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();
        vector<int> row(m), col(n);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) row[i] = col[j] = true;
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (row[i] != 0 || col[j] != 0) matrix[i][j] = 0;
            }
        }
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为矩阵的行数和列数。
  需遍历矩阵两次。
* 空间复杂度：*O*(m + n)。
  记录某行或某列是否出现零的标记数组的大小。

## 参考链接

* [Set Matrix Zeroes - LeetCode](https://leetcode.com/problems/set-matrix-zeroes/){:target="_blank"}
