---
layout: post
title:  "LeetCode 33. 搜索旋转有序数组 中等"
date:   2020-07-18 09:17:04 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Array Binary-Search
excerpt: 假设一个升序数组在你预先未知的某个点上进行了旋转。
---
> ## 33. Search in Rotated Sorted Array | Medium
> 
> Suppose an array sorted in ascending order is rotated at some pivot unknown to you beforehand.
> 
> (i.e., `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`).
> 
> You are given a target value to search. If found in the array return its index, otherwise return `-1`.
> 
> You may assume no duplicate exists in the array.
> 
> Your algorithm's runtime complexity must be in the order of _O_(log n).
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> nums = [4,5,6,7,0,1,2], target = 0
> <strong>Output:</strong> 4
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> nums = [4,5,6,7,0,1,2], target = 3
> <strong>Output:</strong> -1
> </pre>

## 解决方案

### 方法一：二分搜索（Binary Search）

要求时间复杂度为 _O_(log n)，所以要使用二分法进行搜索。

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size();
        if (!n) return -1;
        if (n == 1) return nums[0] == target ? 0 : -1;
        int left = 0, right = n - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            if (nums[0] <= nums[mid]) {
                if (nums[0] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[n - 1]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(log n)，n 为数组 nums 的大小。
* 空间复杂度：_O_(1)。

## 参考链接

* [Search in Rotated Sorted Array - LeetCode](https://leetcode.com/problems/search-in-rotated-sorted-array/){:target="_blank"}
