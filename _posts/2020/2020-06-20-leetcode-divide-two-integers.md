---
layout: post
title:  "LeetCode 29. 两数相除（中等）"
date:   2020-06-20 08:41:50 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Math Bit-Manipulation
---
> 给定两个整数 `dividend` 和 `divisor`，不使用乘法、除法和模运算符使两数相除。
> 
> 返回 `dividend` 除 `divisor` 后的商。
> 
> 整数除法应该向零截断，这意味着丢失其小数部分。
> 例如，`truncate(8.345) = 8` 和 `truncate(-2.7335) = -2`。
> 
> **注：**假设我们处理的环境只能存储 **32 位**有符号整数范围内的整数：<code>[-2<sup>31</sup>,  2<sup>31</sup> - 1]</code>。
> 对于该问题，假设**当除法结果溢出时**函数**返回** <code>2<sup>31</sup> - 1</code>。
> 
> **限制条件：**
> 
> * <code>-2<sup>31</sup> <= dividend, divisor <= 2<sup>31</sup> - 1</code>
> * `divisor != 0`

## 解决方案

### 方法一：初等数学

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
