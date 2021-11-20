---
layout: post
title:  "LeetCode 103. 二叉树锯齿形层序遍历（中等）"
date:   2021-11-20 20:14:06 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Tree Breadth-First-Search Binary-Tree
---
> 给定一个二叉树的 `root`，返回*其节点值的锯齿形层序遍历*。（即，从左到右，接着下一层从右到左，然后交替进行）
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg" style="width: 277px; height: 302px;">
> 
> **限制条件：**
> 
> * 该树中节点数在范围 `[0, 2000]` 里。
> * `-100 <= Node.val <= 100`

## 解决方案

### 方法一：广度优先搜索

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
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> ret;
        if (root == nullptr) return ret; queue<TreeNode*> que; que.push(root);
        bool isLtoR = true;
        while (!que.empty()) {
            deque<int> dque;
            int size = que.size();
            for (int i = 0; i < size; i++) {
                auto node = que.front();
                que.pop();
                if (isLtoR) dque.push_back(node->val);
                else dque.push_front(node->val);
                if (node->left) que.push(node->left);
                if (node->right) que.push(node->right);
            }
            ret.emplace_back(vector<int>{dque.begin(), dque.end()});
            isLtoR = !isLtoR;
        }
        return ret;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为二叉树的节点数。
* 空间复杂度：*O*(n)。
  存储每层节点的队列和用于头尾插入的双端队列。

## 参考链接

* [Binary Tree Zigzag Level Order Traversal - LeetCode](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/){:target="_blank"}
