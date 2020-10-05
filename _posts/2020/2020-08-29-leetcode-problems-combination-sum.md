---
layout: post
title:  "LeetCode 39. 组合总和 中等"
date:   2020-08-29 08:07:06 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking
excerpt: 给定一个**无重复元素**的数组 `candidates` 和一个目标数 `target`，找出 `candidates` 中所有使数字和为 `target` 的组合。
---
> ## 39. Combination Sum
> 
> Given a **set** of candidate numbers (`candidates`) (**without duplicates**) and a target number (`target`), find all unique combinations in `candidates` where the candidate numbers sums to `target`.
> 
> The **same** repeated number may be chosen from `candidates` unlimited number of times.
> 
> **Note:**
> 
> * All numbers (including `target`) will be positive integers.
> * The solution set must not contain duplicate combinations.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> candidates = [2,3,6,7], target = 7,
> <strong>A solution set is:</strong>
> [
>   [7],
>   [2,2,3]
> ]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> candidates = [2,3,5], target = 8,
> <strong>A solution set is:</strong>
> [
>   [2,2,2,2],
>   [2,3,3],
>   [3,5]
> ]
> </pre>
>  
> 
> **Constraints:**
> 
> * `1 <= candidates.length <= 30`
> * `1 <= candidates[i] <= 200`
> * Each element of `candidate` is unique.
> * `1 <= target <= 500`

## 解决方案

### 方法一：回溯

```cpp
class Solution {
private:
    vector<vector<int>> result;
    vector<int> tmp;

    void dfs(vector<int>& candidates, int target, int idx) {
        if (target == 0) {
            result.push_back(tmp);
            return;
        }
        if (target < 0) return;
        for(int i = idx; i < candidates.size(); i++) {
            tmp.push_back(candidates[i]);
            dfs(candidates, target - candidates[i], i);
            tmp.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        dfs(candidates, target, 0);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
  数组最大为 30。
* 空间复杂度：*O*(1)。

## 参考链接

* [Combination Sum - LeetCode](https://leetcode.com/problems/combination-sum/){:target="_blank"}
