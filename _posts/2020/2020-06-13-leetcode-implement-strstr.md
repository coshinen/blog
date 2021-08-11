---
layout: post
title:  "LeetCode 28. 实现 strStr()（简单）"
date:   2020-06-13 08:09:19 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Two-Pointers String String-Matching
---
> 实现 [strStr()](http://www.cplusplus.com/reference/cstring/strstr/){:target="_blank"}。
> 
> 返回 `haystack` 中 `needle` 首次出现的索引，若 `needle` 不是 `haystack` 的一部分则返回 `-1`。
> 
> **阐明：**
> 
> 当 `needle` 是空字符串时我们应该返回什么？
> 这是一个很棒的面试问题。
> 
> 为了解决该问题，当 `needle` 是一个空串时我们将返回 0。
> 这与 C 的 [strstr()](http://www.cplusplus.com/reference/cstring/strstr/){:target="_blank"} 和 Java 的 [indexOf()](https://docs.oracle.com/javase/7/docs/api/java/lang/String.html#indexOf(java.lang.String)){:target="_blank"} 一致。
> 
> **限制条件：**
> 
> * <code>0 <= haystack.length, needle.length <= 5 * 10<sup>4</sup></code>
> * `haystack` 和 `needle` 仅由小写英文字母组成。

## 解决方案

### 方法一：子串逐个比较—线性时间复杂度

使用滑动窗口取出每个子串，与字符串 needle 比较。

```cpp
class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size();
        int len = needle.size();
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
* 时间复杂度：*O*((n - len) * len)。
  n 为字符串 haystack 的长度，len 为字符串 needle 的长度，比较字符串的复杂度为 len，共需要比较 (n - len + 1) 次。
* 空间复杂度：*O*(1)。

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
            int plen = 0;
            int curlen = 0;
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
* 时间复杂度：最坏为 *O*((n - len) * len)，最优为 *O*(n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Implement strStr() - LeetCode](https://leetcode.com/problems/implement-strstr/){:target="_blank"}
