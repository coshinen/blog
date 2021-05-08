---
layout: post
title:  "LeetCode 75. 颜色分类（中等）"
date:   2021-05-08 20:00:08 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers Sort
excerpt:
  给定一个含红色、白色和蓝色的 `n` 个对象的数组 `nums`，对它们[原地](https://baike.baidu.com/item/原地算法){:target="_blank"}排序，使相同颜色的元素相邻，并按红色、白色和蓝色的顺序排序。<br>
  我们使用整数 `0`、`1` 和 `2` 分别表示红色、白色和蓝色。
---
> ## 75. Sort Colors
> 
> Given an array `nums` with `n` objects colored red, white, or blue, sort them
> [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}
> so that objects of the same color are adjacent, with the colors in the order
> red, white, and blue.
> 
> We will use the integers `0`, `1`, and `2` to represent the color red, white,
> and blue, respectively.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> nums = [2,0,2,1,1,0]
> <strong>Output:</strong> [0,0,1,1,2,2]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> nums = [2,0,1]
> <strong>Output:</strong> [0,1,2]
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> nums = [0]
> <strong>Output:</strong> [0]
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> nums = [1]
> <strong>Output:</strong> [1]
> </pre>
> 
> **Constraints:**
> 
> * `n == nums.length`
> * `1 <= n <= 300`
> * `nums[i]` is `0`, `1`, or `2`.
> 
> **Follow up:**
> 
> * Could you solve this problem without using the library's sort function?
> * Could you come up with a one-pass algorithm using only `O(1)` constant
> space?
> 
> <details>
> <summary>Hint 1</summary>
> A rather straight forward solution is a two-pass algorithm using counting
> sort.
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> Iterate the array counting number of 0's, 1's, and 2's.
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Overwrite array with the total number of 0's, then 1's and followed by 2's.
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
