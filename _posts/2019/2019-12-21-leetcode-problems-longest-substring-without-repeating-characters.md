---
layout: post
title:  "LeetCode 3. 无重复字符的最长子串（中等）"
date:   2019-12-21 13:32:52 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Hash-Table Two-Pointers String Sliding-Window
excerpt: 给定一个字符串，找出没有重复字符的**最长子串**的长度。
---
> ## 3. Longest Substring Without Repeating Characters
> 
> Given a string, find the length of the **longest substring** without repeating
> characters.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> "abcabcbb"
> <strong>Output:</strong> 3
> <strong>Explanation:</strong> The answer is "abc", with the length of 3.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> "bbbbb"
> <strong>Output:</strong> 1
> <strong>Explanation:</strong> The answer is "b", with the length of 1.
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> "pwwkew"
> <strong>Output:</strong> 3
> <strong>Explanation:</strong> The answer is "wke", with the length of 3.
>              Note that the answer must be a <strong>substring</strong>, "pwke" is a subsequence and not a substring.
> </pre>

## 解决方案

### 方法一：滑动窗口

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
* 时间复杂度：*O*(n)。
  n 为字符个数，最坏的情况是 *O*(2n) 即每个字符都被访问两次。
* 空间复杂度：*O*(m)。
  m 是滑动窗口即 ASCII 字符集的大小。

## 参考链接

* [Longest Substring Without Repeating Characters - LeetCode](https://leetcode.com/problems/longest-substring-without-repeating-characters/){:target="_blank"}
