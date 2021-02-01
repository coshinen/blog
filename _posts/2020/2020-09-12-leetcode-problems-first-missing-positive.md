---
layout: post
title:  "LeetCode 41. 首个缺失的正数 困难"
date:   2020-09-12 17:08:02 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Array
excerpt: 给定一个无序的整型数组，找出缺失的最小正整数。
---
> ## 41. First Missing Positive
> 
> Given an unsorted integer array, find the smallest missing positive integer.
> 
> **Example 1:**
> 
> <pre>
> Input: [1,2,0]
> Output: 3
> </pre>
> 
> **Example 2:**
> 
> <pre>
> Input: [3,4,-1,1]
> Output: 2
> </pre>
> 
> **Example 3:**
> 
> <pre>
> Input: [7,8,9,11,12]
> Output: 1
> </pre>
> 
> **Follow up:**
> 
> Your algorithm should run in *O*(n) time and uses constant extra space.
> 
> <details>
> <summary>Hint 1</summary>
> Think about how you would solve the problem in non-constant space. Can you
> apply that logic to the existing space?
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> We don't care about duplicates or non-positive integers
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Remember that O(2n) = O(n)
> </details>

## 解决方案

### 方法一：置换

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            while (nums[i] > 0 && nums[i] <= n && nums[i] != nums[nums[i] - 1]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组长度。
* 空间复杂度：*O*(1)。

### 方法二：哈希表

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int& num: nums) {
            if (num <= 0) {
                num = n + 1;
            }
        }
        for (int i = 0; i < n; i++) {
            int num = abs(nums[i]);
            if (num <= n) {
                nums[num - 1] = -abs(nums[num - 1]);
            }
        }
        for (int i = 0; i < n; i++) {
            if (nums[i] > 0) {
                return i + 1;
            }
        }
        return n + 1;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组长度。
* 空间复杂度：*O*(1)。

## 参考链接

* [First Missing Positive - LeetCode](https://leetcode.com/problems/first-missing-positive/){:target="_blank"}
