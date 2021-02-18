---
layout: post
title:  "LeetCode 11. 盛水最多的容器 中等"
date:   2020-02-15 21:45:18 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers
excerpt:
  给定 n 个非负整数 a1、a2……an，其中每个代表坐标 (i, ai)。
  画 n 条垂线，使得线 i 的两个端点位于 (i, ai) 和 (i, 0)。
  找两条线，使它们与 x 轴构成的容器可以容纳最多的水。<br>
  **注：**你不能倾斜容器并且 n 至少为 2。
---
> ## 11. Container With Most Water
> 
> Given n non-negative integers a1, a2, ..., an , where each represents a point
> at coordinate (i, ai). n vertical lines are drawn such that the two endpoints
> of line i is at (i, ai) and (i, 0). Find two lines, which together with x-axis
> forms a container, such that the container contains the most water.
> 
> **Note:** You may not slant the container and n is at least 2.
> 
> ![](https://s3-lc-upload.s3.amazonaws.com/uploads/2018/07/17/question_11.jpg)
> 
> The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this
> case, the max area of water (blue section) the container can contain is 49.
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> [1,8,6,2,5,4,8,3,7]
> <strong>Output:</strong> 49
> </pre>
>
> <details>
> <summary>Hint 1</summary>
> The aim is to maximize the area formed between the vertical lines. The area of
> any container is calculated using the shorter line as length and the distance
> between the lines as the width of the rectangle.
> <pre>
> Area = length of shorter vertical line * distance between lines
> </pre>
> We can definitely get the maximum width container as the outermost lines have
> the maximum distance between them. However, this container <b>might not be the
> maximum in size</b> as one of the vertical lines of this container could be
> really short.
> <br>
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_water_trap_1.png" width="500">
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_water_trap_2.png" width="500">
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> Start with the maximum width container and go to a shorter width container if
> there is a vertical line longer than the current containers shorter line. This
> way we are compromising on the width but we are looking forward to a longer
> length container.
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
