---
layout: post
title:  "LeetCode 4. 两个有序数组的中位数（困难）"
date:   2019-12-28 10:03:47 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Array Binary-Search Divide-and-Conquer
excerpt:
  这里是两个大小分别为 m 和 n 的有序数组 **nums1** 和 **nums2**。<br>
  找出两个有序数组的中位数。
  整个运行时间复杂度应该为 O(log (m+n))。<br>
  你可以假设 **nums1** 和 **nums2** 不都是空。
---
> ## 4. Median of Two Sorted Arrays
> 
> There are two sorted arrays **nums1** and **nums2** of size m and n
> respectively.
> 
> Find the median of the two sorted arrays. The overall run time complexity
> should be O(log (m+n)).
> 
> You may assume **nums1** and **nums2** cannot be both empty.
> 
> **Example 1:**
> 
> <pre>
> nums1 = [1, 3]
> nums2 = [2]
> 
> The median is 2.0
> </pre>
> 
> **Example 2:**
> 
> <pre>
> nums1 = [1, 2]
> nums2 = [3, 4]
> 
> The median is (2 + 3)/2 = 2.5
> </pre>

## 解决方案

### 方法一：二分查找

```cpp
class Solution {
private:
    int getKthElement(const vector<int>& nums1, const vector<int>& nums2, int k) {
        int m = nums1.size();
        int n = nums2.size();
        int idx1 = 0, idx2 = 0;
        while (true) {
            if (idx1 == m) return nums2[idx2 + k - 1];
            if (idx2 == n) return nums1[idx1 + k - 1];
            if (k == 1) return min(nums1[idx1], nums2[idx2]);
            
            int newIdx1 = min(idx1 + k / 2 - 1, m - 1);
            int newIdx2 = min(idx2 + k / 2 - 1, n - 1);
            int pivot1 = nums1[newIdx1];
            int pivot2 = nums2[newIdx2];
            if (pivot1 <= pivot2) {
                k -= newIdx1 - idx1 + 1;
                idx1 = newIdx1 + 1;
            } else {
                k -= newIdx2 - idx2 + 1;
                idx2 = newIdx2 + 1;
            }
        }
    }

public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        int totalLen = nums1.size() + nums2.size();
        if (totalLen % 2 == 1) {
            return getKthElement(nums1, nums2, (totalLen + 1) / 2);
        } else {
            return (getKthElement(nums1, nums2, totalLen / 2) + getKthElement(nums1, nums2, totalLen / 2 + 1)) / 2.0;
        }
    }
};
```

复杂度分析：
* 时间复杂度：*O*(log(m + n))。
* 空间复杂度：*O*(1)。

## 参考链接

* [Median of Two Sorted Arrays - LeetCode](https://leetcode.com/problems/median-of-two-sorted-arrays/){:target="_blank"}
