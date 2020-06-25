---
layout: post
title:  "LeetCode 2. 两数相加 中等"
date:   2019-12-14 14:58:13 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Linked-List Math
excerpt: 给定两条**非空**链表用于表示两个非负整数。数字以**倒序**的方式存储在链表中，每个节点保存**一位**数字。把两数之和保存在一条链表中并返回。
---
## 2. Add Two Numbers | Medium

> You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order** and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.
> 
> You may assume the two numbers do not contain any leading zero, except the number 0 itself.
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> (2 -> 4 -> 3) + (5 -> 6 -> 4)
> <strong>Output:</strong> 7 -> 0 -> 8
> <strong>Explanation:</strong> 342 + 465 = 807.
> </pre>

## 解决方案

### 方法一：初等数学（Elementary Math）

添加一个哑节点作为新链表的表头节点，用于简化代码。

若没有哑节点，则必须编写额外的条件语句来初始化表头节点。

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
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode head, *l3 = &head;
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
            l3->next = new ListNode(sum % 10);
            l3 = l3->next;
            sum /= 10;
        }
        return head.next;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(max(m, n))。m 和 n 分别代表链表 l1 和 l2 的长度。
* 空间复杂度：_O_(max(m, n))。新链表的长度最大为 max(m, n) + 1。

## 参考链接

* [Add Two Numbers - LeetCode](https://leetcode.com/problems/add-two-numbers/){:target="_blank"}
