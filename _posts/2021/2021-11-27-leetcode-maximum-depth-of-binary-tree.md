---
layout: post
title:  "LeetCode 104. 二叉树的最大深度（简单）"
date:   2021-11-27 20:08:48 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Tree Depth-First-Search Breadth-First-Search Binary-Tree
---
> 给定一个二叉树的 `root`，返回*其最大深度*。
> 
> 一个二叉树的**最大深度**是从根节点向下到最远的叶子节点经过的最长路径的节点数。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/26/tmp-tree.jpg" style="width: 400px; height: 277px;">
> 
> **限制条件：**
> 
> * 该树中节点数在范围 <code>[0, 10<sup>4</sup>]</code> 里。
> * `-100 <= Node.val <= 100`

## 解决方案

### 方法一：深度优先搜索

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
    int maxDepth(TreeNode* root) {
        if (root == nullptr) return 0;
        return max(maxDepth(root->left), maxDepth(root->right)) + 1;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉树的节点数。
* 空间复杂度：*O*(1)。

### 方法二：广度优先搜索

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
    int maxDepth(TreeNode* root) {
        if (root == nullptr) return 0;
        queue<TreeNode*> que;
        que.push(root);
        int ret = 0;
        while (!que.empty()) {
            int size = que.size();
            while (size > 0) {
                TreeNode* node = que.front();
                que.pop();
                if (node->left) que.push(node->left);
                if (node->right) que.push(node->right);
                size--;
            }
            ret++;
        }
        return ret;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。

## 参考链接

* [Maximum Depth of Binary Tree - LeetCode](https://leetcode.com/problems/maximum-depth-of-binary-tree/){:target="_blank"}
