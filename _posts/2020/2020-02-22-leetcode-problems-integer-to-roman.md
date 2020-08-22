---
layout: post
title:  "LeetCode 12. 整数转罗马数字 中等"
date:   2020-02-22 20:23:04 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Math String
excerpt: 把给定的整数转换为罗马数字（包含七种字符：`I`，`V`，`X`，`L`，`C`，`D` 和 `M`）。
---
> ## 12. Integer to Roman | Medium
> 
> Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.
> 
> <pre>
> Symbol       Value
> I             1
> V             5
> X             10
> L             50
> C             100
> D             500
> M             1000
> </pre>
> 
> For example, two is written as `II` in Roman numeral, just two one's added together. Twelve is written as, `XII`, which is simply `X` + `II`. The number twenty seven is written as `XXVII`, which is `XX` + `V` + `II`.
> 
> Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`. There are six instances where subtraction is used:
> 
> * `I` can be placed before `V` (5) and `X` (10) to make 4 and 9. 
> * `X` can be placed before `L` (50) and `C` (100) to make 40 and 90. 
> * `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.
> 
> Given an integer, convert it to a roman numeral. Input is guaranteed to be within the range from 1 to 3999.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> 3
> <strong>Output:</strong> "III"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> 4
> <strong>Output:</strong> "IV"
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> 9
> <strong>Output:</strong> "IX"
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> 58
> <strong>Output:</strong> "LVIII"
> <strong>Explanation:</strong> L = 50, V = 5, III = 3.
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> 1994
> <strong>Output:</strong> "MCMXCIV"
> <strong>Explanation:</strong> M = 1000, CM = 900, XC = 90 and IV = 4.
> </pre>

## 解决方案

### 方法一：贪心（Greedy）

以阿拉伯数字表示的整数作为 Key 从大到小构建哈希表，对应的 Value 为罗马数字。

Nums | Roman
-----|------
1000 | M
900  | CM
500  | D
400  | CD
100  | C
90   | XC
50   | L
40   | XL
10   | X
9    | IX
5    | V
4    | IV
1    | I

遍历该哈希表，依次使用最大的数所对应的罗马数字来表示。

```cpp
class Solution {
public:
    string intToRoman(int num) {
        int nums[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        string romans[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        string result;
        for (int i = 0; i < 13; i++) {
            while (num >= nums[i]) {
                num -= nums[i];
                result += romans[i];
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Integer to Roman - LeetCode](https://leetcode.com/problems/integer-to-roman/){:target="_blank"}
