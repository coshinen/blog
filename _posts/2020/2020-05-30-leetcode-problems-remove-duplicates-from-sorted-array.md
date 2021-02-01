---
layout: post
title:  "LeetCode 26. 移除有序数组的重复项 简单"
date:   2020-05-30 08:09:21 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Array Two-Pointers
excerpt: 给定一个有序数组，[原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}移除重复元素使每个元素只出现一次并返回新数组的长度。
---
> ## 26. Remove Duplicates from Sorted Array
> 
> Given a sorted array nums, remove the duplicates [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}
> such that each element appear only once and return the new length.
> 
> Do not allocate extra space for another array, you must do this by **modifying
> the input array** [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}
> with O(1) extra memory.
> 
> **Example 1:**
> 
> <pre>
> Given <em>nums</em> = <strong>[1,1,2]</strong>,
> 
> Your function should return length = <strong>2</strong>, with the first two elements of <em>nums</em> being <strong>1</strong> and <strong>2</strong> respectively.
> 
> It doesn't matter what you leave beyond the returned length.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> Given <em>nums</em> = <strong>[0,0,1,1,1,2,2,3,3,4]</strong>,
> 
> Your function should return length = <strong>5</strong>, with the first five elements of <em>nums</em> being modified to <strong>0</strong>, <strong>1</strong>, <strong>2</strong>, <strong>3</strong>, and <strong>4</strong> respectively.
> 
> It doesn't matter what values are set beyond the returned length.
> </pre>
> 
> **Clarification:**
> 
> Confused why the returned value is an integer but your answer is an array?
> 
> Note that the input array is passed in by <strong>reference</strong>, which
> means modification to the input array will be known to the caller as well.
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
> <details>
> <summary>Hint 1</summary>
> In this problem, the key point to focus on is the input array being sorted. As
> far as duplicate elements are concerned, what is their positioning in the
> array when the given array is sorted? Look at the image above for the answer.
> If we know the position of one of the elements, do we also know the
> positioning of all the duplicate elements?<br>
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_rem_dup.png" width="500">
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> We need to modify the array in-place and the size of the final array would
> potentially be smaller than the size of the input array. So, we ought to use a
> two-pointer approach here. One, that would keep track of the current element
> in the original array and another one for just the unique elements.
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Essentially, once an element is encountered, you simply need to <b>bypass</b>
> its duplicates and move on to the next unique element.
> </details>

## 解决方案

### 方法一：双指针

使用快慢两个指针，快指针用于跳过重复项，慢指针用于确定快指针指向的非重复项复制到重复项的位置。

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.size() == 0) return 0;
        int slow = 0;
        for (int fast = 1; fast < nums.size(); fast++) {
            if (nums[fast] != nums[slow]) {
                nums[++slow] = nums[fast];
            }
        }
        return slow + 1;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组的大小，快慢指针最多遍历 n 步。
* 空间复杂度：*O*(1)。
  快慢指针。

## 参考链接

* [Remove Duplicates from Sorted Array - LeetCode](https://leetcode.com/problems/remove-duplicates-from-sorted-array/){:target="_blank"}
