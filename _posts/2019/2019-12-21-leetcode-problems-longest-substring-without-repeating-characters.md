---
layout: post
title:  "LeetCode 3. 无重复字符的最长子串 中等"
date:   2019-12-21 13:32:52 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode
excerpt: 给定一个字符串，找出没有重复字符的**最长子串**的长度。
---
## 3. Longest Substring Without Repeating Characters | Medium

> Given a string, find the length of the **longest substring** without repeating characters.
> 
> **Example 1:**
> 
> **Input:** "abcabcbb"<br>
> **Output:** 3<br>
> **Explanation:** The answer is "abc", with the length of 3.
> 
> **Example 2:**
> 
> **Input:** "bbbbb"<br>
> **Output:** 1<br>
> **Explanation:** The answer is "b", with the length of 1.
> 
> **Example 3:**
> 
> **Input:** "pwwkew"<br>
> **Output:** 3<br>
> **Explanation:** The answer is "wke", with the length of 3.<br>
>              Note that the answer must be a **substring**, "pwke" is a subsequence and not a substring.

## 问题分析

给定一个字符串，找出没有重复字符的**最长子串**的长度。

## 解决方案

### 方法一：滑动窗口（Sliding Window）

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int begin = 0, end = 0, maxlen = 0;
        int idx[128] = {0};
        while (end < s.size()) {
            if (idx[s[end]] == 0) {
                idx[s[end]] = 1;
            } else {
                maxlen = max(maxlen, end - begin);
                while (s[begin] != s[end]) {
                    idx[s[begin]] = 0;
                    begin++;
                }
                begin++;
            }
            end++;
        }
        maxlen = max(maxlen, end - begin);
        return maxlen;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(2n) = _O_(n)。最坏的情况是每个字符都被访问两次。
* 空间复杂度：_O_(m)。m 是滑动窗口的大小，即字符集的大小。

常用的字符表如下：
* int[26] 对于字符 'a' - 'z' 或 'A' - 'Z'
* int[128] 对于 ASCII 码
* int[256] 对于扩展的 ASCII 码

## 参考链接

* [Longest Substring Without Repeating Characters - LeetCode](https://leetcode.com/problems/longest-substring-without-repeating-characters/){:target="_blank"}
