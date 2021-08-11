---
layout: post
title:  "LeetCode 26. 移除有序数组的重复项（简单）"
date:   2020-05-30 08:09:21 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Two-Pointers
---
> 给定一个按**非降序**排列的整数数组 `nums`，[原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}移除重复元素使每个元素只出现**一次**。
> 元素的**相对顺序**应该保持**不变**。
> 
> 由于在某些语言中无法更改数组的长度，因此必须把结果放在数组 `nums` 的**前面部分**。
> 更正式地说，如果删除重复项后有 `k` 个元素，那么 `nums` 的前 `k` 个元素应该保存最终结果。
> 除了前 `k` 个元素外，剩下的不重要。
> 
> 返回 `k` *前把最终结果放入 `nums` 的前 `k` 个插槽*。
> 
> **不要**为其他数组开辟额外的空间。
> 为此你必须使用 O(1) 的额外内存[原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}**修改输入数组**。
> 
> **定制评判：**
> 
> 评判将使用下面代码测试你的解决方案：
> 
> <pre>
> int[] nums = [...]; // Input array
> int[] expectedNums = [...]; // The expected answer with correct length
> 
> int k = removeDuplicates(nums); // Calls your implementation
> 
> assert k == expectedNums.length;
> for (int i = 0; i < k; i++) {
>     assert nums[i] == expectedNums[i];
> }
> </pre>
> 
> 如果所有测试通过，那么你的解决方案将**被接受**。
> 
> **限制条件：**
> 
> * <code>0 <= nums.length <= 3 * 10<sup>4</sup></code>
> * `-100 <= nums[i] <= 100`
> * `nums` 是按**非降序**排列的。
> 
> <details>
> <summary>提示 1</summary>
> 在该问题中，需要关注的关键点是正在排序的输入数组。
> 就重复元素而言，当对给定数组进行排序时，它们在数组中的位置是什么？
> 请看下面的图片寻找答案。
> 如果我们知道其中一个元素的位置，我们是否也知道所有重复元素的位置？<br>
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_rem_dup.png" width="500">
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 我们需要原地修改数组，最终数组的大小可能会小于输入数组的大小。
> 因此，我们应该在这里使用双指针法。
> 一个，用于跟踪原始数组中的当前元素，另一个用于跟踪唯一的元素。
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 本质上，一旦遇到一个元素，你只需<b>绕过</b>它的重复项后移动到下一个唯一的元素。
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
