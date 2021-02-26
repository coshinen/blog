---
layout: post
title:  "LeetCode 39. 组合总和 中等"
date:   2020-08-29 08:07:06 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking
excerpt:
  给定一个无重复的整数数组 `candidates` 和一个目标整数 `target`，返回*一个所有**唯一的候选组合**的列表，其中所选的 `candidates` 之和为 `target`*。
  可以按**任何顺序**返回组合<br>
  **同一**数字可以从 `candidates` 中**无限次**选出。
  如果所选数字中至少一个的频率不同，则两个组合是唯一的。<br>
  对于给定的输入，**保证**总和达到 `target` 的唯一组合数少于 `150` 个组合。
---
> ## 39. Combination Sum
> 
> Given an array of **distinct** integers `candidates` and a target integer
> `target`, return *a list of all **unique combinations** of `candidates` where
> the chosen numbers sum to `target`*. You may return the combinations in **any
> order**.
> 
> The **same** number may be chosen from `candidates` an **unlimited number of
> times**. Two combinations are unique if the frequency of at least one of the
> chosen numbers is different.
> 
> It is **guaranteed** that the number of unique combinations that sum up to
> `target` is less than `150` combinations for the given input.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> candidates = [2,3,6,7], target = 7
> <strong>Output:</strong> [[2,2,3],[7]]
> <strong>Explanation:</strong>
> 2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
> 7 is a candidate, and 7 = 7.
> These are the only two combinations.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> candidates = [2,3,5], target = 8
> <strong>Output:</strong> [[2,2,2,2],[2,3,3],[3,5]]
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> candidates = [2], target = 1
> <strong>Output:</strong> []
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> candidates = [1], target = 1
> <strong>Output:</strong> [[1]]
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> candidates = [1], target = 2
> <strong>Output:</strong> [[1,1]]
> </pre>
> 
> **Constraints:**
> 
> * `1 <= candidates.length <= 30`
> * `1 <= candidates[i] <= 200`
> * All elements of `candidates` are **distinct**.
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
