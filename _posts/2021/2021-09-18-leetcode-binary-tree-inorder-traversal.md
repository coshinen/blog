---
layout: post
title:  "LeetCode 94. 二叉树中序遍历（简单）"
date:   2021-09-18 20:02:20 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Stack Tree Depth-First-Search Binay-Tree
---
> 给定一个二叉树的 `root`，返回*它节点值的中序遍历*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/09/15/inorder_1.jpg" style="width: 202px; height: 324px;">
> 
> **限制条件：**
> 
> * 该树的节点数在范围 `[0, 100]` 里。
> * `-100 <= Node.val <= 100`
> 
> **进阶：**递归方案很简单，你能使用迭代解决它吗？

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
    void inorder(vector<int>& result, TreeNode* root) {
        if (root == NULL) return;
        inorder(result, root->left);
        result.push_back(root->val);
        inorder(result, root->right);
    }

public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> result;
        inorder(result, root);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉树的节点数。
* 空间复杂度：*O*(n)。
  递归栈的深度。

### 方法二：迭代（模拟栈）

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
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> result;
        stack<TreeNode*> stk;
        while (root != nullptr || !stk.empty()) {
            while (root != nullptr) {
                stk.push(root);
                root = root->left;
            }
            root = stk.top();
            stk.pop();
            result.push_back(root->val);
            root = root->right;
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。

## 参考链接

* [Binay Tree Inorder Traversal - LeetCode](https://leetcode.com/problems/binary-tree-inorder-traversal/){:target="_blank"}
