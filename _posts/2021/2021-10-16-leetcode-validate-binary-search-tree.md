---
layout: post
title:  "LeetCode 98. 验证二叉搜索树（中等）"
date:   2021-10-16 20:02:51 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Tree Depth-First-Search Binary-Search-Tree Binary-Tree
---
> 给定一个二叉树的 `root`，*确定它是否为有效的二叉搜索树（BST）*。
> 
> 一个**有效的 BST** 通过下面确定：
> 
> * 一个节点的左子树仅包含**小于**该节点值的节点。
> * 一个节点的右子树仅包含**大于**该节点值的节点。
> * 左右子树都必须是二叉搜索树。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/12/01/tree1.jpg" style="width: 302px; height: 182px;">
> 
> **限制条件：**
> 
> * 树中节点数在范围 <code>[1, 10<sup>4</sup>]</code> 里。
> * <code>-2<sup>31</sup> <= Node.val <= 2<sup>31</sup> - 1</code>

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
    bool helper(TreeNode* root, long long lower, long long upper) {
        if (root == nullptr) return true;
        if (root->val <= lower || root->val >= upper) return false;
        return helper(root->left, lower, root->val) && helper(root->right, root->val, upper);
    }

public:
    bool isValidBST(TreeNode* root) {
        return helper(root, LONG_MIN, LONG_MAX);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉树的节点数。
* 空间复杂度：*O*(n)。

### 方法二：中序遍历

二叉搜索树的中序遍历，节点值一定是升序排列的。

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
    bool isValidBST(TreeNode* root) {
        stack<TreeNode*> stack;
        long long inorder = (long long)INT_MIN - 1;
        while (!stack.empty() || root != nullptr) {
            while (root != nullptr) {
                stack.push(root);
                root = root->left;
            }
            root = stack.top();
            stack.pop();
            if (root->val <= inorder) return false;
            inorder = root->val;
            root = root->right;
        }
        return true;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。

## 参考链接

* [Validate Binary Search Tree - LeetCode](https://leetcode.com/problems/validate-binary-search-tree/){:target="_blank"}
