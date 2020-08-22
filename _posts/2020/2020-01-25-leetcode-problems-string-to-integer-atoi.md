---
layout: post
title:  "LeetCode 8. 字符串转整数 (atoi) 中等"
date:   2020-01-25 07:50:53 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Math String
excerpt: 实现一个 `atoi` 函数，把字符串转换为整数。
---
> ## 8. String to Integer (atoi) | Medium
> 
> Implement `atoi` which converts a string to an integer.
> 
> The function first discards as many whitespace characters as necessary until the first non-whitespace character is found. Then, starting from this character, takes an optional initial plus or minus sign followed by as many numerical digits as possible, and interprets them as a numerical value.
> 
> The string can contain additional characters after those that form the integral number, which are ignored and have no effect on the behavior of this function.
> 
> If the first sequence of non-whitespace characters in str is not a valid integral number, or if no such sequence exists because either str is empty or it contains only whitespace characters, no conversion is performed.
> 
> If no valid conversion could be performed, a zero value is returned.
> 
> **Note:**
> 
> * Only the space character `' '` is considered as whitespace character.
> * Assume we are dealing with an environment which could only store integers within the 32-bit signed integer range: [−2<sup>31</sup>,  2<sup>31</sup> − 1]. If the numerical value is out of the range of representable values, INT_MAX (2<sup>31</sup> − 1) or INT_MIN (−2<sup>31</sup>) is returned.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> "42"
> <strong>Output:</strong> 42
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> "   -42"
> <strong>Output:</strong> -42
> <strong>Explanation:</strong> The first non-whitespace character is '-', which is the minus sign.
>              Then take as many numerical digits as possible, which gets 42.
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> "4193 with words"
> <strong>Output:</strong> 4193
> <strong>Explanation:</strong> Conversion stops at digit '3' as the next character is not a numerical digit.
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> "words and 987"
> <strong>Output:</strong> 0
> <strong>Explanation:</strong> The first non-whitespace character is 'w', which is not a numerical 
>              digit or a +/- sign. Therefore no valid conversion could be performed.
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> "-91283472332"
> <strong>Output:</strong> -2147483648
> <strong>Explanation:</strong> The number "-91283472332" is out of the range of a 32-bit signed integer.
>              Thefore INT_MIN (−2<sup>31</sup>) is returned.
> </pre>

## 解决方案

### 方法一：初等数学（Elementary Math）

把字符串转换为整数需要注意以下几点：
1. 忽略字符串开头的空格字符。
2. 识别第一个非空格字符是否为正负号。
3. 除第一个非空格字符外，紧挨着的只识别数字字符，其他字符忽略。

注意：若字符串中第一个非空格字符不是有效的整数（含正负号）字符、字符串为空或字符串仅含空白字符时，返回 0。

```cpp
class Solution {
public:
    int myAtoi(string str) {
        int i = 0, flag = 1, result = 0;
        while (str[i] == ' ') i++;
        if (str[i] == '-') flag = -1;
        if (str[i] == '+' || str[i] == '-') i++;
        while (i < str.size() && isdigit(str[i])) {
                int tmp = str[i] - '0';
                if (result > INT_MAX / 10 || (result == INT_MAX / 10 && tmp > 7)) {
                    return flag > 0 ? INT_MAX : INT_MIN;
                }
                result = result * 10 + tmp;
                i++;
        }
        return flag > 0 ? result : -result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(1)。

### 方法二：使用 STL 字符串流

```cpp
class Solution {
public:
    int myAtoi(string str) {
        int result = 0;
        stringstream ss(str);
        ss >> result;
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
* 空间复杂度：*O*(1)。

## 参考链接

* [String to Integer (atoi) - LeetCode](https://leetcode.com/problems/string-to-integer-atoi/){:target="_blank"}
