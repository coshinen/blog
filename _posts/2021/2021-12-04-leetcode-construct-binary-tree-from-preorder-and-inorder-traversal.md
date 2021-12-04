---
layout: post
title:  "LeetCode 105. 从前序和中序遍历构造二叉树（中等）"
date:   2021-12-04 20:06:20 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Hash-Table Divide-and-conquer Tree Binary-Tree
---
> 给定两个整型数组 `preorder` 和 `inorder`，`preorder` 是一棵二叉树的前序遍历，`inorder` 是同一棵二叉树的中序遍历，构造并返回*该二叉树*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/02/19/tree.jpg" style="width: 277px; height: 302px;">
> 
> **限制条件：**
> 
> * `1 <= preorder.length <= 3000`
> * `inorder.length == preorder.length`
> * `-3000 <= preorder[i], inorder[i] <= 3000`
> * `preorder` 和 `inorder` 由**唯一**的值组成。
> * `inorder` 的每个值也出现在 `preorder` 里。
> * `preorder` 已**确保**是该树的前序遍历。
> * `inorder` 已**确保**是该树的中序遍历。

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
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if (preorder.size() == 0) return nullptr;
        TreeNode* root = new TreeNode(preorder[0]);
        stack<TreeNode*> stk;
        stk.push(root);
        int inIdx = 0;
        for (int i = 1; i < preorder.size(); i++) {
            int preVal = preorder[i];
            TreeNode* node = stk.top();
            if (node->val != inorder[inIdx]) {
                node->left = new TreeNode(preVal);
                stk.push(node->left);
            } else {
                while (!stk.empty() && stk.top()->val == inorder[inIdx]) {
                    node = stk.top();
                    stk.pop();
                    ++inIdx;
                }
                node->right = new TreeNode(preVal);
                stk.push(node->right);
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

* [Costruct Binary Tree from Preorder and Inorder Traversal - LeetCode](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/){:target="_blank"}
