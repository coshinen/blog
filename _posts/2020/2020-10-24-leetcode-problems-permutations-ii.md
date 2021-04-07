---
layout: post
title:  "LeetCode 47. 全排列 II（中等）"
date:   2020-10-24 19:45:04 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Backtracking
excerpt: 给定一个可包含重复数字的集合，返回其所有不重复的全排列。
---
> ## 47. Permutations II
> 
> Given a collection of numbers that might contain duplicates, return all
> possible unique permutations.
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> [1,1,2]
> <strong>Output:</strong>
> [
>   [1,1,2],
>   [1,2,1],
>   [2,1,1]
> ]
> </pre>

## 解决方案

### 方法一：回溯

```cpp
class Solution {
private:
    vector<int> vis;

    void backtrack(vector<int>& nums, vector<vector<int>>& res, int idx, vector<int>& perm) {
        if (idx == nums.size()) {
            res.emplace_back(perm);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (vis[i] || (i > 0 && nums[i] == nums[i - 1] && !vis[i - 1])) continue;
            perm.emplace_back(nums[i]);
            vis[i] = 1;
            backtrack(nums, res, idx + 1, perm);
            vis[i] = 0;
            perm.pop_back();
        }
    }

public:
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> perm;
        vis.resize(nums.size());
        sort(nums.begin(), nums.end());
        backtrack(nums, result, 0, perm);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n\*n!)。
  n 为集合大小。对于 `backtrack` 调用的每个叶子节点（共 n! 个），复制到结果数组中都需要 *O*(n) 的时间。
* 空间复杂度：*O*(n)。
  递归栈的深度为 *O*(n)，标记数组 `vis` 也需要 *O*(n)。

## 参考链接

* [Permutations II - LeetCode](https://leetcode.com/problems/permutations-ii/){:target="_blank"}
* [std::vector<T,Allocator>::emplace_back - cppreference.com](https://en.cppreference.com/w/cpp/container/vector/emplace_back){:target="_blank"}
