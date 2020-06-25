---
layout: post
title:  "LeetCode 21. 合并两条有序链表 简单"
date:   2020-04-25 10:09:53 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Linked-List
excerpt: 合并两条有序链表并返回一条新链表。新链表通过拼接两条链表的节点组成。
---
## 21. Merge Two Sorted Lists | Easy

> Merge two sorted linked lists and return it as a new list. The new list should be made by splicing together the nodes of the first two lists.
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> 1->2->4, 1->3->4
> <strong>Output:</strong> 1->1->2->3->4->4
> </pre>

## 解决方案

### 方法一：递归（Recursion）

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        if (l1 == NULL) {
            return l2;
        }
        if (l2 == NULL) {
            return l1;
        }
        if (l1->val < l2->val) {
            l1->next = mergeTwoLists(l1->next, l2);
            return l1;
        } else {
            l2->next = mergeTwoLists(l1, l2->next);
            return l2;
        }
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n + m)。
* 空间复杂度：_O_(n + m)。

### 方法二：迭代（Iteration）

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        if ((!l1) || (!l2)) return l1 ? l1 : l2;
        ListNode head, *tail = &head;
        while (l1 && l2) {
            if (l1->val < l2->val) {
                tail->next = l1;
                l1 = l1->next;
            } else {
                tail->next = l2;
                l2 = l2->next;
            }
            tail = tail->next;
        }
        tail->next = (l1 ? l1 : l2);
        return head.next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)。
* 空间复杂度：_O_(1)。

## 参考链接

* [Merge Two Sorted Lists - LeetCode](https://leetcode.com/problems/merge-two-sorted-lists/){:target="_blank"}
