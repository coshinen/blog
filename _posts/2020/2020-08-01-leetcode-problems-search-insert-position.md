---
layout: post
title:  "LeetCode 35. 搜索插入位置 简单"
date:   2020-08-01 07:28:48 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Array Binary-Search
excerpt: 给定一个有序数组和一个目标值，如果找到目标值则返回其索引。如果没找到，返回其按顺序插入的索引。
---
> ## 35. Search Insert Position | Easy
> 
> Given a sorted array and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
> 
> You may assume no duplicates in the array.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> [1,3,5,6], 5
> <strong>Output:</strong> 2
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> [1,3,5,6], 2
> <strong>Output:</strong> 1
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> [1,3,5,6], 7
> <strong>Output:</strong> 4
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> [1,3,5,6], 0
> <strong>Output:</strong> 0
> </pre>

## 解决方案

### 方法一：二分搜索（Binary Search）

问题可转换成在有序数组中找到首个大于等于目标值的下标。

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int n = nums.size();
        int left = 0, right = n - 1, result = n;
        while (left <= right) {
            int mid = (right - left) / 2 + left;
            if (target <= nums[mid]) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result;
    }
};
```

STL 实现：

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        return lower_bound(nums.begin(), nums.end(), target) - nums.begin();
    }
};
```

复杂度分析：
* 时间复杂度：_O_(log n)，n 为数组大小。
* 空间复杂度：_O_(1)。

## 参考链接

* [Search Insert Position - LeetCode](https://leetcode.com/problems/search-insert-position/){:target="_blank"}
* [std::lower_bound - cppreference.com](https://en.cppreference.com/w/cpp/algorithm/lower_bound){:target="_blank"}
