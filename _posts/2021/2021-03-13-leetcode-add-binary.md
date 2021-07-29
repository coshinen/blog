---
layout: post
title:  "LeetCode 67. 加二进制（简单）"
date:   2021-03-13 08:08:07 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Math String
---
> 给定两个二进制字符串 `a` 和 `b`，返回*用一个二进制字符串表示的它们的和*。
> 
> **限制条件：**
> 
> * <code>1 <= a.length, b.length <= 10<sup>4</sup></code>
> * `a` 和 `b` 只由 `'0'` 或 `'1'` 字符组成。
> * 每个字符串不包含前导零，除了零本身。

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
