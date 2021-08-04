---
layout: post
title:  "LeetCode 40. 组合总和 II（中等）"
date:   2020-09-05 08:25:08 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking
---
> 给定一个的候选数组 `candidates` 和一个目标数 `target`，找出 `candidates` 中所有使数字和为 `target` 的组合。
> 
> 数组 `candidates` 的每个数在组合中只能使用**一次**。
> 
> **注：**解决方案集合必须不含重复的组合。
> 
> **限制条件：**
> 
> * `1 <= candidates.length <= 100`
> * `1 <= candidates[i] <= 50`
> * `1 <= target <= 30`

## 解决方案

### 方法一：回溯

在上道题的基础上进行去重。

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

        for(int i = idx; i < candidates.size(); i++) {
            if(target - candidates[i] < 0) break;
            if(i > idx && candidates[i] == candidates[i - 1]) continue;
            tmp.push_back(candidates[i]);
            dfs(candidates, target - candidates[i], i + 1);
            tmp.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
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

* [Combination Sum II - LeetCode](https://leetcode.com/problems/combination-sum-ii/){:target="_blank"}
