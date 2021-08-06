---
layout: post
title:  "LeetCode 35. 搜索插入位置（简单）"
date:   2020-08-01 07:28:48 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Binary-Search
---
> 给定一个有序数组和一个目标值，如果找到目标值则返回其索引。
> 如果没找到，返回其按顺序插入的索引。
> 
> 你必须写一个 `O(log n)` 时间复杂度的算法。
> 
> **限制条件：**
> 
> * <code>1 <= nums.length <= 10<sup>4</sup></code>
> * <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>
> * `nums` 包含**互不相同的**已**按升序**排列的值。
> * <code>-10<sup>4</sup> <= target <= 10<sup>4</sup></code>

## 解决方案

### 方法一：二分搜索

问题可转换成在有序数组中找到首个大于等于目标值的下标。

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int n = nums.size();
        int left = 0, right = n - 1, result = n;
        while (left <= right) {
            int mid = (right - left) / 2 + left;
            if (target <= nums[mid]) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result;
    }
};
```

STL 实现：

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        return lower_bound(nums.begin(), nums.end(), target) - nums.begin();
    }
};
```

复杂度分析：
* 时间复杂度：*O*(log n)。
  n 为数组大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Search Insert Position - LeetCode](https://leetcode.com/problems/search-insert-position/){:target="_blank"}
* [std::lower_bound - cppreference.com](https://en.cppreference.com/w/cpp/algorithm/lower_bound){:target="_blank"}
