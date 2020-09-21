---
layout: post
title:  "LeetCode 7. 整数反转 简单"
date:   2020-01-18 19:10:18 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Math
excerpt: 给定一个 32 位的有符号整数，反转该整数每个位上的数字。
---
> ## 7. Reverse Integer
> 
> Given a 32-bit signed integer, reverse digits of an integer.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> 123
> <strong>Output:</strong> 321
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> -123<br>
> <strong>Output:</strong> -321
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> 120<br>
> <strong>Output:</strong> 21
> </pre>
> 
> **Note:**<br>
> Assume we are dealing with an environment which could only store integers within the 32-bit signed integer range: [−2<sup>31</sup>,  2<sup>31</sup> − 1]. For the purpose of this problem, assume that your function returns 0 when the reversed integer overflows.

## 解决方案

### 方法一：弹出并推入数字 & 溢出前检查（Pop and Push Digits & Check before Overflow）

利用栈，和反转字符串的方法类似。
反复弹出 x 的最后一位数字，并推入 rev 里得到结果。

不使用辅助栈（数组）弹出并推入数字，使用以下方法。

```cpp
// 出栈操作
pop = x % 10;
x /= 10;

// 入栈操作
temp = rev * 10 + pop; // 可能溢出，需要提前检查
rev = temp;
```

这里需要对可能发生的溢出进行提前处理。
1. 如果 temp = rev * 10 + pop 发生溢出，那么一定有 rev >= INTMAX / 10。
2. 如果 rev > INTMAX / 10，那么 temp = rev * 10 + pop 一定会溢出。
3. 如果 rev == INTMAX / 10，那么当 pop > 7 时，temp = rev * 10 + pop 就会溢出。

```cpp
class Solution {
public:
    int reverse(int x) {
        int rev = 0;
        while (x != 0) {
            int pop = x % 10;
            x /= 10;
            if (rev > INT_MAX / 10 || (rev == INT_MAX / 10 && pop > 7)) return 0;
            if (rev < INT_MIN / 10 || (rev == INT_MIN / 10 && pop < -8)) return 0;
            rev = rev * 10 + pop;
        }
        return rev;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(log(x))。
  x 中约有 lg(x) 位数字。
* 空间复杂度：*O*(1)。

## 参考链接

* [Reverse Integer - LeetCode](https://leetcode.com/problems/reverse-integer/){:target="_blank"}
