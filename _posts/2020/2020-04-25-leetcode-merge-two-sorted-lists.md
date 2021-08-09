---
layout: post
title:  "LeetCode 21. 合并两条有序链表（简单）"
date:   2020-04-25 10:09:53 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Linked-List
---
> 合并两条有序链表后以一条**有序**链表返回它。
> 该链表通过拼接前两条链表的节点组成。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg" style="width: 662px; height: 302px;">
> 
> **限制条件：**
> 
> * 链表的节点数在范围 `[0, 50]` 里。
> * `-100 <= Node.val <= 100`
> * `l1` 和 `l2` 都是按**非降序**排列的有序链表。

## 解决方案

### 方法一：递归

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
* 时间复杂度：*O*(n + m)。
* 空间复杂度：*O*(n + m)。

### 方法二：迭代

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
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Merge Two Sorted Lists - LeetCode](https://leetcode.com/problems/merge-two-sorted-lists/){:target="_blank"}
