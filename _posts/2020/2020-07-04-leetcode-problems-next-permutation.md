---
layout: post
title:  "LeetCode 31. 下一个排列 中等"
date:   2020-07-04 08:31:19 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Array
excerpt: 实现**下一个排列**，把数字重排成字典序中下一个更大的数字排列。
---
> ## 31. Next Permutation | Medium
> 
> Implement **next permutation**, which rearranges numbers into the lexicographically next greater permutation of numbers.
> 
> If such arrangement is not possible, it must rearrange it as the lowest possible order (ie, sorted in ascending order).
> 
> The replacement must be [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"} and use only constant extra memory.
> 
> Here are some examples. Inputs are in the left-hand column and its corresponding outputs are in the right-hand column.
> 
> `1,2,3` → `1,3,2`<br>
> `3,2,1` → `1,2,3`<br>
> `1,1,5` → `1,5,1`

## 解决方案

### 方法一：一遍扫描（Single Pass）

思路如下：
1. 从下标 n - 1 到 0 中，找出首个 nums[i - 1] < nums[i]。
2. 从下标 n - 1 到 i 中，找出首个 >= nums[i - 1] 的元素后进行交换。
3. 反转子数组 nums[i, n - 1]。

其中第 2，3 步可以交换。

1. 从下标 n - 1 到 0 中，找出首个 nums[i - 1] < nums[i]。
2. 反转子数组 nums[i, n - 1]。
3. 从下标 i 到 n - 1 中，找出首个 >= nums[i - 1] 的元素后进行交换。

```cpp
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int pos = nums.size() - 1;
        while (pos > 0 && nums[pos] <= nums[pos - 1]) --pos;
        reverse(nums.begin() + pos, nums.end());
        if (pos > 0) {
            auto iter = upper_bound(nums.begin() + pos, nums.end(), nums[pos - 1]);
            swap(*iter, nums[pos - 1]);
        }
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，STL 中的 `upper_bound` 使用二分查找，时间复杂度为 _O_(log n)。
* 空间复杂度：_O_(1)，原地替换。

## 参考链接

* [Next Permutation - LeetCode](https://leetcode.com/problems/next-permutation/){:target="_blank"}
* [std::next_permutation - cppreference.com](https://en.cppreference.com/w/cpp/algorithm/next_permutation){:target="_blank"}
