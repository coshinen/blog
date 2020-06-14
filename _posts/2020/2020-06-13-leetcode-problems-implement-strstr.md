---
layout: post
title:  "LeetCode 28. 实现 strStr() 简单"
date:   2020-06-13 08:09:19 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode
excerpt: 实现 [strStr()](http://www.cplusplus.com/reference/cstring/strstr/){:target="_blank"}。返回 haystack 中 needle 首次出现的索引，若 needle 不是 haystack 的一部分则返回 -1。
---
## 28. Implement strStr() | Easy

> Implement [strStr()](http://www.cplusplus.com/reference/cstring/strstr/){:target="_blank"}.
> 
> Return the index of the first occurrence of needle in haystack, or **-1** if needle is not part of haystack.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> haystack = "hello", needle = "ll"
> <strong>Output:</strong> 2
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> haystack = "aaaaa", needle = "bba"
> <strong>Output:</strong> -1
> </pre>
> 
> **Clarification:**
> 
> What should we return when `needle` is an empty string? This is a great question to ask during an interview.
> 
> For the purpose of this problem, we will return 0 when `needle` is an empty string. This is consistent to C's [strstr()](http://www.cplusplus.com/reference/cstring/strstr/){:target="_blank"} and Java's [indexOf()](https://docs.oracle.com/javase/7/docs/api/java/lang/String.html#indexOf(java.lang.String)){:target="_blank"}.

## 解决方案

### 方法一：子串逐个比较—线性时间复杂度

使用滑动窗口取出每个子串，与字符串 needle 比较。

```cpp
class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size();
        int len = needle.size();
        if (len == 0) return 0;
        for (int begin = 0; begin < n - len + 1; begin++) {
            if (haystack.substr(begin, len) == needle) {
                return begin;
            }
        }
        return -1;
    }
};
```

复杂度分析：
* 时间复杂度：_O_((n - len) * len)，n 为字符串 haystack 的长度，len 为字符串 needle 的长度。比较字符串的复杂度为 len，共需要比较 (n - len + 1) 次。
* 空间复杂度：_O_(1)。

### 方法二：双指针—线性时间复杂度

其实只需要比较首个字符与字符串 needle 的首个字符相同的子串。

```cpp
class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size();
        int len = needle.size();
        if (len == 0) return 0;
        int pn = 0;
        while (pn < n - len + 1) {
            while (pn < n - len + 1 && haystack[pn] != needle[0]) ++pn;
            int plen = 0, curlen = 0;
            while (plen < len && pn < n && haystack[pn] == needle[plen]) {
                ++pn;
                ++plen;
                ++curlen;
            }
            if (curlen == len) return pn - len;
            pn = pn - curlen + 1;
        }
        return -1;
    }
};
```

复杂度分析：
* 时间复杂度：最坏为 _O_((n - len) * len)，最优为 _O_(n)。
* 空间复杂度：_O_(1)。

## 参考链接

* [Implement strStr() - LeetCode](https://leetcode.com/problems/implement-strstr/){:target="_blank"}
