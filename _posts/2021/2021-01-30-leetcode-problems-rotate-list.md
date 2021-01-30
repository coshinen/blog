---
layout: post
title:  "LeetCode 61. 旋转链表 中等"
date:   2021-01-30 15:49:07 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Linked-List Two-Pointers
excerpt: 给定一条以 `head` 为首的链表，向右旋转该链表 `k` 个位置。
---
> ## 61. Rotate List
> 
> Given the `head` of a linked list, rotate the list to the right by `k` places.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/rotate1.jpg" style="width: 600px; height: 254px;">
> 
> <pre>
> <strong>Input:</strong> head = [1,2,3,4,5], k = 2
> <strong>Output:</strong> [4,5,1,2,3]
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/roate2.jpg" style="width: 472px; height: 542px;">
> 
> <pre>
> <strong>Input:</strong> head = [0,1,2], k = 4
> <strong>Output:</strong> [2,0,1]
> </pre>
> 
> **Constraints:**
> 
> * The number of nodes in the list is in the range `[0, 500]`.
> * `-100 <= Node.val <= 100`
> * <code>0 <= k <= 2 * 10<sup>9</sup></code>

## 解决方案

### 方法一：衔接后再断开

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k) {
        if (head == NULL || head->next == NULL) return head;
        ListNode *tail = head;
        int n;
        for (n = 1; tail->next != NULL; n++)
            tail = tail->next;
        tail->next = head;
        ListNode *newTail = head;
        for (int i = 0; i < n - k % n - 1; i++)
            newTail = newTail->next;
        ListNode *newHead = newTail->next;
        newTail->next = NULL;
        return newHead;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为链表节点的数量。
* 空间复杂度：*O*(1)。

## 参考链接

* [Rotate List - LeetCode](https://leetcode.com/problems/rotate-list/){:target="_blank"}
