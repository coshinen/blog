---
layout: post
title:  "LeetCode 15. 三数之和（中等）"
date:   2020-03-14 20:05:49 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Two-Pointers Sorting
---
> 给定一个整数数组 `nums`，返回所有 `i != j`、`i != k`、`j != k` 且 `nums[i] + nums[j] + nums[k] == 0` 这样的三元组 `[nums[i], nums[j], nums[k]]`。
> 
> 注意该解决方案不能包含重复的三元组。
> 
> **限制条件：**
> 
> * `0 <= nums.length <= 3000`
> * <code>-10<sup>5</sup> <= nums[i] <= 10<sup>5</sup></code>
> 
> <details>
> <summary>提示 1</summary>
> 所以，我们基本上需要找到三个加起来等于给定的值的数 x、y 和 z。
> 如果我们固定其中一个数，如 x，那么我们就剩下两数之和的问题了！
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 对于两数之和问题，如果我们固定其中一个数，如
> <pre>x</pre>
> ，那么我们就必须扫描整个数组才能找到下一个数
> <pre>y</pre>
> 等于
> <pre>value - x</pre>
> 其中值为输入参数。
> 我们能否可以通过某种方式更改数组，使搜索速度更快？
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 两数之和的第二个思路是，在不改变数组的情况下，我们能否以某种方式使用额外的空间？
> 比如用哈希映射来加速搜索？
> </details>

## 解决方案

### 方法一：排序 + 三指针

与求两数之和类似。
先固定一个数，然后使用首尾两个指针遍历数组。

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> result;
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;
            int left = i + 1;
            int right = n - 1;
            if (i == 0 && nums[right] < 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) {
                    while (left < right && nums[left] == nums[++left]);
                } else if (sum > 0) {
                    while (left < right && nums[right] == nums[--right]);
                } else {
                    result.push_back({nums[i], nums[left], nums[right]});
                    while (left < right && nums[left] == nums[++left]);
                    while (left < right && nums[right] == nums[--right]);
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  双层循环。
* 空间复杂度：*O*(1)。

## 参考链接

* [3Sum - LeetCode](https://leetcode.com/problems/3sum/){:target="_blank"}
