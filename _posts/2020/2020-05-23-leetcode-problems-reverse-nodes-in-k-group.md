---
layout: post
title:  "LeetCode 25. k 个一组反转节点 困难"
date:   2020-05-23 08:37:46 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Linked-List
excerpt: 给定一条链表，每次反转 k 个节点的子链表并返回修改后的链表。
---
> ## 25. Reverse Nodes in k-Group | Hard
> 
> Given a linked list, reverse the nodes of a linked list k at a time and return its modified list.
> 
> k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes in the end should remain as it is.
> 
> **Example:**
> 
> Given this linked list: `1->2->3->4->5`
> 
> For k = 2, you should return: `2->1->4->3->5`
> 
> For k = 3, you should return: `3->2->1->4->5`
> 
> **Note:**
> 
> * Only constant extra memory is allowed.
> * You may not alter the values in the list's nodes, only nodes itself may be changed.

## 解决方案

### 方法一：模拟

链表以 k 个节点为一组进行分组，最后一组若不足 k 个节点则不需要进行反转。

把每 k 个节点组成的子链表进行反转操作后，注意把反转后的子链表接入链表。

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
    pair<ListNode*, ListNode*> reverseGroup(ListNode* head, ListNode* tail) {
        ListNode *prev = tail->next;
        ListNode *tmp = head;
        while (prev != tail) {
            ListNode *next = tmp->next;
            tmp->next = prev;
            prev = tmp;
            tmp = next;
        }
        return {tail, head};
    }

public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode hair, *prev = &hair;
        hair.next = head;
        while (head) {
            ListNode *tail = prev;
            for (int i = 0; i < k; i++) {
                tail = tail->next;
                if (!tail) return hair.next;
            }
            ListNode *next = tail->next;
            pair<ListNode*, ListNode*> result = reverseGroup(head, tail);
            head = result.first;
            tail = result.second;
            prev->next = head;
            tail->next = next;
            prev = tail;
            head = tail->next;
        }
        return hair.next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，n 为链表的长度即链表上节点的数量。
* 空间复杂度：_O_(1)，哑节点。

## 参考链接

* [Reverse Nodes in k-Group - LeetCode](https://leetcode.com/problems/reverse-nodes-in-k-group/){:target="_blank"}
