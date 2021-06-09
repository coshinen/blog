---
layout: post
title:  "LeetCode 18. 四数之和（中等）"
date:   2020-04-04 10:44:16 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Hash-Table Two-Pointers
excerpt:
  给定一个含 n 个整数的数组 `nums` 和一个整数 `target`，`nums` 中是否存在 a、b、c 和 d 使 a + b + c + d = `target`？
  找出数组中所有不重复且和为 `target` 的四元组。<br>
  **注：**解决方案必须不含重复的四元组。
---
> ## 18. 4Sum
> 
> Given an array `nums` of n integers and an integer `target`, are there
> elements a, b, c, and d in `nums` such that a + b + c + d = `target`? Find all
> unique quadruplets in the array which gives the sum of `target`.
> 
> **Note:**
> 
> The solution set must not contain duplicate quadruplets.
> 
> **Example:**
> 
> <pre>
> Given array nums = [1, 0, -1, 0, -2, 2], and target = 0.
> 
> A solution set is:
> [
>   [-1,  0, 0, 1],
>   [-2, -1, 1, 2],
>   [-2,  0, 0, 2]
> ]
> </pre>

## 解决方案

### 方法一：排序 + 四指针

与求三数之和类似，在其基础上加了一个指针，同时也多了一层循环。

```cpp
class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> result;
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int left = j + 1;
                int right = n - 1;
                while (left < right) {
                    int sum = nums[i] + nums[j] + nums[left] + nums[right];
                    if (sum < target) {
                        while (left < right && nums[left] == nums[++left]);
                    } else if (sum > target) {
                        while (left < right && nums[right] == nums[--right]);
                    } else {
                        result.push_back({nums[i], nums[j], nums[left], nums[right]});
                        while (left < right && nums[left] == nums[++left]);
                        while (left < right && nums[right] == nums[--right]);
                    }
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>3</sup>)。
  三层循环。
* 空间复杂度：*O*(1)。

## 参考链接

* [4Sum - LeetCode](https://leetcode.com/problems/4sum/){:target="_blank"}
