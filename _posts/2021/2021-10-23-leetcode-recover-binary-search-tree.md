---
layout: post
title:  "LeetCode 99. 恢复二叉搜索树（中等）"
date:   2021-10-23 20:46:03 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Tree Depth-First-Search Binary-Search-Tree Binary-Tree
---
> 给定一个二叉搜索树（BST）的 `root`，该树的两个节点的值被错误地交换。
> *不改变其结构恢复该树*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/28/recover1.jpg" style="width: 422px; height: 302px;">
> 
> **限制条件：**
> 
> * 树中节点数在范围 `[2, 1000]` 里。
> * <code>-2<sup>31</sup> <= Node.val <= 2<sup>31</sup> - 1</code>
> 
> **进阶：**
> 一个使用 `O(n)` 空间的解决方案非常的直接。
> 你能想出一个常数 `O(1)` 空间的解决方案吗？

## 解决方案

### 方法一：Morris 中序遍历

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
    void recoverTree(TreeNode* root) {
        TreeNode *x = nullptr, *y = nullptr, *pred = nullptr, *predecessor = nullptr;
        while (root != nullptr) {
            if (root->left != nullptr) {
                predecessor = root->left;
                while (predecessor->right != nullptr && predecessor->right != root) {
                    predecessor = predecessor->right;
                }
                if (predecessor->right == nullptr) {
                    predecessor->right = root;
                    root = root->left;
                } else {
                    if (pred != nullptr && root->val < pred->val) {
                        y = root;
                        if (x == nullptr) x = pred;
                    }
                    predecessor->right = nullptr;
                    pred = root;
                    root = root->right;
                }
            } else {
                if (pred != nullptr && root->val < pred->val) {
                    y = root;
                    if (x == nullptr) x = pred;
                }
                pred = root;
                root = root->right;
            }
        }
        swap(x->val, y->val);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉搜索树高度。
  Morris 遍历中每个节点被访问 2 次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Recover Binary Search Tree - LeetCode](https://leetcode.com/problems/recover-binary-search-tree/){:target="_blank"}
