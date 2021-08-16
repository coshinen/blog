---
layout: post
title:  "LeetCode 18. 四数之和（中等）"
date:   2020-04-04 10:44:16 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers Sorting
---
> 给定一个 `n` 个整数的数组 `nums`，返回*一个包含所有**唯一的**四元组 `[nums[a], nums[b], nums[c], nums[d]]`* 如下：
> 
> * `0 <= a, b, c, d < n`
> * `a`，`b`，`c` 和 `d` 是**唯一的**。
> * `nums[a] + nums[b] + nums[c] + nums[d] == target`
> 
> 你可以以**任何顺序**返回答案。
> 
> **限制条件：**
> 
> * `1 <= nums.length <= 200`
> * <code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code>
> * <code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code>

## 解决方案

### 方法一：排序 + 四指针

与求三数之和类似，在其基础上加了一个指针，同时也多了一层循环。

```cpp
class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> result;
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int left = j + 1;
                int right = n - 1;
                while (left < right) {
                    int sum = nums[i] + nums[j] + nums[left] + nums[right];
                    if (sum < target) {
                        while (left < right && nums[left] == nums[++left]);
                    } else if (sum > target) {
                        while (left < right && nums[right] == nums[--right]);
                    } else {
                        result.push_back({nums[i], nums[j], nums[left], nums[right]});
                        while (left < right && nums[left] == nums[++left]);
                        while (left < right && nums[right] == nums[--right]);
                    }
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>3</sup>)。
  三层循环。
* 空间复杂度：*O*(1)。

## 参考链接

* [4Sum - LeetCode](https://leetcode.com/problems/4sum/){:target="_blank"}
