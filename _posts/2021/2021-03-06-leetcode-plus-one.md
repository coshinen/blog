---
layout: post
title:  "LeetCode 66. 加一（简单）"
date:   2021-03-06 20:16:54 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array
excerpt:
  给定一个由整数组成的**非空**数组所表示的一个非负整数，在该整数的基础上加一。<br>
  最高位数字存放在列表的头部，并且数组中每个元素只存储单个数字。<br>
  你可以假设整数不含任何前导零，除了数字 0 本身。
---
> ## 66. Plus One
> 
> Given a **non-empty** array of decimal digits representing a non-negative
> integer, increment one to the integer.
> 
> The digits are stored such that the most significant digit is at the head of
> the list, and each element in the array contains a single digit.
> 
> You may assume the integer does not contain any leading zero, except the
> number 0 itself.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> digits = [1,2,3]
> <strong>Output:</strong> [1,2,4]
> <strong>Explanation:</strong> The array represents the integer 123.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> digits = [4,3,2,1]
> <strong>Output:</strong> [4,3,2,2]
> <strong>Explanation:</strong> The array represents the integer 4321.
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> digits = [0]
> <strong>Output:</strong> [1]
> </pre>
> 
> **Constraints:**
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
