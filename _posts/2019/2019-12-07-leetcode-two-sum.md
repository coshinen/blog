---
layout: post
title:  "LeetCode 1. 两数之和（简单）"
date:   2019-12-07 12:37:30 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Hash-Table
---
> 给定一个整型数组，返回两个数的**下标**，使两数之和等于一个指定的目标值。
> 
> 你可以假设每个输入正好对应一个解决方案，并且你不能使用同一个元素两次。
> 
> <details>
> <summary>提示 1</summary>
> 一个非常暴力的方法是搜索所有可能的数组对，但太慢了。
> 再次强调，为了完整起见，最好尝试暴力方案。
> 从暴力方案中你可以拿出优化方案。
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 所以，如果我们确定其中的一个数组，比如说
> <pre>x</pre>
> ，我们必须扫描整个数组才能找到下一个数字
> <pre>y</pre>
> 等于
> <pre>value - x</pre>
> 其中 value 是输入参数。
> 我们能否改变我们的数组以至搜索速度更快？
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 第二个思路是，在不改变数组的情况下，我们能以某种方式使用额外的空间吗？
> 比如一个哈希映射用来加速搜索？
> </details>

## 解决方案

### 方法一：暴力

遍历数组的每个元素 x，然后查找数组中是否存在一个值和 target - x 相等的元素。

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> vec(2);
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[j] == target - nums[i]) {
                    vec[0] = i;
                    vec[1] = j;
                }
            }
        }
        return vec;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n<sup>2</sup>)。
  双层循环，对每个元素都要遍历数组中的其他元素。
* 空间复杂度：*O*(1)。

### 方法二：一遍哈希表

遍历数组的每个元素 x，通过一张哈希表保存查询过的元素和其下标，然后查找表中是否存在一个值和 target - x 相等的元素。

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> umap;
        vector<int> vec;
        for (int i = 0; i < nums.size(); i++) {
            if (umap.find(target - nums[i]) != umap.end()) {
                vec.push_back(umap[target - nums[i]]);
                vec.push_back(i);
                break;
            } else {
                umap[nums[i]] = i;
            }
        }
        return vec;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  哈希表的查找速度为 *O*(1)，这样只需要遍历数组一次。
* 空间复杂度：*O*(n)。
  哈希表所需的空间小于等于数组元素个数，最多存储 n 个元素，**空间换时间**。

## 参考链接

* [Two Sum - LeetCode](https://leetcode.com/problems/two-sum/){:target="_blank"}
