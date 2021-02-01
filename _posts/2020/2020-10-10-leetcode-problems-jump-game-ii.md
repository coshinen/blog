---
layout: post
title:  "LeetCode 45. 跳跃游戏 II 困难"
date:   2020-10-10 20:13:19 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Array Greedy
excerpt: 给定一个非负整数数组，你最初位于数组的第一个位置。数组中的每个元素代表你在该位置可以跳跃的最大长度。你的目标是使用最少的跳跃次数抵达数组的最后一个位置。
---
> ## 45. Jump Game II
> 
> Given an array of non-negative integers, you are initially positioned at the
> first index of the array.
> 
> Each element in the array represents your maximum jump length at that
> position.
> 
> Your goal is to reach the last index in the minimum number of jumps.
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> [2,3,1,1,4]
> <strong>Output:</strong> 2
> <strong>Explanation:</strong> The minimum number of jumps to reach the last index is 2.
>     Jump 1 step from index 0 to 1, then 3 steps to the last index.
> </pre>
> 
> **Note:**
> 
> You can assume that you can always reach the last index.

## 解决方案

### 方法一：正向贪心查找可抵达的最大位置

```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int n = nums.size(), maxPos = 0, end = 0, step = 0;
        for (int i = 0; i < n - 1; i++) {
            if (maxPos >= i) {
                maxPos = max(maxPos, i + nums[i]);
                if (i == end) {
                    end = maxPos;
                    step++;
                }
            }
        }
        return step;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组长度。
* 空间复杂度：*O*(1)。

## 参考链接

* [Jump Game II - LeetCode](https://leetcode.com/problems/jump-game-ii/){:target="_blank"}
