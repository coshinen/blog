---
layout: post
title:  "LeetCode 58. 最后一个单词的长度（简单）"
date:   2021-01-09 07:47:20 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy String
excerpt:
  给定一个通过空格分隔的一些单词组成的字符串 `s`，返回*该字符串中最后一个单词的长度*。<br>
  如果最后一个单词不存在，则返回 `0`。<br>
  **单词**是指仅由字母组成且不含任何空格字符的最大子串。
---
> ## 58. Length of Last Word
> 
> Given a string `s` consists of some words separated by spaces, return *the
> length of the last word in the string*. If the last word does not exist,
> return `0`.
> 
> A **word** is a maximal substring consisting of non-space characters only.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> s = "Hello World"
> <strong>Output:</strong> 5
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> s = " "
> <strong>Output:</strong> 0
> </pre>
> 
> **Constraints:**
> 
> * <code>1 <= s.length <= 10<sup>4</sup></code>
> * `s` consists of only English letters and spaces `' '`.

## 解决方案

### 方法一：遍历

```cpp
class Solution {
public:
    int lengthOfLastWord(string s) {
        int end = s.size() - 1;
        while (end >= 0 && s[end] == ' ') end--;
        if (end < 0) return 0;
        int begin = end;
        while (begin >= 0 && s[begin] != ' ') begin--;
        return end - begin;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为字符串最后一个单词和尾部空格的长度和。
* 空间复杂度：*O*(1)。

## 参考链接

* [Length of Last Word - LeetCode](https://leetcode.com/problems/length-of-last-word/){:target="_blank"}
