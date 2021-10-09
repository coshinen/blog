---
layout: post
title:  "LeetCode 97. 交错字符串（中等）"
date:   2021-10-09 20:05:05 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Dynamic-Programming
---
> 给定字符串 `s1`、`s2` 和 `s3`，验证 `s3` 是否为 `s1` 和 `s2` **交错**排列成的。
> 
> 两个字符串 `s` 和 `t` 的**交错**是它们都会被分隔成若干**非空**子字符串，如下：
> 
> * <code>s = s<sub>1</sub> + s<sub>2</sub> + ... + s<sub>n</sub></code>
> * <code>t = t<sub>1</sub> + t<sub>2</sub> + ... + t<sub>m</sub></code>
> * `|n - m| <= 1`
> * **交错**是 `s1 + t1 + s2 + t2 + s3 + t3 + ...` 或 `t1 + s1 + t2 + s2 + t3 + s3 + ...`
> 
> **注：**
> `a + b` 是字符串 `a` 和 `b` 的拼接。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/09/02/interleave.jpg" style="width: 561px; height: 203px;">
> 
> **限制条件：**
> 
> * `0 <= s1.length, s2.length <= 100`
> * `0 <= s3.length <= 200`
> * `s1`、`s2` 和 `s3` 仅由小写英文字母组成。
> 
> **进阶：**
> 你能仅使用 `O(s2.length)` 的额外空间解决它吗？

## 解决方案

### 方法一：动态规划

转移方程：
`f(i, j) = s1[i - 1] == s3[k] && f(i - 1, j);`
或
`f(i, j) = s2[j - 1] == s3[k] && f(i, j - 1);`

```cpp
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size(), t = s3.size();
        if (m + n != t) return false;
        auto f = vector<vector<int>> (m + 1, vector<int>(n + 1));
        f[0][0] = true;
        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {
                int k = i + j - 1;
                if (i > 0) f[i][j] |= (s1[i - 1] == s3[k] && f[i - 1][j]);
                if (j > 0) f[i][j] |= (s2[j - 1] == s3[k] && f[i][j - 1]);
            }
        }
        return f[m][n];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为 s1 和 s2 的长度。
* 空间复杂度：*O*(mn)。

### 方法二：使用滚动数组优化

```cpp
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size(), t = s3.size();
        if (m + n != t) return false;
        auto f = vector<int>(n + 1, false);
        f[0] = true;
        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {
                int k = i + j - 1;
                if (i > 0) f[j] &= s1[i - 1] == s3[k];
                if (j > 0) f[j] |= (s2[j - 1] == s3[k] & f[j - 1]);
            }
        }
        return f[n];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为 s1 和 s2 的长度。
* 空间复杂度：*O*(n)。

## 参考链接

* [Interleaving String - LeetCode](https://leetcode.com/problems/interleaving-string/){:target="_blank"}
