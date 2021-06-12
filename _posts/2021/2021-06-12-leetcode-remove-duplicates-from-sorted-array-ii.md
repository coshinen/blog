---
layout: post
title:  "LeetCode 80. 从有序数组中删除重复项II（中等）"
date:   2021-06-12 10:13:17 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers
excerpt:
  给定一个有序数组 *nums*，[原地](http://baike.baidu.com/item/原地算法){:target="_blank"}删除重复项使每项最多出现两次并返回新长度。<br>
  不要开辟额外的数组空间；你必须[原地](http://baike.baidu.com/item/原地算法){:target="_blank"}**修改输入数组**并使用 O(1) 的额外空间。
---
> ## 80. Remove Duplicates from Sorted Array II
> 
> Given a sorted array *nums*, remove the duplicates [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}
> such that duplicates appeared at most twice and return the new length.
> 
> Do not allocate extra space for another array; you must do this by **modifying
> the input array** [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}
> with O(1) extra memory.
> 
> **Clarification:**
> 
> Confused why the returned value is an integer, but your answer is an array?
> 
> Note that the input array is passed in by **reference**, which means a
> modification to the input array will be known to the caller.
> 
> Internally you can think of this:
> 
> <pre>
> // <strong>nums</strong> is passed in by reference. (i.e., without making a copy)
> int len = removeDuplicates(nums);
> 
> // any modification to <strong>nums</strong> in your function would be known by the caller.
> // using the length returned by your function, it prints the first <strong>len</strong> elements.
> for (int i = 0; i < len; i++) {
>     print(nums[i]);
> }
> </pre>
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> nums = [1,1,1,2,2,3]
> <strong>Output:</strong> 5, nums = [1,1,2,2,3]
> <strong>Explanation:</strong> Your function should return length = <strong>5</strong>, with the first five elements of nums being <strong>1, 1, 2, 2</strong> and <strong>3</strong> respectively. It doesn't matter what you leave beyond the returned length.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> nums = [0,0,1,1,1,1,2,3,3]
> <strong>Output:</strong> 7, nums = [0,0,1,1,2,3,3]
> <strong>Explanation:</strong> Your function should return length = <strong>7</strong>, with the first seven elements of nums being modified to <strong>0, 0, 1, 1, 2, 3</strong> and <strong>3</strong> respectively. It doesn't matter what values are set beyond the returned length.
> </pre>
> 
> **Constraints:**
> 
> * <code>1 <= nums.length <= 3 * 10<sup>4</sup></code>
> * <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>
> * `nums` is sorted in ascending order.

## 解决方案

### 方法一：双指针

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int n = nums.size();
        if (n <= 2) return n;
        int slow = 2, fast = 2;
        while (fast < n) {
            if (nums[slow - 2] != nums[fast]) {
                nums[slow] = nums[fast];
                slow++;
            }
            fast++;
        }
        return slow;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为输入数组的长度，只需遍历数组一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Remove Duplicates from Sorted Array II - LeetCode](https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/){:target="_blank"}
