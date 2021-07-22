---
layout: post
title:  "LeetCode 80. 从有序数组中删除重复项II（中等）"
date:   2021-06-12 10:13:17 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers
---
> 给定一个有序数组 *nums*，[原地](http://baike.baidu.com/item/原地算法){:target="_blank"}删除重复项使每项最多出现两次并返回新长度。
> 
> 不要开辟额外的数组空间；你必须[原地](http://baike.baidu.com/item/原地算法){:target="_blank"}**修改输入数组**并使用 O(1) 的额外空间。
> 
> **限制条件：**
> 
> * <code>1 <= nums.length <= 3 * 10<sup>4</sup></code>
> * <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>
> * `nums` 是按升序排列的。

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
