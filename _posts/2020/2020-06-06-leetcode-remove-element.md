---
layout: post
title:  "LeetCode 27. 移除元素（简单）"
date:   2020-06-06 14:27:46 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Two-Pointers
---
> 给定一个整数数组 `nums` 和一个整数 `val`，[原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}移除 `nums` 中出现的所有 `val`。
> 元素的相对顺序可以被改变。
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
> int val = ...; // Value to remove
> int[] expectedNums = [...]; // The expected answer with correct length.
>                             // It is sorted with no values equaling val.
> 
> int k = removeElement(nums, val); // Calls your implementation
> 
> assert k == expectedNums.length;
> sort(nums, 0, k); // Sort the first k elements of nums
> for (int i = 0; i < actualLength; i++) {
>     assert nums[i] == expectedNums[i];
> }
> </pre>
> 
> 如果所有测试通过，那么你的解决方案将**被接受**。
> 
> **限制条件：**
> 
> * `0 <= nums.length <= 100`
> * `0 <= nums[i] <= 50`
> * `0 <= val <= 100`
> 
> <details>
> <summary>提示 1</summary>
> 问题陈述清楚地要求我们在适当的位置修改数组，它还说超出数组的新长度的元素可以是任何东西。
> 给定一个元素，我们需要从数组中删除它的所有匹配项。
> 从技术上讲，我们不需要<b>移除</b>每个元素，对吗？
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 我们可以把该元素的所有存在移动到数组的末尾。
> 使用两个指针！<br>
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_remove_element.png" width="500">
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 然而另一个思考方向是考虑那些被移除的元素，因为它们不存在。
> 在一次过程中，如果我们继续在适当的位置复制可见元素，这也应该能为我们解决该问题。
> </details>

## 解决方案

### 方法一：双指针

```cpp
class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int i = 0;
        for(int j = 0; j < nums.size(); j++) {
            if (nums[j] != val) {
                nums[i] = nums[j];
                i++;
            }
        }
        return i;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  假设数组共有 n 个元素，i 和 j 最多共移动 2n 步。
* 空间复杂度：*O*(1)。

### 方法二：双指针—当待删元素很少时

```cpp
class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int i = 0;
        int n = nums.size();
        while (i < n) {
            if (nums[i] == val) {
                nums[i] = nums[n - 1];
                n--;
            } else {
                i++;
            }
        }
        return n;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  i 和 n 最多共移动 n 步，赋值操作的次数等于待删除元素的数量，所以如果待删除元素很少时效率会更高。
* 空间复杂度：*O*(1)。

## 参考链接

* [Remove Element - LeetCode](https://leetcode.com/problems/remove-element/){:target="_blank"}
