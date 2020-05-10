---
layout: post
title:  "LeetCode 19. 移除链表末尾的第 n 个节点 中等"
date:   2020-04-11 19:27:35 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode
excerpt: 给定一条链表，移除链表末尾的第 n 个节点并返回它的头。
---
## 19. Remove Nth Node From End of List | Medium

> Given a linked list, remove the n-th node from the end of list and return its head.
> 
> **Example:**
> 
> <pre>
> Given linked list: <strong>1->2->3->4->5</strong>, and <strong><em>n</em> = 2</strong>.
> 
> After removing the second node from the end, the linked list becomes <strong>1->2->3->5</strong>.
> </pre>
> 
> **Note:**
> 
> Given n will always be valid.
> 
> **Follow up:**
> 
> Could you do this in one pass?
> 
> <details>
> <summary>Hint 1</summary>
> Maintain two pointers and update one with a delay of n steps.
> </details>

## 解决方案

### 方法一：遍历两次（Two pass algorithm）

该问题的关键是找出倒数第 n 个节点为正数第几个节点，因为是单链表。
1. 首先要确定的是单链表的长度，需要遍历一次链表得到长度 len，这样就确定了待删除的是正数第 len - (n - 1) = len - n + 1 个节点。
2. 接着第二次遍历链表到待删除节点的前一个节点，进行删除。

设置哑节点到链表的头部，来处理特殊情况，比如只有一个节点的链表。

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
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy;
        dummy.next = head;
        ListNode *first = head;
        int len = 0;
        while (first != NULL) {
            first = first->next;
            len++;
        }
        ListNode *second = &dummy;
        len = len - (n - 1) -1;
        while (len > 0) {
            second = second->next;
            len--;
        }
        second->next = second->next->next;
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，遍历两次链表，执行了 2 * len - n 次操作。
* 空间复杂度：_O_(1)，哑节点。

该方法的缺点是遍历了两次链表，因为确定目标节点的正向位置，就必须要知道链表的长度。

如何只遍历一次链表删除目标节点呢？那么问题就转换成了如何在不知道单链表长度的情况下删除该链表的倒数第 n 个节点。

使用双指针，像滑动窗口一样，固定宽度即左右两个指针间的距离，当第一个指针抵达链表末尾时，第二个指针指向的位置刚好就是待删除节点的前一个节点。

### 方法二：遍历一次（One pass algorithm）

同样在链表头部添加一个哑节点，处理只有一个节点链表的情况。

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
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy;
        dummy.next = head;
        ListNode *first = &dummy;
        ListNode *second = &dummy;
        while (n > 0) {
            first = first->next;
            n--;
        }
        while (first->next != NULL) {
            first = first->next;
            second = second->next;
        }
        second->next = second->next->next;
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，只遍历了一次链表。
* 空间复杂度：_O_(1)，哑节点。

## 参考链接

* [Remove Nth Node From End of List - LeetCode](https://leetcode.com/problems/remove-nth-node-from-end-of-list/){:target="_blank"}
