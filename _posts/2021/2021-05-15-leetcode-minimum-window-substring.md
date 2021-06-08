---
layout: post
title:  "LeetCode 76. 最小覆盖子串（困难）"
date:   2021-05-15 18:27:42 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Hash-Table Two-Pointers String Sliding-Window
excerpt:
  给定两个长度分别为 `m` 和 `n` 字符串 `s` 和 `t`，返回 *`s` 中包含 `t` 所有字符的最小子串*。
  如果 `s` 中不存在包含 `t` 所有字符的子串，则返回*空字符串 `""`*。<br>
  **注意**如果 `s` 中存在这样的子串，保证它是唯一的最小子串。
---
> ## 76. Minimum Window Substring
> 
> Given two strings `s` and `t` of lengths `m` and `n` respectively, return *the
> minimum window in `s` which will contain all the characters in `t`*. If there
> is no such window in `s` that covers all characters in `t`, return *the empty
> string `""`*.
> 
> **Note** that If there is such a window, it is guaranteed that there will
> always be only one unique minimum window in `s`.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> s = "ADOBECODEBANC", t = "ABC"
> <strong>Output:</strong> "BANC"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> s = "a", t = "a"
> <strong>Output:</strong> "a"
> </pre>
> 
> **Constraints:**
> 
> * `m == s.length`
> * `n == t.length`
> * <code>1 <= m, n <= 10<sup>5</sup></code>
> * `s` and `t` consist of English letters.
> 
> **Follow up:** Could you find an algorithm that runs in `O(m + n)` time?
> 
> <details>
> <summary>Hint 1</summary>
> Use two pointers to create a window of letters in <b>S</b>, which would have
> all the characters from <b>T</b>.
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> Since you have to find the minimum window in <b>S</b> which has all the
> characters from <b>T</b>, you need to expand and contract the window using the
> two pointers and keep checking the window for all the characters. This
> approach is also called Sliding Window Approach. 
> <pre>
> L------------------------R, Suppose this is the window that contains all characters of <b>T</b>
> 
>        L-----------------R, this is the contracted window. We found a smaller window that still contains all the characters in <b>T</b>
> 
> When the window is no longer valid, start expanding again using the right pointer. 
> </pre>
> </details>

## 解决方案

### 方法一：滑动窗口

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128);
        for (const char &c: t) ++need[c];
        int left = 0, right = 0, begin = 0, size = INT_MAX;
        int m = s.size(), n = t.size();
        while (right < m) {
            if (need[s[right]] > 0) --n;
            --need[s[right]];
            if (n == 0) {
                while (left < right && need[s[left]] < 0) {
                    ++need[s[left]];
                    ++left;
                }
                if (right - left + 1 < size) {
                    begin = left;
                    size = right - left + 1;
                }
                ++need[s[left]];
                ++left;
                ++n;
            }
            ++right;
        }
        return size == INT_MAX ? "" : s.substr(begin, size);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(m + n)。
  m  和 n 分别为字符串 `s` 和 `t` 的长度。
  最坏情况滑动窗口的左右指针分别对字符串 `s` 的每个元素遍历一遍。
* 空间复杂度：*O*(1)。

## 参考链接

* [Minimum Window Substring - LeetCode](https://leetcode.com/problems/minimum-window-substring/){:target="_blank"}
