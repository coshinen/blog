---
layout: post
title:  "LeetCode 42. 收集雨水 困难"
date:   2020-09-19 18:18:54 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Array Two-Pointers Stack
excerpt: 给定 n 个非负整数表示每个宽为 1 的条状高度图，计算雨后能够收集多少雨水。
---
> ## 42. Trapping Rain Water
> 
> Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it is able to trap after raining.
> 
> ![](https://assets.leetcode.com/uploads/2018/10/22/rainwatertrap.png)
> 
> The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped. **Thanks Marcos** for contributing this image!
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> [0,1,0,2,1,0,1,3,2,1,2,1]
> <strong>Output:</strong> 6
> </pre>

## 解决方案

### 方法一：暴力

每个位置能够收集雨水的高度，等于其两边最大高度的较小值与当前位置的高度差。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int result = 0;
        int size = height.size();
        for (int i = 1; i < size - 1; i++) {
            int left_max = 0, right_max = 0;
            for (int j = i; j >= 0; j--) {
                left_max = max(left_max, height[j]);
            }
            for (int j = i; j < size; j++) {
                right_max = max(right_max, height[j]);
            }
            result += min(left_max, right_max) - height[i];
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  数组中每个元素所在的位置都需要向左向右扫描。
* 空间复杂度：*O*(1)。

### 方法二：动态编程

暴力法中，每个位置的元素都要向左向右扫描，可以提前扫描一次并存储这个值，来降低时间复杂度。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int size = height.size();
        if (size == 0) return 0;
        int result = 0;
        vector<int> left_max(size), right_max(size);
        left_max[0] = height[0];
        for (int i = 1; i < size; i++) {
            left_max[i] = max(height[i], left_max[i - 1]);
        }
        right_max[size - 1] = height[size - 1];
        for (int i = size - 2; i >= 0; i--) {
            right_max[i] = max(height[i], right_max[i + 1]);
        }
        for (int i = 1; i < size - 1; i++) {
            result += min(left_max[i], right_max[i]) - height[i];
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  获取每个位置的最大高度数组，需要遍历 2 次，每次 *O*(n)。
  最后使用最大高度数组更新 result，也是 *O*(n)。
* 空间复杂度：*O*(n)。
  在暴力法的基础上多了存储最大高度的数组。

### 方法三：使用栈

使用一个单调递减的栈，储存可能形成低洼的左边界和底部。
当遇到一个比栈顶元素大的值时，把它作为低洼的右边界。
然后把栈顶元素出栈作为低洼的底部，并把新的栈顶元素作为低洼的左边界。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int result = 0, current = 0;
        stack<int> st;
        while (current < height.size()) {
            while (!st.empty() && height[current] > height[st.top()]) {
                int top = st.top();
                st.pop();
                if (st.empty()) break;
                int distance = current - st.top() - 1;
                int bounded_height = min(height[current], height[st.top()]) - height[top];
                result += distance * bounded_height;
            }
            st.push(current++);
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  只遍历了整个数组一次，每个元素出入栈最多访问 2 次。
* 空间复杂度：*O*(n)。

### 方法四：使用双指针

在动态编程中，当 right_max[i] > left_max[i] 时，积水高度由 left_max 决定。
所以相对于当前位置，当右侧存在低于左侧高度的条状时，就从反方向开始遍历数组。
反之亦然。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int left_max = 0, right_max = 0;
        int result = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                height[left] >= left_max ? (left_max = height[left]) : result += (left_max - height[left]);
                ++left;
            } else {
                height[right] >= right_max ? (right_max = height[right]) : result += (right_max - height[right]);
                --right;
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  只遍历了整个数组一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Trapping Rain Water - LeetCode](https://leetcode.com/problems/trapping-rain-water/){:target="_blank"}
