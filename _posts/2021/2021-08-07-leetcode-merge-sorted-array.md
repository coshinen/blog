---
layout: post
title:  "LeetCode 88. 合并有序数组（简单）"
date:   2021-08-07 11:46:22 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Two-Pointers Sorting
---
> 给你两个整型数组 `nums1` 和 `nums2`，按**非降序**排列，和连个整数 `m` 和 `n`，分别表示 `nums1` 和 `nums2` 的元素数。
> 
> **合并** `nums1` 和 `nums2` 为一个按**非降序**排列的数组。
> 
> 最终的有序数组不应该通过函数返回，而是*存储在数组* `nums1`。
> 为了容纳结果，`nums1` 的长度为 `m + n`，前面的 `m` 表示待合并的元素，后面的 `n` 已置 `0` 并被忽略。
> `nums2` 的长度为 `n`。
> 
> **限制条件：**
> 
> * `nums1.length == m + n`
> * `nums2.length == n`
> * `0 <= m, n <= 200`
> * `1 <= m + n <= 200`
> * <code>-10<sup>9</sup> <= nums1[i], nums2[j] <= 10<sup>9</sup></code>
> 
> **进阶：**
> 你能想出一个在 `O(m + n)` 时间内运行的算法吗？
> 
> <details>
> <summary>提示 1</summary>
> 如果你一次只考虑两个元素，而不是两个数组，你就可以轻松解决该问题。
> 我们知道每个单独的数组都是排过序的。
> 我们不知道的是他们如果合并在一起。
> 我们能做出局部决策并得出最优解吗？
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 如果每次只从两个数组中考虑一个元素并做出决定后进行处理，你将得到最优解。
> </details>

## 解决方案

### 方法一：合并+排序

```cpp
class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        for (int i = 0; i < n; i++) nums1[m + i] = nums2[i];
        sort(nums1.begin(), nums1.end());
    }
};
```

复杂度分析：
* 时间复杂度：*O*((m + n)log(m + n))。
* 空间复杂度：*O*(log(m + n))。

## 参考链接

* [Merge Sorted Array - LeetCode](https://leetcode.com/problems/merge-sorted-array/){:target="_blank"}
