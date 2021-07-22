---
layout: post
title:  "LeetCode 81. 搜索旋转有序数组II（中等）"
date:   2021-06-19 16:39:26 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Binary-Search
---
> 这里是一个按非降序排列的整形数组 `nums`（不一定是**互不相同的**值）。
> 
> 在传递函数之前，`nums` 在未知的下标 `k` (`0 <= k < nums.length`) 上**进行了旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（**下标从 0 开始**）。
> 例如，`[0,1,2,4,4,4,5,6,6,7]` 在下标 `5` 旋转后可能变为 `[4,5,6,6,7,0,1,2,4,4]`。
> 
> 给定的旋转**后**的数组 `nums` 和一个整数 `target`，如果 `nums` 中存在 `target`，则返回 `true`，否则返回 `false`。
> 
> 你必须尽可能减少整个操作步骤。
> 
> **限制条件：**
> 
> * `1 <= nums.length <= 5000`
> * <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>
> * 已确保 `nums` 在某个下标上进行了旋转。
> * <code>-10<sup>4</sup> <= target <= 10<sup>4</sup></code>
> 
> **进阶：**
> 这个问题类似于搜索已旋转的有序数组，但 `nums` 可能包含**重复项**。
> 这会影响运行时复杂度吗？如何以及为何？

## 解决方案

### 方法一：二分搜索

```cpp
class Solution {
public:
    bool search(vector<int>& nums, int target) {
        int n = nums.size();
        if (n == 0) return false;
        if (n == 1) return nums[0] == target;
        int left = 0, right = n - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return true;
            if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
                left++;
                right--;
            } else if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return false;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组 nums 的大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Search in Rotated Sorted Array II - LeetCode](https://leetcode.com/problems/search-in-rotated-sorted-array-ii/){:target="_blank"}
