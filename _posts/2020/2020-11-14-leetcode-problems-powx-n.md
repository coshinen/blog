---
layout: post
title:  "LeetCode 50. Pow(x, n) 中等"
date:   2020-11-14 20:00:12 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Math Binary-Search
excerpt: 实现 [pow(*x*, *n*)](http://www.cplusplus.com/reference/valarray/pow/){:target="_blank"}，计算 *x* 的 *n* 次幂（即 x<sup>n</sup>）。
---
> ## 50. Pow(x, n)
> 
> Implement [pow(*x*, *n*)](http://www.cplusplus.com/reference/valarray/pow/){:target="_blank"},
> which calculates *x* raised to the power *n* (i.e. x<sup>n</sup>).
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> x = 2.00000, n = 10
> <strong>Output:</strong> 1024.00000
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> x = 2.10000, n = 3
> <strong>Output:</strong> 9.26100
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> x = 2.00000, n = -2
> <strong>Output:</strong> 0.25000
> <strong>Explanation:</strong> 2<sup>-2</sup> = 1/2<sup>2</sup> = 1/4 = 0.25
> </pre>
> 
> **Constraints:**
> 
> * `-100.0 < x < 100.0`
> * <code>-2<sup>31</sup> <= n <= 2<sup>31</sup>-1</code>
> * <code>-10<sup>4</sup> <= x<sup>n</sup> <= 10<sup>4</sup></code>

## 解决方案

### 方法一：快速幂+递归

```cpp
class Solution {
public:
    double myPow(double x, long n) {
        if (n == 0) return 1.0;
        if (n < 0) return 1.0 / myPow(x, -n);
        double half = myPow(x, n / 2);
        return half * half * (n & 1 ? x : 1);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(logn)。
  递归层数。
* 空间复杂度：*O*(logn)。

## 参考链接

* [Pow(x, n) - LeetCode](https://leetcode.com/problems/powx-n/){:target="_blank"}
