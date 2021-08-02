---
layout: post
title:  "LeetCode 58. 最后一个单词的长度（简单）"
date:   2021-01-09 07:47:20 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy String
---
> 给定一个通过空格分隔的一些单词组成的字符串 `s`，返回*该字符串中最后一个单词的长度*。
> 如果最后一个单词不存在，则返回 `0`。
> 
> **单词**是指仅由字母组成且不含任何空格字符的最大子串。
> 
> **限制条件：**
> 
> * <code>1 <= s.length <= 10<sup>4</sup></code>
> * `s` 仅由英文字母和空格 `' '` 组成。

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
