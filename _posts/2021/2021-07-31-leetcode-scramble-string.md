---
layout: post
title:  "LeetCode 87. 扰乱字符串（困难）"
date:   2021-07-31 20:39:38 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard String Dynamic-Programming
---
> 我们可以使用下面的算法打乱字符串 s 以获得字符串 t：
> 
> 1. 如果字符串的长度为 1，停止。
> 2. 如果字符串的长度大于 1，执行下面操作：
>   * 把字符串按随机索引拆分为两个非空子串，即，如果字符串为 `s`，则把它拆分为 `x` 和 `y`，其中 `s = x + y`。
>   * **随机**决定交换两个子串或保持它们顺序相同。即，在该步骤后，`s` 可以变成 `s = x + y` 或 `s = y + x`。
>   * 对两个子串 `x` 和 `y` 递归应用步骤 1。
> 
> 给定两个**长度相同**的字符串 `s1` 和 `s2`，如果 `s2` 是 `s1` 的扰乱字符串则返回 `true`，否则返回 `false`。
> 
> **限制条件：**
> 
> * `s1.length == s2.length`
> * `1 <= s1.length <= 30`
> * `s1` 和 `s2` 均由小写英文字母组成。

## 解决方案

### 方法一：动态规划

```cpp
class Solution {
private:
    int memo[30][30][31];
    string s1, s2;

    bool checkIfSimilar(int i1, int i2, int len) {
        unordered_map<int, int> umap;
        for (int i = i1; i < i1 + len; i++) umap[s1[i]]++;
        for (int i = i2; i < i2 + len; i++) umap[s2[i]]--;
        if (any_of(umap.begin(), umap.end(), [](const auto& entry) {return entry.second != 0;})) return false;
        return true;
    }

    bool dfs(int i1, int i2, int len) {
        if (memo[i1][i2][len]) return memo[i1][i2][len] == 1;
        if (s1.substr(i1, len) == s2.substr(i2, len)) {
            memo[i1][i2][len] = 1;
            return true;
        }
        if (!checkIfSimilar(i1, i2, len)) {
            memo[i1][i2][len] = -1;
            return false;
        }
        for (int i = 1; i < len; i++) {
            if (dfs(i1, i2, i) && dfs(i1 + i, i2 + i, len - i)) {
                memo[i1][i2][len] = 1;
                return true;
            }
            if (dfs(i1, i2 + len - i, i) && dfs(i1 + i, i2, len - i)) {
                memo[i1][i2][len] = 1;
                return true;
            }
        }
        memo[i1][i2][len] = -1;
        return false;
    }

public:
    bool isScramble(string s1, string s2) {
        memset(memo, 0, sizeof(memo));
        this->s1 = s1;
        this->s2 = s2;
        return dfs(0, 0, s1.size());
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>4</sup>)。
  n 为给定字符串的长度。
* 空间复杂度：*O*(n<sup>3</sup>)。
  存储动态规划状态的空间。

## 参考链接

* [Scramble String - LeetCode](https://leetcode.com/problems/scramble-string/){:target="_blank"}
