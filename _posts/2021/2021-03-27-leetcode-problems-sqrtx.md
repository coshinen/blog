---
layout: post
title:  "LeetCode 69. Sqrt(x)（简单）"
date:   2021-03-27 08:32:01 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Math Binary-Search
excerpt:
  给定一个非负整数 `x`，计算并返回 *`x` 的平方根*。<br>
  由于返回类型是整数，返回结果**去掉**小数部分，只保留**整数部分**。
---
> ## 69. Sqrt(x)
> 
> Given a non-negative integer `x`, compute and return *the square root of `x`*.
> 
> Since the return type is an integer, the decimal digits are **truncated**, and
> only **the integer part** of the result is returned.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> x = 4
> <strong>Output:</strong> 2
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> x = 8
> <strong>Output:</strong> 2
> <strong>Explanation:</strong> The square root of 8 is 2.82842..., and since the decimal part is truncated, 2 is returned.
> </pre>
> 
> **Constraints:**
> 
> * <code>0 <= x <= 2<sup>31</sup> - 1</code>
> 
> <details>
> <summary>Hint 1</summary>
> Try exploring all integers. (Credits: @annujoshi)
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> Use the sorted property of integers to reduced the search space. (Credits:
> @annujoshi)
> </details>

## 解决方案

### 方法一：二分查找

```cpp
class Solution {
public:
    int mySqrt(int x) {
        int left = 0, right = x, result = 0;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if ((long long)mid * mid <= x) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(logx)。
  二分查找的次数。
* 空间复杂度：*O*(1)。

## 参考链接

* [Sqrt(x) - LeetCode](https://leetcode.com/problems/sqrtx/){:target="_blank"}
