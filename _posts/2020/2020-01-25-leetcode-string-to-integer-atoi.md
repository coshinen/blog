---
layout: post
title:  "LeetCode 8. 字符串转整数 (atoi)（中等）"
date:   2020-01-25 07:50:53 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String
---
> 实现 `myAtoi(string s)` 函数，把字符串转换为 32 位的有符号整数（类似于 C/C++ 的 `atoi` 函数）。
> 
> `myAtoi(string s)` 的算法如下：
> 
> 1. 读入并忽略任何前导空格。
> 2. 检查下一个字符（如果不在字符串末尾）是否为 `'-'` 或 `'+'`。
>    读入该字符后若为两者中的任何一个。
>    这将决定最终结果分别为负值或正值。
>    如果两者都不存在则假定结果为正值。
> 3. 读入下一个字符，直到到达下一个非数字字符或输入的尾部。
>    字符串的剩余部分将被忽略。
> 4. 把这些数字转换为整数（即 `"123" -> 123`，`"0032" -> 32`）。
>    如果未读取任何数字，则整数为 `0`。
>    根据需要更改符号（从步骤 2 开始）。
> 5. 如果整数超过 32 位有符号整数范围 <code>[-2<sup>31</sup>, 2<sup>31</sup> - 1]</code>，则限制该整数，使其保持在该范围内。
>    具体地说，小于 <code>-2<sup>31</sup></code> 的整数应限制为 <code>-2<sup>31</sup></code>，大于 <code>-2<sup>31</sup> - 1</code> 的整数应限制为 <code>-2<sup>31</sup> - 1</code>。
> 6. 返回整数作为最终结果。
> 
> **注意：**
> 
> * 只有空格字符 `' '` 被视为空白字符。
> * **不要忽略**除前导空格或数字后字符串的其余部分以外的任何字符。
> 
> **限制条件：**
> 
> * `0 <= s.length <= 200`
> * `s` 由英文字母（小写和大写）、数字（`0-9`）、`' '`、`'+'`、`'-'` 和 `'.'`。

## 解决方案

### 方法一：初等数学

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
