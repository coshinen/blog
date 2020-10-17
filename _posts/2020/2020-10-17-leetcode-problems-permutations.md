---
layout: post
title:  "LeetCode 46. 全排列 中等"
date:   2020-10-17 07:48:52 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Backtracking
excerpt: 给定一个**无重复**数字的集合，返回其所有可能的全排列。
---
> ## 46. Permutations
> 
> Given a collection of **distinct** integers, return all possible permutations.
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> [1,2,3]
> <strong>Output:</strong>
> [
>   [1,2,3],
>   [1,3,2],
>   [2,1,3],
>   [2,3,1],
>   [3,1,2],
>   [3,2,1]
> ]
> </pre>

## 解决方案

### 方法一：回溯法

```cpp
class Solution {
private:
    void backtrack(vector<vector<int>>& result, vector<int>& output, int first, int len) {
        if (first == len) {
            result.emplace_back(output);
            return;
        }
        for (int i = first; i < len; i++) {
            swap(output[i], output[first]);
            backtrack(result, output, first + 1, len);
            swap(output[i], output[first]);
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        backtrack(result, nums, 0, nums.size());
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n\*n!)。
  n 为集合大小。对于 `backtrack` 调用的每个叶子节点（共 n! 个），复制到结果数组中都需要 *O*(n) 的时间。
* 空间复杂度：*O*(n)。
  递归调用的深度为 *O*(n)。

## 参考链接

* [Permutations - LeetCode](https://leetcode.com/problems/permutations/){:target="_blank"}
* [std::vector<T,Allocator>::emplace_back - cppreference.com](https://en.cppreference.com/w/cpp/container/vector/emplace_back){:target="_blank"}
