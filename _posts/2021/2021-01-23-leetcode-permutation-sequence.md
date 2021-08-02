---
layout: post
title:  "LeetCode 60. 排列序列（困难）"
date:   2021-01-23 08:36:44 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Backtracking
---
> 集合 `[1, 2, 3, ..., n]` 一共包含 `n!` 种排列。
> 
> 按顺序列出并标记所有排列，对于 `n = 3` 我们给出下面序列：
> 
> 1. `"123"`
> 2. `"132"`
> 3. `"213"`
> 4. `"231"`
> 5. `"312"`
> 6. `"321"`
> 
> 给定 `n` 和 `k`，返回第 `k` 个排序序列。
> 
> **限制条件：**
> 
> * `1 <= n <= 9`
> * `1 <= k <= n!`

## 解决方案

### 方法一：数学 + 缩小问题规模

```cpp
class Solution {
public:
    string getPermutation(int n, int k) {
        vector<int> factorial(n);
        factorial[0] = 1;
        for (int i = 1; i < n; i++) {
            factorial[i] = factorial[i - 1] * i;
        }

        --k;
        vector<int> valid(n + 1, 1);
        string result;
        for (int i = 1; i <= n; i++) {
            int order = k / factorial[n - i] + 1;
            for (int j = 1; j <= n; j++) {
                order -= valid[j];
                if (!order) {
                    result += (j + '0');
                    valid[j] = 0;
                    break;
                }
            }
            k %= factorial[n - i];
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
* 空间复杂度：*O*(n)。

## 参考链接

* [Permutation Sequence - LeetCode](https://leetcode.com/problems/permutation-sequence/){:target="_blank"}
