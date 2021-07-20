---
layout: post
title:  "LeetCode 84. 柱状图中最大的矩形（困难）"
date:   2021-07-10 11:45:40 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Array Stack Monotonic-Stack
---
> 给定一个整数数组 `heights` 表示柱状图宽度为 `1` 的柱子高度，返回*柱状图中最大的矩形面积*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/histogram.jpg" style="width: 522px; height: 242px;">
> 
> **限制条件：**
> 
> * <code>1 <= heights.length <= 10<sup>5</sup></code>
> * <code>0 <= heights[i] <= 10<sup>4</sup></code>

## 解决方案

### 方法一：单调栈

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size();
        vector<int> left(n), right(n, n);
        stack<int> monoStack;
        for (int i = 0; i < n; i++) {
            while (!monoStack.empty() && heights[monoStack.top()] >= heights[i]) {
                right[monoStack.top()] = i;
                monoStack.pop();
            }
            left[i] = (monoStack.empty() ? -1 : monoStack.top());
            monoStack.push(i);
        }
        int result = 0;
        for (int i = 0; i < n; i++) {
            result = max(result, (right[i] - left[i] - 1) * heights[i]);
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。

## 参考链接

* [Largest Rectangle in Histogram - LeetCode](https://leetcode.com/problems/largest-rectangle-in-histogram/){:target="_blank"}
