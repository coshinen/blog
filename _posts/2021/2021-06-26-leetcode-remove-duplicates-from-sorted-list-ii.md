---
layout: post
title:  "LeetCode 82. 删除有序链表中的重复元素II（中等）"
date:   2021-06-26 14:40:06 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Linked-List Two-Pointers
excerpt:
  给定一个升序排列的单链表头 `head`，*删除所有含重复数字的节点，原链表中只保留没有重复的数字*。
  返回*同样**按升序排列的**单链表*。
---
> ## 82. Remove Duplicates from Sorted List II
> 
> Given the `head` of a sorted linked list, *delete all nodes that have
> duplicate numbers, leaving only distinct numbers from the original list*.
> Return *the linked list **sorted** as well*.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/linkedlist1.jpg" style="width: 500px; height: 142px;">
> 
> <pre>
> <strong>Input:</strong> head = [1,2,3,3,4,4,5]
> <strong>Output:</strong> [1,2,5]
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/linkedlist2.jpg" style="width: 500px; height: 205px;">
> 
> <pre>
> <strong>Input:</strong> head = [1,1,1,2,3]
> <strong>Output:</strong> [2,3]
> </pre>
> 
> **Constraints:**
> 
> * The number of nodes in the list is in the range `[0, 300]`.
> * `-100 <= Node.val <= 100`
> * The list is guaranteed to be **sorted** in ascending order.

## 解决方案

### 方法一：哑节点+一次遍历

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
    ListNode* deleteDuplicates(ListNode* head) {
        if (head == NULL) return head;
        ListNode dummy(0, head);
        ListNode* cur = &dummy;
        while (cur->next && cur->next->next) {
            if (cur->next->val == cur->next->next->val) {
                int tmp = cur->next->val;
                while (cur->next && cur->next->val == tmp) {
                    cur->next = cur->next->next;
                }
            } else {
                cur = cur->next;
            }
        }
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为链表长度。
* 空间复杂度：*O*(1)。

## 参考链接

* [Remove Duplicates from Sorted List II - LeetCode](https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/){:target="_blank"}
