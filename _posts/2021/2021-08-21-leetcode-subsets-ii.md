---
layout: post
title:  "LeetCode 90. 子集 II（中等）"
date:   2021-08-21 20:22:02 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking Bit-Manipulation
---
> 给定一个可能含重复元素的整型数组 `nums`，返回*所有可能的子集（幂集）*。
> 
> 该解决方案集合**必须不**含重复的子集。
> 可以**任何顺序**返回解决方案。
> 
> **限制条件：**
> 
> * `1 <= nums.length <= 10`
> * `-10 <= nums[i] <= 10`

## 解决方案

### 方法一：递归

```cpp
class Solution {
private:
    vector<int> path;
    vector<vector<int>> result;

    void dfs(vector<int>& nums, int start, bool choosePrv) {
        if (start == nums.size()) {
            result.push_back(path);
            return;
        }
        dfs(nums, start + 1, false);
        if (!choosePrv && start > 0 && nums[start - 1] == nums[start]) return;
        path.push_back(nums[start]);
        dfs(nums, start + 1, true);
        path.pop_back();
    }

public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        dfs(nums, 0, false);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n x 2<sup>n</sup>)。
  n 为数组的大小，回溯共 2<sup>n</sup> 条路径，每条路径耗时 *O*(n)。
* 空间复杂度：*O*(n)。
  递归栈空间和结果数组的空间。

## 参考链接

* [Subsets II - LeetCode](https://leetcode.com/problems/subsets-ii/){:target="_blank"}
