---
layout: post
title:  "LeetCode 67. 加二进制（简单）"
date:   2021-03-13 08:08:07 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Math String
excerpt: 给定两个二进制字符串 `a` 和 `b`，返回*用一个二进制字符串表示的它们的和*。
---
> ## 67. Add Binary
> 
> Given two binary strings `a` and `b`, return *their sum as a binary string*.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> a = "11", b = "1"
> <strong>Output:</strong> "100"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> a = "1010", b = "1011"
> <strong>Output:</strong> "10101"
> </pre>
> 
> **Constraints:**
> 
> * <code>1 <= a.length, b.length <= 10<sup>4</sup></code>
> * `a` and b consist only of `'0'` or `'1'` characters.
> * Each string does not contain leading zeros except for the zero itself.

## 解决方案

### 方法一：模拟

```cpp
class Solution {
public:
    string addBinary(string a, string b) {
        string str;
        int carry = 0;
        for (int i = a.size() - 1, j = b.size() -1; i >= 0 || j >= 0 || carry; i--, j--) {
            int x = i < 0 ? 0 : a[i] - '0';
            int y = j < 0 ? 0 : b[j] - '0';
            int sum = (x + y + carry) % 2;
            carry = (x + y + carry) / 2;
            str.insert(0, 1, sum + '0');
        }
        return str;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  只需要遍历二进制字符串 `a` 和 `b` 一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Add Binary - LeetCode](https://leetcode.com/problems/add-binary/){:target="_blank"}
