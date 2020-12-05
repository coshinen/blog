---
layout: post
title:  "LeetCode 53. 最大子数组 简单"
date:   2020-12-05 07:37:33 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Array Divide-and-Conquer Dynamic-Programming
excerpt: 给定一个整数数组 `nums`，找到具有最大和的连续子数组（至少包含一个数）并返回*它的和*。
---
> ## 53. Maximum Subarray
> 
> Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return *its sum*.
> 
> **Follow up:** If you have figured out the `O(n)` solution, try coding another solution using the **divide and conquer** approach, which is more subtle.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> nums = [-2,1,-3,4,-1,2,1,-5,4]
> <strong>Output:</strong> 6
> <strong>Explanation:</strong> [4,-1,2,1] has the largest sum = 6.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> nums = [1]
> <strong>Output:</strong> 1
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> nums = [0]
> <strong>Output:</strong> 0
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> nums = [-1]
> <strong>Output:</strong> -1
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> nums = [-2147483647]
> <strong>Output:</strong> -2147483647
> </pre>
>  
> **Constraints:**
> 
> * <code>1 <= nums.length <= 2 * 10<sup>4</sup></code>
> * <code>-2<sup>31</sup> <= nums[i] <= 2<sup>31</sup> - 1</code>

## 解决方案

### 方法一：动态规划

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int pre = 0, maxRet = nums[0];
        for (const auto &num: nums) {
            pre = max(pre + num, num);
            maxRet = max(maxRet, pre);
        }
        return maxRet;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Maximum Subarray - LeetCode](https://leetcode.com/problems/maximum-subarray/){:target="_blank"}
