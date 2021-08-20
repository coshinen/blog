---
layout: post
title:  "LeetCode 10. 正则表达式匹配（困难）"
date:   2020-02-08 15:52:08 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard String Dynamic-Programming Recursion
---
> 给定一个输入字符串 `s` 和一个模式串 `p`，实现支持 `'.'` 和 `'*'` 的正则表达式匹配：
> 
> * `'.'` 匹配任意单一字符。
> * `'*'` 匹配前 0 个或更多的元素。
> 
> 该匹配应覆盖**整个**输入字符串（非部分）。
> 
> **限制条件：**
> 
> * `1 <= s.length <= 20`
> * `1 <= p.length <= 30`
> * `s` 仅含小写英文字母。
> * `p` 仅含小写英文字母，`'.'` 和 `'*'`。
> * 已确保字符 `'*'` 每次出现都会有一个之前的有效字符进行匹配。

## 解决方案

### 方法一：动态规划

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
