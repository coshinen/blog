---
layout: post
title:  "LeetCode 15. 三数之和（中等）"
date:   2020-03-14 20:05:49 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers
excerpt:
  给定一个含 n 个整数的数组 `nums`，数组 `nums` 是否存在元素 a，b，c 使得 a + b + c = 0？
  找出给定数组中和为零的所有不重复的三元组。<br>
  **注：**解决方案必须不含重复的三元组。
---
> ## 15. 3Sum
> 
> Given an array `nums` of n integers, are there elements a, b, c in `nums` such
> that a + b + c = 0? Find all unique triplets in the array which gives the sum
> of zero.
> 
> **Note:**
> 
> The solution set must not contain duplicate triplets.
> 
> **Example:**
> 
> <pre>
> Given array nums = [-1, 0, 1, 2, -1, -4],
> 
> A solution set is:
> [
>   [-1, 0, 1],
>   [-1, -1, 2]
> ]
> </pre>
> 
> <details>
> <summary>Hint 1</summary>
> So, we essentially need to find three numbers x, y, and z such that they add
> up to the given value. If we fix one of the numbers say x, we are left with
> the two-sum problem at hand!
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> For the two-sum problem, if we fix one of the numbers, say
> <pre>x</pre>
> , we have to scan the entire array to find the next number
> <pre>y</pre>
> which is
> <pre>value - x</pre>
> where value is the input parameter. Can we change our array somehow so that
> this search becomes faster?
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> The second train of thought for two-sum is, without changing the array, can we
> use additional space somehow? Like maybe a hash map to speed up the search?
> </details>

## 解决方案

### 方法一：排序 + 三指针

与求两数之和类似。
先固定一个数，然后使用首尾两个指针遍历数组。

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> result;
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;
            int left = i + 1;
            int right = n - 1;
            if (i == 0 && nums[right] < 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) {
                    while (left < right && nums[left] == nums[++left]);
                } else if (sum > 0) {
                    while (left < right && nums[right] == nums[--right]);
                } else {
                    result.push_back({nums[i], nums[left], nums[right]});
                    while (left < right && nums[left] == nums[++left]);
                    while (left < right && nums[right] == nums[--right]);
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  双层循环。
* 空间复杂度：*O*(1)。

## 参考链接

* [3Sum - LeetCode](https://leetcode.com/problems/3sum/){:target="_blank"}
