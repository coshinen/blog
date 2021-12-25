---
layout: post
title:  "LeetCode 108. 把有序数组转换为二叉搜索树（简单）"
date:   2021-12-25 20:00:58 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Array Divide-and-Conquer Tree Binary-Search-Tree Binary-Tree
---
> 给定一个元素按**升序**排列的整型数组 `nums`，把*它转换为一棵**高度平衡的**二叉搜索树*。
> 
> 一棵**高度平衡的**二叉树是每个节点的两棵子树的深度只差一的二叉树。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/02/18/btree1.jpg" style="width: 302px; height: 222px;">
> 
> **限制条件：**
> 
> * <code>1 <= nums.length <= 10<sup>4</sup></code>
> * <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>
> * `nums` 是按**严格递增**顺序排列的。

## 解决方案

### 方法一：中序遍历

```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
private:
    TreeNode* helper(vector<int>& nums, int left, int right) {
        if (left > right) return nullptr;
        int mid = (left + right) / 2;
        TreeNode* root = new TreeNode(nums[mid]);
        root->left = helper(nums, left, mid - 1);
        root->right = helper(nums, mid + 1, right);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return helper(nums, 0, nums.size() - 1);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为数组长度。
* 空间复杂度：*O*(logn)。
  递归栈深度为 *O*(logn)。

## 参考链接

* [Convert Sorted Array to Binary Search Tree - LeetCode](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/){:target="_blank"}
