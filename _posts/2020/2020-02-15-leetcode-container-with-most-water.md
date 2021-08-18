---
layout: post
title:  "LeetCode 11. 盛水最多的容器（中等）"
date:   2020-02-15 21:45:18 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers Greedy
---
> 给定 `n` 个非负整数 `a1, a2, ..., an`，其中每个表示坐标 `(i, ai)` 处的一个点。
> 画 `n` 条垂线，使线 `i` 的两个端点位于 `(i, ai)` 和 `(i, 0)`。
> 找到两条线，与 x 轴一起构成一个容器，使其容纳最多的水。
> 
> **注意**你不能倾斜容器。
> 
> ![](https://s3-lc-upload.s3.amazonaws.com/uploads/2018/07/17/question_11.jpg)
> 
> **限制条件：**
> 
> * `n == height.length`
> * <code>2 <= n <= 10<sup>5</sup></code>
> * <code>0 <= height[i] <= 10<sup>4</sup></code>
> 
> <details>
> <summary>提示 1</summary>
> 目的是使垂直线之间形成的面积最大化。
> 任何容器的面积都是使用比较短的直线作为长度，直线间的距离作为矩形的宽度来计算的。
> <pre>
> 面积 = 较短垂直线的长度 * 线之间的距离
> </pre>
> 我们可以确定容器的最大宽度，因为最外面的线之间的距离最大。
> 但是，该容器的<b>大小可能不是最大的</b>，因此容器的一条垂直线可能非常短。
> 
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_water_trap_1.png" width="500">
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_water_trap_2.png" width="500">
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 从最大宽度的容器开始，如果有一条垂直线比当前容器的较短线长，则跳转到较短宽度的容器。
> 这样我么在宽度上有所妥协，但我们期待一个更长长度的容器。
> </details>

## 解决方案

### 方法一：暴力

遍历并求出每组线段与 x 轴组成的矩形的面积，比较得出最大值。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int maxarea = 0;
        for (int i = 0; i < height.size(); i++) {
            for (int j = i + 1; j < height.size(); j++) {
                maxarea = max(maxarea, min(height[i], height[j]) * (j - i));
            }
        }
        return maxarea;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  共 n * (n - 1) / 2 种组合。
* 空间复杂度：*O*(1)。

### 方法二：双指针

选取最外面的两条线段作为容器的高，并求出与 x 轴组成矩形的面积，不断交替向中间靠拢，直至左右相遇得到最大值。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int maxarea = 0, left = 0, right = height.size() - 1;
        while (left <= right) {
            maxarea = max(maxarea, min(height[left], height[right]) * (right - left));
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxarea;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  只需扫描一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Container With Most Water - LeetCode](https://leetcode.com/problems/container-with-most-water/){:target="_blank"}
