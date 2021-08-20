---
layout: post
title:  "LeetCode 7. 整数反转（简单）"
date:   2020-01-18 19:10:18 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Math
---
> 给定一个有符号的 32 位整数 `x`，返回反转其数字后的 `x`。
> 如果反转 `x` 导致值超出有符号 32 位整数的范围 <code>[-2<sup>31</sup>, 2<sup>31</sup> - 1]</code>，则返回 `0`。
> 
> **假设环境不允许存储 64 位整数（有符号或无符号）。**
> 
> **限制条件：**
> 
> * <code>-2<sup>31</sup> <= x <= 2<sup>31</sup> - 1</code>

## 解决方案

### 方法一：弹出并推入数字 & 溢出前检查

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
