---
layout: post
title:  "LeetCode 72. 编辑距离（困难）"
date:   2021-04-17 13:34:14 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard String Dynamic-Programming
---
> 给定两个字符串 `word1` 和 `word2`，返回*转换 `word1` 到 `word2` 所需的最少操作数*。
> 
> 你可以对一个单词进行下面的三种操作：
> 
> * 插入一个字符
> * 删除一个字符
> * 替换一个字符
> 
> **限制条件：**
> 
> * `0 <= word1.length, word2.length <= 500`
> * `word1` 和 `word2` 由小写英文字母组成。

## 解决方案

### 方法一：动态规划

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.length(), n = word2.length();
        if (m * n == 0) return m + n;
        int DP[m + 1][n + 1];
        for (int i = 0; i < m + 1; i++) DP[i][0] = i;
        for (int j = 0; j < n + 1; j++) DP[0][j] = j;
        for (int i = 1; i < m + 1; i++) {
            for (int j = 1; j < n + 1; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    DP[i][j] = min(min(DP[i - 1][j] + 1, DP[i][j - 1] + 1), DP[i - 1][j - 1]);
                } else {
                    DP[i][j] = min(min(DP[i - 1][j] + 1, DP[i][j - 1] + 1), DP[i - 1][j - 1] + 1);
                }
            }
        }
        return DP[m][n];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 为 `word1` 的长度，n 为 `word2` 的长度。
* 空间复杂度：*O*(mn)。

## 参考链接

* [Edit Distance - LeetCode](https://leetcode.com/problems/edit-distance/){:target="_blank"}
