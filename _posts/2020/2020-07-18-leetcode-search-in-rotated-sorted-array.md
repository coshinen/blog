---
layout: post
title:  "LeetCode 33. 搜索旋转有序数组（中等）"
date:   2020-07-18 09:17:04 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Binary-Search
---
> 这里是一个按升序排列的整形数组 `nums`（都是**互不相同的**值）。
> 
> 在传递函数之前，`nums` 在未知的下标 `k` (`0 <= k < nums.length`) 上**进行了旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（**下标从 0 开始**）。
> 例如，`[0,1,2,4,5,6,7]` 在下标 `3` 旋转后可能变为 `[4,5,6,7,0,1,2,4]`。
> 
> 给定的旋转**后**的数组 `nums` 和一个整数 `target`，如果 `nums` 中存在 `target`，则返回其索引，否则返回 `-1`。
> 
> 你必须写一个 `O(log n)` 时间复杂度的算法。
> 
> **限制条件：**
> 
> * `1 <= nums.length <= 5000`
> * <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>
> * `nums` 中的所有值都是**独一无二的**。
> * 已确保 `nums` 在某个下标上进行了旋转。
> * <code>-10<sup>4</sup> <= target <= 10<sup>4</sup></code>

## 解决方案

### 方法一：二分搜索

要求时间复杂度为 *O*(log n)，所以要使用二分法进行搜索。

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size();
        if (!n) return -1;
        if (n == 1) return nums[0] == target ? 0 : -1;
        int left = 0, right = n - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            if (nums[0] <= nums[mid]) {
                if (nums[0] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[n - 1]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(log n)。
  n 为数组 nums 的大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Search in Rotated Sorted Array - LeetCode](https://leetcode.com/problems/search-in-rotated-sorted-array/){:target="_blank"}
