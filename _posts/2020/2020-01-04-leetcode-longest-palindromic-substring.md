---
layout: post
title:  "LeetCode 5. 最长的回文子串（中等）"
date:   2020-01-04 08:47:12 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Dynamic-Programming
---
> 给定一个字符串 `s`，返回 `s` 中*最长的回文子串*。
> 
> **限制条件：**
> 
> * `1 <= s.length <= 1000`
> * `s` 仅由数字和英文字母组成。
> 
> <details>
> <summary>提示 1</summary>
> 我们如何重用一个提前计算好的回文来计算一个更大的回文？
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 如果 "aba" 是一个回文，那么 "xabax" 是回文吗？
> 同样 "xabay" 是回文吗？
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 基于复杂度的提示：<br>
> 如果我们使用暴力法并检查每个开始和结束位置的子串是否为回文，我们有 O(n<sup>2</sup>) 开始 - 结束对和 O(n) 的回文检查。
> 我们能否通过重用之前的一些计算把回文检查的时间减少到 O(1)？
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
