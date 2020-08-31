---
layout: post
title:  "LeetCode 34. 在有序数组中查找元素的首个和最后一个位置 中等"
date:   2020-07-25 18:34:53 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Binary-Search
excerpt: 给定一个升序排列的整型数组 `nums`，找出一个给定目标值 `target` 的起始和结束位置。
---
> ## 34. Find First and Last Position of Element in Sorted Array
> 
> Given an array of integers `nums` sorted in ascending order, find the starting and ending position of a given `target` value.
> 
> Your algorithm's runtime complexity must be in the order of O(log n).
> 
> If the target is not found in the array, return `[-1, -1]`.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> nums = [5,7,7,8,8,10], target = 8
> <strong>Output:</strong> [3,4]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> nums = [5,7,7,8,8,10], target = 6
> <strong>Output:</strong> [-1,-1]
> </pre>
> 
> **Constraints:**
> 
> * `0 <= nums.length <= 10^5`
> * `-10^9 <= nums[i] <= 10^9`
> * `nums` is a non decreasing array.
> * `-10^9 <= target <= 10^9`

## 解决方案

### 方法一：线性扫描（Linear Scan）

```cpp
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        vector<int> result = {-1, -1};
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] == target) {
                result[0] = i;
                break;
            }
        }
        if (result[0] == -1) return result;
        for (int i = nums.size() - 1; i >= 0; i--) {
            if (nums[i] == target) {
                result[1] = i;
                break;
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)，n 为数组 nums 的大小。
* 空间复杂度：*O*(1)。

此方法的时间复杂度不满足题目要求的 *O*(log n)，因为给定数组是有序的，所以可以使用二分法搜索指定元素。

### 方法二：二分搜索（Binary Search）

```cpp
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        auto begin = lower_bound(nums.begin(), nums.end(), target);
        auto end = upper_bound(nums.begin(), nums.end(), target);
        if (begin == end) return {-1, -1};
        return {(int)(begin - nums.begin()), (int)(end - nums.begin() - 1)};
    }
};
```

复杂度分析：
* 时间复杂度：*O*(log n)，n 为数组 nums 的大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Find First and Last Position of Element in Sorted Array - LeetCode](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/){:target="_blank"}
* [std::lower_bound - cppreference.com](https://en.cppreference.com/w/cpp/algorithm/lower_bound){:target="_blank"}
* [std::upper_bound - cppreference.com](https://en.cppreference.com/w/cpp/algorithm/upper_bound){:target="_blank"}
