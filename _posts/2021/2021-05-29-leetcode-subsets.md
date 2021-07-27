---
layout: post
title:  "LeetCode 78. 子集（中等）"
date:   2021-05-29 08:03:07 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking Bit-Manipulation
---
> 给定一个每个元素都**互不相同**的整型数组 `nums`，返回*所有可能的子集（幂集）*。
> 
> 解集**不能**包含重复的子集。按**任意顺序**返回结果。
> 
> **限制条件：**
> 
> * `1 <= nums.length <= 10`
> * `-10 <= nums[i] <= 10`
> * `nums` 中的所有数字是**互不相同的**。

## 解决方案

### 方法一：递归

```cpp
class Solution {
private:
    vector<int> path;
    vector<vector<int>> result;

    void dfs(vector<int>& nums, int start) {
        if (start == nums.size()) {
            result.push_back(path);
            return;
        }
        path.push_back(nums[start]);
        dfs(nums, start + 1);
        path.pop_back();
        dfs(nums, start + 1);
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        dfs(nums, 0);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(nx2<sup>n</sup>)。
  n 为数组的大小，回溯共 2<sup>n</sup> 条路径，每条路径耗时 *O*(n)。
* 空间复杂度：*O*(n)。
  递归栈空间和结果数组的空间。

## 参考链接

* [Subsets - LeetCode](https://leetcode.com/problems/subsets/){:target="_blank"}
