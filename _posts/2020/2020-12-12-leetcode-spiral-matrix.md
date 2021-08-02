---
layout: post
title:  "LeetCode 54. 螺旋矩阵（中等）"
date:   2020-12-12 09:06:20 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array
---
> 给定一个 `m x n` 的`矩阵`，返回*按螺旋顺序的*`矩阵`*的所有元素*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/spiral.jpg" style="width: 322px; height: 242px;">
> 
> **限制条件：**
> 
> * `m == matrix.length`
> * `n == matrix[i].length`
> * `1 <= m, n <= 10`
> * `-100 <= matrix[i][j] <= 100`
> 
> <details>
> <summary>提示 1</summary>
> 对于某些问题，最好的方法就是提出一些模拟算法。
> 基本上，你需要模拟问题问问我们要做什么。
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 我们一个边界接一个边界向内移动。
> 这是最基本的操作。
> 第一行，最后一列，最后一行，第一列，然后我们向内移动 1 格并重复。
> 这就是我们需要的全部模拟。
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 请考虑什么时候切换其中一个索引的进度。
> 如果你继续前进
> <pre>i</pre>
> 在下面的范围中
> <pre>[i, j]</pre>
> ，你将在同一列中切换。
> 类似的，通过更改
> <pre>j</pre>
> ，你将在同一行中切换。
> 此外，请跟踪边界的端点，以便向内移动，然后继续重复。
> 最好在边缘情况下运行模拟，如单列或单行，以查看是否又任何中断。
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
