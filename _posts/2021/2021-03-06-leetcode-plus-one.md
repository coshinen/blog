---
layout: post
title:  "LeetCode 66. 加一（简单）"
date:   2021-03-06 20:16:54 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array
---
> 给定一个由整数组成的**非空**数组所表示的一个非负整数，在该整数的基础上加一。
> 
> 最高位数字存放在列表的头部，并且数组中每个元素只存储单个数字。
> 
> 你可以假设整数不含任何前导零，除了数字 0 本身。
> 
> **限制条件：**
> 
> * `1 <= digits.length <= 100`
> * `0 <= digits[i] <= 9`

## 解决方案

### 方法一：初等数学

```cpp
class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = digits.size() - 1; i >= 0; i--) {
            digits[i] = (digits[i] + 1) % 10;
            if (digits[i] != 0) return digits;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为输入数字的位数，最多只需遍历一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Plus One - LeetCode](https://leetcode.com/problems/plus-one/){:target="_blank"}
