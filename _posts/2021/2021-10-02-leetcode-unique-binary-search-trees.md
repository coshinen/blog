---
layout: post
title:  "LeetCode 96. 不同的二叉搜索树（中等）"
date:   2021-10-02 19:33:28 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Math Dynamic-Programming Tree Binary-Search-Tree Binary-Tree
---
> 给定一个整数 `n`，返回*结构不同的**二叉搜索树**的数量，其中 `n` 个不同的节点值从 `1` 到 `n`*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/18/uniquebstn3.jpg" style="width: 600px; height: 148px;">
> 
> **限制条件：**
> 
> * `1 <= n <= 19`

## 解决方案

### 方法一：数学

卡塔兰数：C<sub>0</sub> = 1, C<sub>n + 1</sub> = C<sub>n</sub> * 2 * (2 * n + 1) / n + 2

```cpp
class Solution {
public:
    int numTrees(int n) {
        long long c = 1;
        for (int i = 0; i < n; i++) {
            c = c * 2 * (2 * i + 1) / (i + 2);
        }
        return (int)c;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉搜索树的节点数，只需遍历一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Unique Binary Search Trees - LeetCode](https://leetcode.com/problems/unique-binary-search-trees/){:target="_blank"}
