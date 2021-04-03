---
layout: post
title:  "LeetCode 70. 爬楼梯 简单"
date:   2021-04-03 17:54:23 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Dynamic-Programming
excerpt:
  你正在爬一个楼梯。
  需要 `n` 阶才能到达顶楼。<br>
  每次你可以爬 `1` 或 `2` 阶。
  你有多少种不同的方法可以到达顶楼？
---
> ## 70. Climbing Stairs
> 
> You are climbing a staircase. It takes `n` steps to reach the top.
> 
> Each time you can either climb `1` or `2` steps. In how many distinct ways can
> you climb to the top?
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> n = 2
> <strong>Output:</strong> 2
> <strong>Explanation:</strong> There are two ways to climb to the top.
> 1. 1 step + 1 step
> 2. 2 steps
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> n = 3
> <strong>Output:</strong> 3
> <strong>Explanation:</strong> There are three ways to climb to the top.
> 1. 1 step + 1 step + 1 step
> 2. 1 step + 2 steps
> 3. 2 steps + 1 step
> </pre>
> 
> **Constraints:**
> 
> * `1 <= n <= 45`
> 
> <details>
> <summary>Hint 1</summary>
> To reach nth step, what could have been your previous steps? (Think about the
> step sizes)
> </details>

## 解决方案

### 方法一：动态规划

转移方程：`f(x) = f(x - 1) + f(x - 2)`

```cpp
class Solution {
public:
    int climbStairs(int n) {
        int dp[46] = {0};
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。
  动态数组所用空间大小。

### 方法二：动态规划 + 滚动数组（斐波那契数）

```cpp
class Solution {
public:
    int climbStairs(int n) {
        int first = 0, second = 0, third = 1;
        for (int i = 1; i <= n; i++) {
            first = second;
            second = third;
            third = first + second;
        }
        return third;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Climbing Stairs - LeetCode](https://leetcode.com/problems/climbing-stairs/){:target="_blank"}
