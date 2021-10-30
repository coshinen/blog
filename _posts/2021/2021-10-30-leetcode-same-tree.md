---
layout: post
title:  "LeetCode 100. 相同的树（简单）"
date:   2021-10-30 20:00:07 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Tree Depth-First-Search Binary-Search-Tree Binary-Tree
---
> 给定两个二叉树的根 `p` 和 `q`，写一个检查它们是否相同的函数。
> 
> 两二叉树如果结构相同，并且节点具有相同的值就认为它们是相同的。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/12/20/ex2.jpg" style="width: 382px; height: 182px;">
> 
> **限制条件：**
> 
> * 两树中节点数在范围 `[0, 100]` 里。
> * <code>-10<sup>4</sup> <= Node.val <= 10<sup>4</sup></code>

## 解决方案

### 方法一：深度优先搜索（递归）

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
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (p == nullptr && q == nullptr) return true;
        else if (p == nullptr || q == nullptr) return false;
        else if (p->val != q->val) return false;
        else return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(min(m, n))。
  m 和 n 为两二叉树的节点数。
* 空间复杂度：*O*(min(m, n))。

## 参考链接

* [Same Tree - LeetCode](https://leetcode.com/problems/same-tree/){:target="_blank"}
