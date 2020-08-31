---
layout: post
title:  "LeetCode 27. 移除元素 简单"
date:   2020-06-06 14:27:46 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy Array Two-Pointers
excerpt: 给定一个数组 *nums* 和一个值 *val*，[原地](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"}移除所有该数值的实例并返回新数组的长度。
---
> ## 27. Remove Element
> 
> Given an array *nums* and a value *val*, remove all instances of that value [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"} and return the new length.
> 
> Do not allocate extra space for another array, you must do this by **modifying the input array** [in-place](https://en.wikipedia.org/wiki/In-place_algorithm){:target="_blank"} with O(1) extra memory.
> 
> The order of elements can be changed. It doesn't matter what you leave beyond the new length.
> 
> **Example 1:**
> 
> <pre>
> Given <em>nums</em> = <strong>[3,2,2,3]</strong>, <em>val</em> = <strong>3</strong>,
> 
> Your function should return length = <strong>2</strong>, with the first two elements of <em>nums</em> being <strong>2</strong>.
> 
> It doesn't matter what you leave beyond the returned length.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> Given <em>nums</em> = <strong>[0,1,2,2,3,0,4,2]</strong>, <em>val</em> = <strong>2</strong>,
> 
> Your function should return length = <strong>5</strong>, with the first five elements of <em>nums</em> containing <strong>0</strong>, <strong>1</strong>, <strong>3</strong>, <strong>0</strong>, and <strong>4</strong>.
> 
> Note that the order of those five elements can be arbitrary.
> 
> It doesn't matter what values are set beyond the returned length.
> </pre>
> 
> **Clarification:**
> 
> Confused why the returned value is an integer but your answer is an array?
> 
> Note that the input array is passed in by **reference**, which means modification to the input array will be known to the caller as well.
> 
> Internally you can think of this:
> 
> <pre>
> // <strong>nums</strong> is passed in by reference. (i.e., without making a copy)
> int len = removeElement(nums, val);
> 
> // any modification to <strong>nums</strong> in your function would be known by the caller.
> // using the length returned by your function, it prints the first <strong>len</strong> elements.
> for (int i = 0; i < len; i++) {
>     print(nums[i]);
> }
> </pre>
> 
> <details>
> <summary>Hint 1</summary>
> The problem statement clearly asks us to modify the array in-place and it also says that the element beyond the new length of the array can be anything. Given an element, we need to remove all the occurrences of it from the array. We don't technically need to <b>remove</b> that element per-say, right?
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> We can move all the occurrences of this element to the end of the array. Use two pointers!<br>
> <img src="https://assets.leetcode.com/uploads/2019/10/20/hint_remove_element.png" width="500">
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> Yet another direction of thought is to consider the elements to be removed as non-existent. In a single pass, if we keep copying the visible elements in-place, that should also solve this problem for us.
> </details>

## 解决方案

### 方法一：双指针（Two Pointers）

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
* 时间复杂度：*O*(n)，假设数组共有 n 个元素，i 和 j 最多共移动 2n 步。
* 空间复杂度：*O*(1)。

### 方法二：双指针—当要删除的元素很少时（Two Pointers - when elements to remove are rare）

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
* 时间复杂度：*O*(n)，i 和 n 最多共移动 n 步。在该方法中，赋值操作的次数等于待删除元素的数量。所以如果待删除元素很少时效率会更高。
* 空间复杂度：*O*(1)。

## 参考链接

* [Remove Element - LeetCode](https://leetcode.com/problems/remove-element/){:target="_blank"}
