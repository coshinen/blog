---
layout: post
title:  "LeetCode 24. 成对交换节点 中等"
date:   2020-05-16 17:10:58 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Linked-List
excerpt: 给定一条链表，交换每两个相邻的节点并返回它的头。
---
> ## 24. Swap Nodes in Pairs | Medium
> 
> Given a linked list, swap every two adjacent nodes and return its head.
> 
> You may **not** modify the values in the list's nodes, only nodes itself may be changed.
> 
> **Example:**
> 
> <pre>
> Given 1->2->3->4, you should return the list as 2->1->4->3.
> </pre>

## 解决方案

### 方法一：递归（Recursion）

成对即两两交换节点，最后返回的是原链表的第二个节点。

当链表只有一个节点或为空链表时，直接返回该链表。

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
    ListNode* swapPairs(ListNode* head) {
        if (head == NULL || head->next == NULL) return head;
        ListNode *second = head->next;
        head->next = swapPairs(second->next);
        second->next = head;
        return second;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，n 表示链表中节点的数量。
* 空间复杂度：_O_(n)，递归过程使用的堆栈空间。

### 方法二：迭代（Iteration）

成对交换节点后，需要连接每对交换后的节点构成新链表并返回。

在链表头添加一个哑节点用于处理头节点，使用 prev 指向每对待交换节点的第一个节点即交换后的第二个节点，用于连接下一对节点。

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
    ListNode* swapPairs(ListNode* head) {
        ListNode dummy, *prev = &dummy;
        prev->next = head;
        while (head && head->next) {
            ListNode *second = head->next;
            prev->next = second;
            head->next = second->next;
            second->next = head;
            
            prev = head;
            head = head->next;
        }
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，n 表示链表中节点的数量。
* 空间复杂度：_O_(1)，哑节点。

## 参考链接

* [Swap Nodes in Pairs - LeetCode](https://leetcode.com/problems/swap-nodes-in-pairs/){:target="_blank"}
