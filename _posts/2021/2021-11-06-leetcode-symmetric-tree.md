---
layout: post
title:  "LeetCode 101. 对称二叉树（简单）"
date:   2021-11-06 21:16:08 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Tree Depth-First-Search Breadth-Search-Tree Binary-Tree
---
> 给定一个二叉树的 `root`，检查它是否为自身的镜像（即，围绕其中心对称）。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/02/19/symtree1.jpg" style="width: 354px; height: 291px;">
> 
> **限制条件：**
> 
> * 该树中节点数在范围 `[1, 1000]` 里。
> * `-100 <= Node.val <= 100`
> 
> **进阶：**
> 你能使用递归和迭代解决它吗？

## 解决方案

### 方法一：递归

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
    bool check(TreeNode* left, TreeNode* right) {
        if (left == nullptr && right == nullptr) return true;
        if (left == nullptr || right == nullptr) return false;
        return left->val == right->val && check(left->left, right->right) && check(left->right, right->left);
    }

public:
    bool isSymmetric(TreeNode* root) {
        return check(root, root);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。
  n 为节点数，递归层数不超过 n。

## 参考链接

* [Symmetric Tree - LeetCode](https://leetcode.com/problems/symmetric-tree/){:target="_blank"}
