---
layout: post
title:  "LeetCode 73. 矩阵置零（中等）"
date:   2021-04-24 20:58:04 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array
excerpt:
  给定一个 *`m x n`* 的矩阵。
  如果一个元素为 **0**，则设置所在行和列的所有元素为 **0**。
  [原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}置换。<br>
  **进阶：**<br>
  * 一个直观的解决方案是使用 *O*(mn) 的额外空间，但这并不是一个好主意。<br>
  * 一个简单的改进是使用 *O*(m + n) 的额外空间，但仍不是最佳的解决方案。<br>
  * 你能想出一个常量空间的解决方案吗？
---
> ## 73. Set Matrix Zeroes
> 
> Given an *`m x n`* matrix. If an element is **0**, set its entire row and
> column to **0**. Do it [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}.
> 
> **Follow up:**
> 
> * A straight forward solution using *O*(mn) space is probably a bad idea.
> * A simple improvement uses *O*(m + n) space, but still not the best solution.
> * Could you devise a constant space solution?
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/08/17/mat1.jpg" style="width: 450px; height: 169px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[1,1,1],[1,0,1],[1,1,1]]
> <strong>Output:</strong> [[1,0,1],[0,0,0],[1,0,1]]
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/08/17/mat2.jpg" style="width: 450px; height: 137px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]
> <strong>Output:</strong> [[0,0,0,0],[0,4,5,0],[0,3,1,0]]
> </pre>
> 
> **Constraints:**
> 
> * `m == matrix.length`
> * `n == matrix[0].length`
> * `1 <= m, n <= 200`
> * <code>-2<sup>31</sup> <= matrix[i][j] <= 2<sup>31</sup> - 1</code>
> 
> <details>
> <summary>Hint 1</summary>
> If any cell of the matrix has a zero we can record its row and column number
> using additional memory. But if you don't want to use extra memory then you
> can manipulate the array instead. i.e. simulating exactly what the question
> says.
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> Setting cell values to zero on the fly while iterating might lead to
> discrepancies. What if you use some other integer value as your marker? There
> is still a better approach for this problem with 0(1) space.
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> We could have used 2 sets to keep a record of rows/columns which need to be
> set to zero. But for an O(1) space solution, you can use one of the rows and
> and one of the columns to keep track of this information.
> </details>
> 
> <details>
> <summary>Hint 4</summary>
> We can use the first cell of every row and column as a flag. This flag would
> determine whether a row or column has been set to zero.
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
