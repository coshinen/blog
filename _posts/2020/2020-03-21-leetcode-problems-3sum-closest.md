---
layout: post
title:  "LeetCode 16. 最接近的三数之和 中等"
date:   2020-03-21 18:41:18 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers
excerpt: 给定一个含 n 个整数的数组 `nums` 和一个整数 `target`，在数组 `nums` 中找出三个和最接近 `target` 的整数。返回三个之和。你可以假定每组输入只有一个结果。
---
> ## 16. 3Sum Closest
> 
> Given an array `nums` of n integers and an integer `target`, find three integers in `nums` such that the sum is closest to `target`. Return the sum of the three integers. You may assume that each input would have exactly one solution.
> 
> **Example:**
> 
> <pre>
> Given array nums = [-1, 2, 1, -4], and target = 1.
> 
> The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).
> </pre>

## 解决方案

### 方法一：排序 + 三指针

与三数之和不同的是这里求的是三数之和与目标值的最小距离。

```cpp
class Solution {
public:
    int threeSumClosest(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        int result = nums[0] + nums[1] + nums[2];
        for (int i = 0; i < n - 2; i++) {
            int begin = i + 1;
            int end = n - 1;
            while (begin < end) {
                int sum = nums[i] + nums[begin] + nums[end];
                if (abs(sum - target) < abs(result - target)) result = sum;
                if (sum < target) {
                    begin++;
                } else if (sum > target) {
                    end--;
                } else {
                    return result;
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  排序时间消耗为 *O*(n log n)，双层循环。
* 空间复杂度：*O*(1)。

## 参考链接

* [3Sum Closest - LeetCode](https://leetcode.com/problems/3sum-closest/){:target="_blank"}
