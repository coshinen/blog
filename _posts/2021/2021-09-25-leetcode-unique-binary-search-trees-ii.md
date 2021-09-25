---
layout: post
title:  "LeetCode 95. 不同的二叉搜索树 II（中等）"
date:   2021-09-25 20:26:11 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Dynamic-Programming Backtracking Tree Binary-Search-Tree Binary-Tree
---
> 给定一个整数 `n`，返回*所有结构不同的**二叉搜索树**，其中 `n` 个不同的节点值从 `1` 到 `n`*。
> 以**任意顺序**返回答案。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/18/uniquebstn3.jpg" style="width: 600px; height: 148px;">
> 
> **限制条件：**
> 
> * `1 <= n <= 8`

## 解决方案

### 方法一：回溯

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
    vector<TreeNode*> generateTrees(int start, int end) {
        if (start > end) return {nullptr};
        vector<TreeNode*> allTrees;
        for (int i = start; i <= end; i++) {
            vector<TreeNode*> leftTrees = generateTrees(start, i - 1);
            vector<TreeNode*> rightTrees = generateTrees(i + 1, end);
            for (auto& left: leftTrees) {
                for (auto& right: rightTrees) {
                    TreeNode* currTree = new TreeNode(i);
                    currTree->left = left;
                    currTree->right = right;
                    allTrees.emplace_back(currTree);
                }
            }
        }
        return allTrees;
    }

public:
    vector<TreeNode*> generateTrees(int n) {
        if (n == 0) return {};
        return generateTrees(1, n);
    }
};
```

复杂度分析：
* 时间复杂度：*O*(4<sup>n</sup> / n<sup>3 / 2</sup>)。
* 空间复杂度：*O*(4<sup>n</sup> / n<sup>1 / 2</sup>)。

## 参考链接

* [Unique Binary Search Trees II - LeetCode](https://leetcode.com/problems/unique-binary-search-trees-ii/){:target="_blank"}
