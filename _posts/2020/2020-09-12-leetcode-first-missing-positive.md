---
layout: post
title:  "LeetCode 41. 首个缺失的正数（困难）"
date:   2020-09-12 17:08:02 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Array
---
> 给定一个无序的整型数组 `nums`，找出缺失的最小正整数。
> 
> 你必须实现一个运行时间为 `O(n)` 并使用常数级额外空间的算法。
> 
> **限制条件：**
> 
> * <code>1 <= nums.length <= 5 * 10<sup>5</sup></code>
> * <code>-2<sup>31</sup> <= nums[i] <= 2<sup>31</sup> - 1</code>
> 
> <details>
> <summary>提示 1</summary>
> 想想你如何用非常数空间解决该问题。
> 你能把这个逻辑应用到现有的空间吗？
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 我们不关心重复或非正整数
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 记住 O(2n) = O(n)
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
