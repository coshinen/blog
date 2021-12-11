---
layout: post
title:  "LeetCode 106. 从中序和后序遍历构造二叉树（中等）"
date:   2021-12-11 20:02:40 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Hash-Table Divide-and-conquer Tree Binary-Tree
---
> 给定两个整型数组 `inorder` 和 `postorder`，`inorder` 是一棵二叉树的中序遍历，`postorder` 是同一棵二叉树的后序遍历，构造并返回*该二叉树*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/02/19/tree.jpg" style="width: 277px; height: 302px;">
> 
> **限制条件：**
> 
> * `1 <= inorder.length <= 3000`
> * `postorder.length == inorder.length`
> * `-3000 <= inorder[i], postorder[i] <= 3000`
> * `inorder` 和 `postorder` 由**唯一**的值组成。
> * `postorder` 的每个值也出现在 `inorder` 里。
> * `inorder` 已**确保**是该树的中序遍历。
> * `postorder` 已**确保**是该树的后序遍历。

## 解决方案

### 方法一：迭代

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
    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
        if (postorder.size() == 0) return nullptr;
        TreeNode* root = new TreeNode(postorder[postorder.size() - 1]);
        stack<TreeNode*> stk;
        stk.push(root);
        int inIdx = inorder.size() - 1;
        for (int i = postorder.size() - 2; i >= 0; i--) {
            int postVal = postorder[i];
            TreeNode* node = stk.top();
            if (node->val != inorder[inIdx]) {
                node->right = new TreeNode(postVal);
                stk.push(node->right);
            } else {
                while (!stk.empty() && stk.top()->val == inorder[inIdx]) {
                    node = stk.top();
                    stk.pop();
                    --inIdx;
                }
                node->left = new TreeNode(postVal);
                stk.push(node->left);
            }
        }
        return root;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉树的节点数。
* 空间复杂度：*O*(n)。

## 参考链接

* [Costruct Binary Tree from Inorder and Postorder Traversal - LeetCode](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/){:target="_blank"}
