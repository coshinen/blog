---
layout: post
title:  "LeetCode 16. 最接近的三数之和（中等）"
date:   2020-03-21 18:41:18 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers Sorting
---
> 给定一个长度 `n` 的整数数组 `nums` 和一个整数 `target`，在 `nums` 中找到最接近 `target` 的三整数之和。
> 
> 返回*三整数之和*。
> 
> 你可以假定每组输入只有一个结果。
> 
> **限制条件：**
> 
> * `3 <= nums.length <= 1000`
> * `-1000 <= nums[i] <= 1000`
> * <code>-10<sup>4</sup> <= target <= 10<sup>4</sup></code>

## 解决方案

### 方法一：排序 + 三指针

与三数之和不同的是这里求的是三数之和与目标值的最小距离。

```cpp
class Solution {
public:
    int threeSumClosest(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        int result = nums[0] + nums[1] + nums[2];
        for (int i = 0; i < n - 2; i++) {
            int begin = i + 1;
            int end = n - 1;
            while (begin < end) {
                int sum = nums[i] + nums[begin] + nums[end];
                if (abs(sum - target) < abs(result - target)) result = sum;
                if (sum < target) {
                    begin++;
                } else if (sum > target) {
                    end--;
                } else {
                    return result;
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  排序时间消耗为 *O*(n log n)，双层循环。
* 空间复杂度：*O*(1)。

## 参考链接

* [3Sum Closest - LeetCode](https://leetcode.com/problems/3sum-closest/){:target="_blank"}
