---
layout: post
title:  "LeetCode 2. 两数相加"
date:   2019-12-14 14:58:13 +0800
author: mistydew
comments: true
categories: LeetCode
tags: LeetCode
excerpt: 给了两条**非空**链表，用于表示两个非负整数。数字以**倒序**的方式存储在链表中，每个节点保存**一位**数字。把两数之和保存在一条链表中并返回。
---
## 2. Add Two Numbers (Medium)

> You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order** and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.
> 
> You may assume the two numbers do not contain any leading zero, except the number 0 itself.
> 
> **Example:**
> 
> **Input:** (2 -> 4 -> 3) + (5 -> 6 -> 4)<br>
> **Output:** 7 -> 0 -> 8<br>
> **Explanation:** 342 + 465 = 807.

## 问题分析

求两个数的和，属于初等数学。
给了两条**非空**链表，用于表示两个非负整数。
数字以**倒序**的方式存储在链表中，每个节点保存**一位**数字。
把两数之和保存在一条链表中并返回。

## 解决方案

### 方法一：初等数学+哑节点（Elementary Math + dummy node）

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
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode *l3 = new ListNode(0); // dummy node
        ListNode *p = l3;
        int sum = 0;
        while (l1 != NULL || l2 != NULL || sum > 0) {
            if (l1 != NULL) {
                sum += l1->val;
                l1 = l1->next;
            }
            if (l2 != NULL) {
                sum += l2->val;
                l2 = l2->next;
            }
            p->next = new ListNode(sum % 10);
            sum /= 10;
            p = p->next;
        }
        return l3->next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(max(m, n))。设 m 和 n 分别为 l1 和 l2 的长度。
* 空间复杂度：_O_(max(m, n))。新链表的长度最大为 max(m, n) + 1。

### 方法二：初等数学+双指针（Elementary Math + **）

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
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode *l3 = NULL;
        ListNode **p = &l3;
        int sum = 0;
        while (l1 != NULL || l2 != NULL || sum > 0) {
            if (l1 != NULL) {
                sum += l1->val;
                l1 = l1->next;
            }
            if (l2 != NULL) {
                sum += l2->val;
                l2 = l2->next;
            }
            *p = new ListNode(sum % 10);
            sum /= 10;
            p = &((*p)->next);
        }
        return l3;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(max(m, n))。
* 空间复杂度：_O_(max(m, n))。

## 参考链接

* [Add Two Numbers - LeetCode](https://leetcode.com/problems/add-two-numbers/){:target="_blank"}
* [mistydew/leetcode](https://github.com/mistydew/leetcode){:target="_blank"}
