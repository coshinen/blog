---
layout: post
title:  "LeetCode 13. 罗马数字转整数 简单"
date:   2020-02-29 19:48:34 +0800
author: mistydew
comments: true
categories: 力扣题解
tags: LeetCode
excerpt: 把给定的罗马数字（包含七种字符：`I`，`V`，`X`，`L`，`C`，`D`和`M`）转换为整数。
---
## 13. Roman to Integer | Easy

> Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.
> 
> ```
> Symbol       Value
> I             1
> V             5
> X             10
> L             50
> C             100
> D             500
> M             1000
> ```
> 
> For example, two is written as `II` in Roman numeral, just two one's added together. Twelve is written as, `XII`, which is simply `X` + `II`. The number twenty seven is written as `XXVII`, which is `XX` + `V` + `II`.
> 
> Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`. There are six instances where subtraction is used:
> 
> * `I` can be placed before `V` (5) and `X` (10) to make 4 and 9. 
> * `X` can be placed before `L` (50) and `C` (100) to make 40 and 90. 
> * `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.
> 
> Given a roman numeral, convert it to an integer. Input is guaranteed to be within the range from 1 to 3999.
> 
> **Example 1:**
> 
> **Input:** "III"<br>
> **Output:** 3
> 
> **Example 2:**
> 
> **Input:** "IV"<br>
> **Output:** 4
> 
> **Example 3:**
> 
> **Input:** "IX"<br>
> **Output:** 9
> 
> **Example 4:**
> 
> **Input:** "LVIII"<br>
> **Output:** 58<br>
> **Explanation:** L = 50, V= 5, III = 3.
> 
> **Example 5:**
> 
> **Input:** "MCMXCIV"<br>
> **Output:** 1994<br>
> **Explanation:** M = 1000, CM = 900, XC = 90 and IV = 4.
> 
> Hint 1
> 
> I - 1<br>
> V - 5<br>
> X - 10<br>
> L - 50<br>
> C - 100<br>
> D - 500<br>
> M - 1000
> 
> Hint 2
> 
> **Rules:**
> * If I comes before V or X, subtract 1 eg: IV = 4 and IX = 9
> * If X comes before L or C, subtract 10 eg: XL = 40 and XC = 90
> * If C comes before D or M, subtract 100 eg: CD = 400 and CM = 900

## 问题分析

把给定的罗马数字（包含七种字符：`I`，`V`，`X`，`L`，`C`，`D`和`M`）转换为整数。

## 解决方案

### 方法一：使用 STL 哈希表

```cpp
class Solution {
public:
    int romanToInt(string s) {
        unordered_map<string, int> umap = {
            {"I", 1},
            {"IV", 3},
            {"IX", 8},
            {"V", 5},
            {"X", 10},
            {"XL", 30},
            {"XC", 80},
            {"L", 50},
            {"C", 100},
            {"CD", 300},
            {"CM", 800},
            {"D", 500},
            {"M", 1000}
        };
        int result = umap[s.substr(0, 1)];
        for (int i = 1; i < s.size(); i++) {
            string two = s.substr(i - 1, 2);
            string one = s.substr(i, 1);
            result += umap[two] ? umap[two] : umap[one];
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，STL unordered_map 的查找速度为 _O_(1)，只需遍历字符串一次。
* 空间复杂度：_O_(1)。

## 参考链接

* [Roman to Integer - LeetCode](https://leetcode.com/problems/roman-to-integer/){:target="_blank"}
* [mistydew/leetcode](https://github.com/mistydew/leetcode){:target="_blank"}
