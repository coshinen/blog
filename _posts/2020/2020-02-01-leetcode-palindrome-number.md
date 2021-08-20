---
layout: post
title:  "LeetCode 9. 回文数（简单）"
date:   2020-02-01 10:09:21 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Math
---
> 给定一个整数 `x`，如果 `x` 为回文整数则返回 `true`。
> 
> 当一个整数正着读和反着读一样时就是**回文**。
> 例如，`121` 是回文而 `123` 不是。
> 
> **限制条件：**
> 
> * <code>-2<sup>31</sup> <= x <= 2<sup>31</sup> - 1</code>
> 
> **进阶：**你能在不把整数转换成字符串的情况下解决该问题吗？
> 
> <details>
> <summary>提示 1</summary>
> 反转整数时要小心溢出。
> </details>

## 解决方案

### 方法一：反转一半数字

回文数是指从左到右和从右到左读都是一样的整数。

1. 负整数不是回文数，因为回文数一定是自然数（正整数和 0 的集合）。
2. 个位数为 0 的正整数不是回文数，因为最高位非 0。
3. 长度为奇数的数字，中位数不影响回文数的判断，因为自己总是等于自己。

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        int revertedNumber = 0;
        while (x > revertedNumber) {
            revertedNumber = revertedNumber * 10 + x % 10;
            x /= 10;
        }
        return x == revertedNumber || x == revertedNumber / 10;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(ln(n))。
  每次迭代都会把输入除以 10。
* 空间复杂度：*O*(1)。

### 方法二：使用 STL 字符串

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        ostringstream oss;
        oss << x;
        string str1, str2;
        str1 = oss.str();
        str2 = oss.str();
        reverse(str1.begin(), str1.end());
        if (str1 == str2) {
            return true;
        } else {
            return false;
        }
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Palindrome Number - LeetCode](https://leetcode.com/problems/palindrome-number/){:target="_blank"}
