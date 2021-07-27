---
layout: post
title:  "LeetCode 76. 最小覆盖子串（困难）"
date:   2021-05-15 18:27:42 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Hash-Table Two-Pointers String Sliding-Window
---
> 给定两个长度分别为 `m` 和 `n` 字符串 `s` 和 `t`，返回 *`s` 中包含 `t` 所有字符的最小子串*。
> 如果 `s` 中不存在包含 `t` 所有字符的子串，则返回*空字符串 `""`*。
> 
> **注意**如果 `s` 中存在这样的子串，保证它是唯一的最小子串。
> 
> **限制条件：**
> 
> * `m == s.length`
> * `n == t.length`
> * <code>1 <= m, n <= 10<sup>5</sup></code>
> * `s` 和 `t` 由大写和小写英文字母组成。
> 
> **进阶：**
> 你能找到一个在 `O(m + n)` 内运行的算法吗？
> 
> <details>
> <summary>提示 1</summary>
> 使用两个指针在 <b>S</b> 中创建一个字母窗口，其中包含 <b>T</b> 中的所有字符。
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 因为必须在 <b>S</b> 中找到包含 <b>T</b> 中所有字符的最小窗口，所以你需要使用两个指针展开和收缩窗口，并不断检查窗口中的所有字符。
> 这种方法也称为滑动窗口法。
> <pre>
> L------------------------R，假设这是一个包含 <b>T</b> 中所有字符的窗口
> 
>        L-----------------R，这是一个收缩窗口。我们发现了一个较小的窗口仍包含 <b>T</b> 中所有字符
> 
> 当窗口不再有效时，使用右指针再次开始展开。
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
