---
layout: post
title:  "LeetCode 29. 两数相除 中等"
date:   2020-06-20 08:41:50 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Math Binary-Search
excerpt: 给定被除数 `dividend` 和除数 `divisor` 两个整数，不使用乘法、除法和 mod 运算符使两数相除。
---
> ## 29. Divide Two Integers
> 
> Given two integers `dividend` and `divisor`, divide two integers without using multiplication, division and mod operator.
> 
> Return the quotient after dividing `dividend` by `divisor`.
> 
> The integer division should truncate toward zero, which means losing its fractional part. For example, `truncate(8.345) = 8` and `truncate(-2.7335) = -2`.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> dividend = 10, divisor = 3
> <strong>Output:</strong> 3
> <strong>Explanation:</strong> 10/3 = truncate(3.33333..) = 3.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> dividend = 7, divisor = -3
> <strong>Output:</strong> -2
> <strong>Explanation:</strong> 7/-3 = truncate(-2.33333..) = -2.
> </pre>
> 
> **Note:**
> 
> * Both dividend and divisor will be 32-bit signed integers.
> * The divisor will never be 0.
> * Assume we are dealing with an environment which could only store integers within the 32-bit signed integer range: [−2<sup>31</sup>,  2<sup>31</sup> − 1]. For the purpose of this problem, assume that your function **returns 2<sup>31</sup> − 1 when the division result overflows**.

## 解决方案

### 方法一：初等数学（Elementary Math）

利用对数公式 log<sub>e</sub>(a / b) = log<sub>e</sub>a - log<sub>e</sub>b 把除法转换为减法。

> 公式推导：
> 
> 令 x = log<sub>e</sub>a, y = log<sub>e</sub>b, z = log<sub>e</sub>(a / b)
> 
> 则 e<sup>x</sup> = a, e<sup>y</sup> = b, e<sup>z</sup> = a / b = e<sup>x</sup> / e<sup>y</sup> = e<sup>(x - y)</sup>, z = x - y
> 
> 即 log<sub>e</sub>(a / b) = log<sub>e</sub>a - log<sub>e</sub>b

最终得出 a / b = e<sup>(log<sub>e</sub>a - log<sub>e</sub>b)</sup>。

```cpp
class Solution {
public:
    int divide(int dividend, int divisor) {
        if (divisor == 0 || dividend == INT_MIN && divisor == -1) return INT_MAX;
        int sign = ((dividend >> 31)^(divisor >> 31)) == 0 ? 1 : -1;
        long a = abs((long)dividend);
        long b = abs((long)divisor);
        double result = exp(log(a) - log(b));
        return (int)(sign * result);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Divide Two Integers - LeetCode](https://leetcode.com/problems/divide-two-integers/){:target="_blank"}
