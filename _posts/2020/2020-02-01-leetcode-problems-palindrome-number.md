---
layout: post
title:  "LeetCode 9. 回文数 简单"
date:   2020-02-01 10:09:21 +0800
author: mistydew
comments: true
categories: LeetCode
tags: LeetCode
excerpt: 判断一个整数是否为回文数。
---
## 9. Palindrome Number | Easy

> Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.
> 
> **Example 1:**
> 
> **Input:** 121<br>
> **Output:** true
> 
> **Example 2:**
> 
> **Input:** -121<br>
> **Output:** false<br>
> **Explanation:** From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
> 
> **Example 3:**
> 
> **Input:** 10<br>
> **Output:** false<br>
> **Explanation:** Reads 01 from right to left. Therefore it is not a palindrome.
> 
> **Follow up:**
> 
> Coud you solve it without converting the integer to a string?
> 
> Hint 1:
> 
> Beware of overflow when you reverse the integer.

## 问题分析

判断一个整数是否为回文数。
回文数是指从左到右和从右到左读都是一样的整数。

## 解决方案

### 方法一：反转一半数字（Revert half of the number）

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
* 时间复杂度：_O_(ln(n))，每次迭代都会把输入除以 10。
* 空间复杂度：_O_(1)。

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
* 时间复杂度：_O_(1)，参考 STL 底层实现。
* 空间复杂度：_O_(1)。

## 参考链接

* [Palindrome Number - LeetCode](https://leetcode.com/problems/palindrome-number/){:target="_blank"}
* [mistydew/leetcode](https://github.com/mistydew/leetcode){:target="_blank"}
