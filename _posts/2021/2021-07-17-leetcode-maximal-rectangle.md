---
layout: post
title:  "LeetCode 85. 最大矩形（困难）"
date:   2021-07-17 20:04:42 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Array Dynamic-Programming Stack Matrix Monotonic-Stack
excerpt:
  给定一个只含 `0` 和 `1` 的 `rows x cols` 二进制矩阵 `matrix`，找到只包含 `1` 的最大的矩形并返回*其面积*。
---
> ## 85. Maximal Rectangle
> 
> Given a `rows x cols` binary `matrix` filled with `0`'s and `1`'s, find the
> largest rectangle containing only `1`'s and return *its area*.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/09/14/maximal.jpg" style="width: 402px; height: 322px;">
> 
> <pre>
> <strong>Input:</strong> matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]
> <strong>Output:</strong> 6
> <strong>Explanation:</strong> The maximal rectangle is shown in the above picture.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> matrix = []
> <strong>Output:</strong> 0
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> matrix = [["0"]]
> <strong>Output:</strong> 0
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> matrix = [["1"]]
> <strong>Output:</strong> 1
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> matrix = [["0","0"]]
> <strong>Output:</strong> 0
> </pre>
> 
> **Constraints:**
> 
> * `rows == matrix.length`
> * `cols == matrix[i].length`
> * `0 <= row, cols <= 200`
> * `matrix[i][j]` is `'0'` or `'1'`.

## 解决方案

### 方法一：单调栈

```cpp
class Solution {
public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        int m = matrix.size();
        if (m == 0) return 0;
        int n = matrix[0].size();
        vector<vector<int>> left(m, vector<int>(n, 0));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == '1') left[i][j] = (j == 0 ? 0 : left[i][j - 1]) + 1;
            }
        }
        int ret = 0;
        for (int j = 0; j < n; j++) {
            vector<int> up(m, 0), down(m, 0);
            stack<int> stk;
            for (int i = 0; i < m; i++) {
                while (!stk.empty() && left[stk.top()][j] >= left[i][j]) stk.pop();
                up[i] = stk.empty() ? -1 : stk.top();
                stk.push(i);
            }
            stk = stack<int>();
            for (int i = m - 1; i >= 0; i--) {
                while (!stk.empty() && left[stk.top()][j] >= left[i][j]) stk.pop();
                down[i] = stk.empty() ? m : stk.top();
                stk.push(i);
            }
            for (int i = 0; i < m; i++) {
                int height = down[i] - up[i] - 1;
                int area = height * left[i][j];
                ret = max(ret, area);
            }
        }
        return ret;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为矩阵的长和宽。
* 空间复杂度：*O*(mn)。

## 参考链接

* [Maximal Rectangle - LeetCode](https://leetcode.com/problems/maximal-rectangle/){:target="_blank"}
