---
layout: post
title:  "LeetCode 91. 解码方法（中等）"
date:   2021-08-28 20:40:46 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Dynamic-Programming
---
> 一条包含字母 `A-Z` 的消息通过下面的映射**编码**成数字：
> 
> ```
> 'A' -> "1"
> 'B' -> "2"
> ...
> 'Z' -> "26"
> ```
> 
> **解码**一条编码的消息，所有数字必须先分组后再基于上述映射反向映射回字母（可能有多种方法）。
> 例如，`"11106"` 可以映射为：
> 
> * `"AAJF"` 分组为 `(1 1 10 6)`
> * `"KJF"` 分组为 `(11 10 6)`
> 
> 注意分组 `(1 11 06)` 是无效的，因为 `"06"` 不能被映射到 `'F'`，由于 `"6"` 不同于 `"06"`。
> 
> 给定一个仅含数字的字符串 `s`，返回*解码该字符串的方法**数***。
> 
> 答案以确保为 **32 位**整数。
> 
> **限制条件：**
> 
> * `1 <= s.length <= 100`
> * `s` 仅含数字并可能含前导零。

## 解决方案

### 方法一：动态规划

状态转移方程：
* f<sub>i</sub> = f<sub>i - 1</sub>, s[i] != 0
* f<sub>i</sub> = f<sub>i - 2</sub>, s[i - 1] != 0 && 10 * s[i - 1] + s[i] <= 26 && i > 1

```cpp
class Solution {
public:
    int numDecodings(string s) {
        int n = s.size();
        int f1 = 0, f2 = 1, f3;
        for (int i = 1; i <= n; i++) {
            f3 = 0;
            if (s[i - 1] != '0') {
                f3 += f2;
            }
            if (i > 1 && s[i - 2] != '0' && ((s[i - 2] - '0') * 10 + (s[i - 1] - '0') <= 26)) {
                f3 += f1;
            }
            tie(f1, f2) = {f2, f3};
        }
        return f3;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为字符串 `s` 的长度。
* 空间复杂度：*O*(1)。

## 参考链接

* [Decode Ways - LeetCode](https://leetcode.com/problems/decode-ways/){:target="_blank"}
