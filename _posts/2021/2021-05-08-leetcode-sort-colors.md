---
layout: post
title:  "LeetCode 75. 颜色分类（中等）"
date:   2021-05-08 20:00:08 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers Sort
---
> 给定一个含红色、白色和蓝色的 `n` 个对象的数组 `nums`，对它们[原地](https://baike.baidu.com/item/原地算法){:target="_blank"}排序，使相同颜色的元素相邻，并按红色、白色和蓝色的顺序排序。
> 
> 我们使用整数 `0`、`1` 和 `2` 分别表示红色、白色和蓝色。
> 
> **限制条件：**
> 
> * `n == nums.length`
> * `1 <= n <= 300`
> * `nums[i]` 是 `0`、`1` 或 `2`。
> 
> **进阶：**
> 
> * 你能在不使用库的排序函数的情况下解决该问题吗？
> * 你能想出一个只用 `O(1)` 常数空间的一遍算法吗？
> 
> <details>
> <summary>提示 1</summary>
> 一个相当直接的解决方案是使用计数排序的两遍算法。
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 迭代计数 0、1 和 2 的数组。
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 覆盖数组使用总数 0，然后是 1 后跟 2。
> </details>

## 解决方案

### 方法一：双指针

```cpp
class Solution {
public:
    void sortColors(vector<int>& nums) {
        int n = nums.size();
        int p0 = 0, p2 = n - 1;
        for (int i = 0; i <= p2; i++) {
            while (nums[i] == 2 && i <= p2) {
                swap(nums[i], nums[p2]);
                p2--;
            }
            if (nums[i] == 0) {
                swap(nums[i], nums[p0]);
                p0++;
            }
        }
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组 `nums` 的大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Sort Colors - LeetCode](https://leetcode.com/problems/sort-colors/){:target="_blank"}
