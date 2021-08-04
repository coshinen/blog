---
layout: post
title:  "LeetCode 39. 组合总和（中等）"
date:   2020-08-29 08:07:06 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking
---
> 给定一个无重复的整数数组 `candidates` 和一个目标整数 `target`，返回*一个所有**唯一的候选组合**的列表，其中所选的 `candidates` 之和为 `target`*。
> 你可以按**任何顺序**返回组合。
> 
> **同一**数字可以从 `candidates` 中**无限次**选出。
> 如果所选数字中至少一个的频率不同，则两个组合是唯一的。
> 
> 对于给定的输入，**保证**总和达到 `target` 的唯一组合数少于 `150` 个组合。
> 
> **限制条件：**
> 
> * `1 <= candidates.length <= 30`
> * `1 <= candidates[i] <= 200`
> * `candidates` 的所有元素是**互不相同的**。
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
