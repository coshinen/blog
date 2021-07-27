---
layout: post
title:  "LeetCode 77. 组合（中等）"
date:   2021-05-22 16:23:36 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Backtracking
---
> 给定两个整数 `n` 和 `k`，返回*范围 `[1, n]` 内所有可能的 `k` 个数的组合*。
> 
> 你可以**任何顺序**返回答案。
> 
> **限制条件：**
> 
> * `1 <= n <= 20`
> * `1 <= k <= n`

## 解决方案

### 方法一：递归+剪枝

```cpp
class Solution {
private:
    vector<int> path;
    vector<vector<int>> result;

    void dfs(int n, int k, int startIdx) {
        if (path.size() == k) {
            result.push_back(path);
            return;
        }
        for (int i = startIdx; i <= n - (k - path.size()) + 1; i++) {
            path.push_back(i);
            dfs(n, k, i + 1);
            path.pop_back();
        }
    }

public:
    vector<vector<int>> combine(int n, int k) {
        dfs(n, k, 1);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(nk)。
  k 为递归的深度，n 为未剪枝情况下循环的次数。
* 空间复杂度：*O*(n + k) = *O*(n)。
  递归栈空间和结果数组的空间。

## 参考链接

* [Combinations - LeetCode](https://leetcode.com/problems/combinations/){:target="_blank"}
