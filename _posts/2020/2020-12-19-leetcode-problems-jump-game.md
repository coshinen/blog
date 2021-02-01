---
layout: post
title:  "LeetCode 55. 跳跃游戏 中等"
date:   2020-12-19 13:08:05 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Greedy
excerpt: 给定一个非负整数数组，你最初位于数组的第一个位置。数组中的每个元素代表你在该位置跳跃的最大长度。判断你是否能够到达最后一个位置。
---
> ## 55. Jump Game
> 
> Given an array of non-negative integers, you are initially positioned at the
> first index of the array.
> 
> Each element in the array represents your maximum jump length at that
> position.
> 
> Determine if you are able to reach the last index.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> nums = [2,3,1,1,4]
> <strong>Output:</strong> true
> <strong>Explanation:</strong> Jump 1 step from index 0 to 1, then 3 steps to the last index.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> nums = [3,2,1,0,4]
> <strong>Output:</strong> false
> <strong>Explanation:</strong> You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.
> </pre>
>  
> **Constraints:**
> 
> * `1 <= nums.length <= 3 * 10^4`
> * `0 <= nums[i][j] <= 10^5`

## 解决方案

### 方法一：贪心

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size();
        int maxLen = 0;
        for (int i = 0; i < n; i++) {
            if (i <= maxLen) {
                maxLen = max(maxLen, i + nums[i]);
                if (maxLen >= n - 1) return true;
            }
        }
        return false;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Jump Game - LeetCode](https://leetcode.com/problems/jump-game/){:target="_blank"}
