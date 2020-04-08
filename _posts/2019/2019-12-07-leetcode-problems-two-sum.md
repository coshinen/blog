---
layout: post
title:  "LeetCode 1. 两数之和 简单"
date:   2019-12-07 12:37:30 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode
excerpt: 从一个整型数组中找出两个数，满足两数之和等于给定的目标值，并返回它们的下标。
---
## 1. Two Sum | Easy

> Given an array of integers, return **indices** of the two numbers such that they add up to a specific target.
> 
> You may assume that each input would have **exactly** one solution, and you may not use the same element twice.
> 
> **Example:**
> 
> Given nums = [2, 7, 11, 15], target = 9,
> 
> Because nums[0] + nums[1] = 2 + 7 = 9,
> return [0, 1].
> 
> Hint 1
> 
> A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.
> 
> Hint 2
> 
> So, if we fix one of the numbers, say
> x
> , we have to scan the entire array to find the next number
> y
> which is
> value - x
> where value is the input parameter. Can we change our array somehow so that this search becomes faster?
> 
> Hint 3
> 
> The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?

## 问题分析

从一个整型数组中找出两个数，满足两数之和等于给定的目标值，并返回它们的下标。

## 解决方案

### 方法一：暴力（Brute Force）

遍历数组的每个元素 x，然后查找数组中是否存在一个值和 target - x 相等的元素。

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> vec(2);
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[j] == target - nums[i]) {
                    vec[0] = i;
                    vec[1] = j;
                }
            }
        }
        return vec;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n^2)。双层循环，对每个元素都要遍历数组中的其他元素。
* 空间复杂度：_O_(1)。

### 方法二：一遍哈希表（One-pass Hash Table）

遍历数组的每个元素 x，通过一张哈希表保存查询过的元素和其下标，然后查找表中是否存在一个值和 target - x 相等的元素。

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> umap;
        vector<int> vec;
        for (int i = 0; i < nums.size(); i++) {
            if (umap.find(target - nums[i]) != umap.end()) {
                vec.push_back(umap[target - nums[i]]);
                vec.push_back(i);
                break;
            } else {
                umap[nums[i]] = i;
            }
        }
        return vec;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)。哈希表的查找速度为 _O_(1)，这样只需要遍历数组一次。
* 空间复杂度：_O_(n)。哈希表所需的空间小于等于数组元素个数，最多存储 n 个元素，**空间换时间**。

## 参考链接

* [Two Sum - LeetCode](https://leetcode.com/problems/two-sum/){:target="_blank"}
* [mistydew/leetcode](https://github.com/mistydew/leetcode){:target="_blank"}
