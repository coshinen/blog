---
layout: post
title:  "LeetCode 60. 排列序列 困难"
date:   2021-01-23 08:36:44 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Backtracking
excerpt: 集合 `[1, 2, 3, ..., n]` 一共包含 `n!` 种排列。按顺序列出并标记所有排列，对于 `n = 3` 我们给出下面序列：……给定 `n` 和 `k`，返回第 `k` 个排序序列。
---
> ## 60. Permutation Sequence
> 
> The set `[1, 2, 3, ..., n]` contains a total of `n!` unique permutations.
> 
> By listing and labeling all of the permutations in order, we get the following sequence for `n = 3`:
> 
> 1. `"123"`
> 2. `"132"`
> 3. `"213"`
> 4. `"231"`
> 5. `"312"`
> 6. `"321"`
> 
> Given `n` and `k`, return the <code>k<sup>th</sup></code> permutation sequence.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> n = 3, k = 3
> <strong>Output:</strong> "213"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> n = 4, k = 9
> <strong>Output:</strong> "2314"
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> n = 3, k = 1
> <strong>Output:</strong> "123"
> </pre>
> 
> **Constraints:**
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
