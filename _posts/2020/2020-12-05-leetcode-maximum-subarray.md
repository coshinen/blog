---
layout: post
title:  "LeetCode 53. 最大子数组（简单）"
date:   2020-12-05 07:37:33 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Divide-and-Conquer Dynamic-Programming
---
> 给定一个整数数组 `nums`，找到具有最大和的连续子数组（至少包含一个数）并返回*它的和*。
> 
> 一个**子数组**是一个数组的**连续**部分。
> 
> **限制条件：**
> 
> * <code>1 <= nums.length <= 2 * 10<sup>4</sup></code>
> * <code>-2<sup>31</sup> <= nums[i] <= 2<sup>31</sup> - 1</code>
> 
> **补充：**如果你已经找到了 `O(n)` 的解决方案，尝试用分治法编写另一个解决方案，这更微妙。

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
