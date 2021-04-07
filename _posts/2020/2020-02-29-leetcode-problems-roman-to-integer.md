---
layout: post
title:  "LeetCode 13. 罗马数字转整数（简单）"
date:   2020-02-29 19:48:34 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Math String
excerpt: 把给定的罗马数字（包含七种字符：`I`，`V`，`X`，`L`，`C`，`D` 和 `M`）转换为整数。
---
> ## 13. Roman to Integer
> 
> Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`,
> `C`, `D` and `M`.
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
> For example, two is written as `II` in Roman numeral, just two one's added
> together. Twelve is written as, `XII`, which is simply `X` + `II`. The number
> twenty seven is written as `XXVII`, which is `XX` + `V` + `II`.
> 
> Roman numerals are usually written largest to smallest from left to right.
> However, the numeral for four is not `IIII`. Instead, the number four is
> written as `IV`. Because the one is before the five we subtract it making
> four. The same principle applies to the number nine, which is written as `IX`.
> There are six instances where subtraction is used:
> 
> * `I` can be placed before `V` (5) and `X` (10) to make 4 and 9. 
> * `X` can be placed before `L` (50) and `C` (100) to make 40 and 90. 
> * `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.
> 
> Given a roman numeral, convert it to an integer. Input is guaranteed to be
> within the range from 1 to 3999.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> "III"
> <strong>Output:</strong> 3
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> "IV"
> <strong>Output:</strong> 4
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> "IX"
> <strong>Output:</strong> 9
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> "LVIII"
> <strong>Output:</strong> 58
> <strong>Explanation:</strong> L = 50, V= 5, III = 3.
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> "MCMXCIV"
> <strong>Output:</strong> 1994
> <strong>Explanation:</strong> M = 1000, CM = 900, XC = 90 and IV = 4.
> </pre>
> 
> <details>
> <summary>Hint 1</summary>
> I - 1<br>
> V - 5<br>
> X - 10<br>
> L - 50<br>
> C - 100<br>
> D - 500<br>
> M - 1000
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> <b>Rules:</b><br>
> * If I comes before V or X, subtract 1 eg: IV = 4 and IX = 9<br>
> * If X comes before L or C, subtract 10 eg: XL = 40 and XC = 90<br>
> * If C comes before D or M, subtract 100 eg: CD = 400 and CM = 900
> </details>

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
* 时间复杂度：*O*(n)。
  STL unordered_map 的查找速度为 *O*(1)，只需遍历字符串一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Roman to Integer - LeetCode](https://leetcode.com/problems/roman-to-integer/){:target="_blank"}
