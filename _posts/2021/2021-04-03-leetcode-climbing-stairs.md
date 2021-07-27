---
layout: post
title:  "LeetCode 70. 爬楼梯（简单）"
date:   2021-04-03 17:54:23 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Dynamic-Programming
---
> 你正在爬一个楼梯。
> 需要 `n` 阶才能到达顶楼。
> 
> 每次你可以爬 `1` 或 `2` 阶。
> 你有多少种不同的方法可以到达顶楼？
> 
> **限制条件：**
> 
> * `1 <= n <= 45`
> 
> <details>
> <summary>提示 1</summary>
> 为了到第 n 步，你之前的步骤是什么？（想想步子的大小）
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
