---
layout: post
title:  "LeetCode 89. 格雷码（中等）"
date:   2021-08-14 19:02:12 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Math Backtracking Bit-Manipulation
---
> 一个 **n 位格雷码序列**是 <code>2<sup>n</sup></code> 个整数的序列：
> 
> * 每个整数都**包含**在范围 <code>[0, 2<sup>n</sup> - 1]</code> 内，
> * 首个整数是 `0`，
> * 一个整数在序列中**最多出现一次**，
> * 每对**相邻**整数的二进制表示**正好相差一位**，而且，
> * **首个**和**最后一个**整数的二进制表示形式**正好相差一位**。
> 
> 给定一个整数 `n`，返回*任何有效的 **n 位格雷码序列***。
> 
> **限制条件：**
> 
> * `1 <= n <= 16`

## 解决方案

### 方法一：套公式

格雷码公式：`i ^ i / 2` 即 `i ^ i >> 1`。

```cpp
class Solution {
public:
    vector<int> grayCode(int n) {
        vector<int> result;
        int pow2n = 1 << n;
        for (int i = 0; i < pow2n; i++) result.push_back(i ^ i >> 1);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(2<sup>n</sup>)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Gray Code - LeetCode](https://leetcode.com/problems/gray-code/){:target="_blank"}
