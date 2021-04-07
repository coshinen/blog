---
layout: post
title:  "LeetCode 44. 通配符匹配（困难）"
date:   2020-10-03 08:24:06 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard String Dynamic-Programming Backtracking Greedy
excerpt: 给定一个输入字符串（`s`）和一个模式（`p`），实现支持 `'?'` 和 `'*'` 的通配符模式匹配。
---
> ## 44. Wildcard Matching
> 
> Given an input string (`s`) and a pattern (`p`), implement wildcard pattern
> matching with support for `'?'` and `'*'`.
> 
> * `'?'` Matches any single character.
> * `'*'` Matches any sequence of characters (including the empty sequence).
> 
> The matching should cover the **entire** input string (not partial).
> 
> **Note:**
> 
> * `s` could be empty and contains only lowercase letters `a-z`.
> * `p` could be empty and contains only lowercase letters `a-z`, and characters
> like `?` or `*`.
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
> p = "*"
> <strong>Output:</strong> true
> <strong>Explanation:</strong> '*' matches any sequence.
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong>
> s = "cb"
> p = "?a"
> <strong>Output:</strong> false
> <strong>Explanation:</strong> '?' matches 'c', but the second letter is 'a', which does not match 'b'.
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong>
> s = "adceb"
> p = "*a*b"
> <strong>Output:</strong> true
> <strong>Explanation:</strong> The first '*' matches the empty sequence, while the second '*' matches the substring "dce".
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong>
> s = "acdcb"
> p = "a*c?b"
> <strong>Output:</strong> false
> </pre>

## 解决方案

### 方法一：动态规划

状态转移方程：
```
           dp[i - 1][j - 1]，           si 和 pj 相同或 pj 为问号
dp[i][j] = dp[i][j - 1] | dp[i - 1][j]，pj 为星号
           false，                      其他情况
```

边界条件：
* dp[0][0] = true，当字符串 s 和模式串 p 均为空时，匹配成功；
* dp[i][0] = false，空模式串 p 无法匹配非空字符串 s；
* dp[0][j] 需要分情况，只有星号才能匹配空字符串，所以当模式串 p 的前 j 个字符均为星号时，结果为 true。

```cpp
class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size();
        int n = p.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1));
        dp[0][0] = true;
        for (int i = 1; i <= n; i++) {
            if (p[i - 1] == '*') {
                dp[0][i] = true;
            } else {
                break;
            }
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (p[j - 1] == '*') {
                    dp[i][j] = dp[i][j - 1] | dp[i - 1][j];
                } else if (p[j - 1] == '?' || s[i - 1] == p[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
            }
        }
        return dp[m][n];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为字符串 s 和模式串 p 的长度。
* 空间复杂度：*O*(mn)。
  状态空间大小为 (m + 1)(n + 1)。

## 参考链接

* [Wildcard Matching - LeetCode](https://leetcode.com/problems/wildcard-matching/){:target="_blank"}
