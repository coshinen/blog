---
layout: post
title:  "LeetCode 5. 最长的回文子串（中等）"
date:   2020-01-04 08:47:12 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Dynamic-Programming
excerpt:
  给定一个字符串 **s**，找到 **s** 中最长的回文子串。
  你可以假设 **s** 的最大长度为 1000。
---
> ## 5. Longest Palindromic Substring
> 
> Given a string **s**, find the longest palindromic substring in **s**. You may
> assume that the maximum length of **s** is 1000.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> "babad"
> <strong>Output:</strong> "bab"
> <strong>Note:</strong> "aba" is also a valid answer.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> "cbbd"
> <strong>Output:</strong> "bb"
> </pre>
> 
> <details>
> <summary>Hint 1</summary>
> How can we reuse a previously computed palindrome to compute a larger
> palindrome?
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> If "aba" is a palindrome, is "xabax" and palindrome? Similarly is "xabay" a
> palindrome?
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Complexity based hint:<br>
> If we use brute-force and check whether for every start and end position a
> substring is a palindrome we have O(n<sup>2</sup>) start - end pairs and O(n)
> palindromic checks. Can we reduce the time for palindromic checks to O(1) by
> reusing some previous computation.
> </details>

## 解决方案

### 方法一：动态规划

* 长度为 1 的子串，是回文。
* 长度为 2 的子串，当两个字母相同时，是回文。
* 长度大于 2 的子串，若是回文，去掉首尾两个字母后，仍是回文。

于是动态规划状态转移方程：

P(i, j) = P(i + 1, j - 1) ^ (Si == Sj)

即 s[i + 1 : j - 1] 是回文，且 s 的第 i 和 j 个字母相同时，s[i : j] 才是回文。

```cpp
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        vector<vector<int>> dp(n, vector<int>(n));
        string result;
        for (int len = 0; len < n; len++) {
            for (int i = 0; i + len < n; i++) {
                int j = i + len;
                if (len == 0) {
                    dp[i][j] = 1;
                } else if (len == 1) {
                    dp[i][j] = (s[i] == s[j]);
                } else {
                    dp[i][j] = (s[i] == s[j] && dp[i + 1][j -1]);
                }
                if (dp[i][j] && len + 1 > result.size()) {
                    result = s.substr(i, len + 1);
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Longest Palindromic Substring - LeetCode](https://leetcode.com/problems/longest-palindromic-substring/){:target="_blank"}
