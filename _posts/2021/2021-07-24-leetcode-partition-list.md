---
layout: post
title:  "LeetCode 86. 分隔链表（中等）"
date:   2021-07-24 08:07:19 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Linked-List Two-Pointers
---
> 给定一个链表的 `head` 和一个值 `x`，分隔它使所有**小于** `x` 的节点出现在**大于或等于** `x` 的节点前面。
> 
> 你应该**保留**两个区间中每个节点原来的相对顺序。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/partition.jpg" style="width: 662px; height: 222px;">
> 
> **限制条件：**
> 
> * 链表中节点数在范围 `[0, 200]` 中。
> * `-100 <= Node.val <= 100`
> * `-200 <= x <= 200`

## 解决方案

### 方法一：双指针

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
    ListNode* partition(ListNode* head, int x) {
        ListNode* before = new ListNode(0);
        ListNode* beforeHead = before;
        ListNode* after = new ListNode(0);
        ListNode* afterHead = after;
        while (head != nullptr) {
            if (head->val < x) {
                before->next = head;
                before = before->next;
            } else {
                after->next = head;
                after = after->next;
            }
            head = head->next;
        }
        after->next = nullptr;
        before->next = afterHead->next;
        return beforeHead->next;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为链表的长度，只遍历链表一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Partition List - LeetCode](https://leetcode.com/problems/partition-list/){:target="_blank"}
