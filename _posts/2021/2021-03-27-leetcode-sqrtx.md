---
layout: post
title:  "LeetCode 69. Sqrt(x)（简单）"
date:   2021-03-27 08:32:01 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Math Binary-Search
---
> 给定一个非负整数 `x`，计算并返回 *`x` 的平方根*。
> 
> 由于返回类型是整数，返回结果**去掉**小数部分，只保留**整数部分**。
> 
> **限制条件：**
> 
> * <code>0 <= x <= 2<sup>31</sup> - 1</code>
> 
> <details>
> <summary>提示 1</summary>
> 尝试探索所有整数。(Credits: @annujoshi)
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 使用整数的排序属性来减少搜索空间。(Credits: @annujoshi)
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
