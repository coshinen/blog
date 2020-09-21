---
layout: post
title:  "LeetCode 10. 正则表达式匹配 困难"
date:   2020-02-08 15:52:08 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard String Dynamic-Programming Backtracking
excerpt: 给定一个字符串（`s`）和一个模式串（`p`），实现支持 `'.'` 和 `'*'` 的正则表达式匹配。
---
> ## 10. Regular Expression Matching
> 
> Given an input string (`s`) and a pattern (`p`), implement regular expression matching with support for `'.'` and `'*'`.
> 
> ```
> '.' Matches any single character.
> '*' Matches zero or more of the preceding element.
> ```
> 
> The matching should cover the **entire** input string (not partial).
> 
> **Note:**
> 
> * `s` could be empty and contains only lowercase letters `a-z`.
> * `p` could be empty and contains only lowercase letters `a-z`, and characters like `.` or `*`.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong>
> s = "aa"
> p = "a"
> <strong>Output:</strong> false
> <strong>Explanation:</strong> "a" does not match the entire string "aa".
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong>
> s = "aa"
> p = "a*"
> <strong>Output:</strong> true
> <strong>Explanation:</strong> '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong>
> s = "ab"
> p = ".*"
> <strong>Output:</strong> true
> <strong>Explanation:</strong> ".*" means "zero or more (*) of any character (.)".
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong>
> s = "aab"
> p = "c*a*b"
> <strong>Output:</strong> true
> <strong>Explanation:</strong> c can be repeated 0 times, a can be repeated 1 time. Therefore, it matches "aab".
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong>
> s = "mississippi"
> p = "mis*is*p*."
> <strong>Output:</strong> false
> </pre>

## 解决方案

### 方法一：动态规划（Dynamic Programming）

```cpp
class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size();
        int n = p.size();
        auto matches = [&](int i, int j) {
            if (i == 0) return false;
            if (p[j - 1] == '.') return true;
            return s[i - 1] == p[j - 1];
        };
        vector<vector<int>> f(m + 1, vector<int>(n + 1));
        f[0][0] = true;
        for (int i = 0; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                if (p[j - 1] == '*') {
                    f[i][j] |= f[i][j - 2];
                    if (matches(i, j - 1)) {
                        f[i][j] |= f[i - 1][j];
                    }
                } else {
                    if (matches(i, j)) {
                        f[i][j] |= f[i - 1][j - 1];
                    }
                }
            }
        }
        return f[m][n];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为字符串 s 和 p 的长度。每个状态转移的时间复杂度为 *O*(1)。
* 空间复杂度：*O*(mn)。
  存储所有状态使用的空间。

## 参考链接

* [Regular Expression Matching - LeetCode](https://leetcode.com/problems/regular-expression-matching/){:target="_blank"}
