---
layout: post
title:  "LeetCode 83. 删除有序链表中的重复元素（简单）"
date:   2021-07-03 10:58:24 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Linked-List
excerpt:
  给定一个升序排列的单链表头 `head`，*删除所有含重复元素，使每个元素只出现一次*。
  返回*同样**按升序排列的**单链表*。
---
> ## 83. Remove Duplicates from Sorted List
> 
> Given the `head` of a sorted linked list, *delete all duplicates such that
> each element appears only once*. Return *the linked list **sorted** as well*.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/list1.jpg" style="width: 302px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> head = [1,1,2]
> <strong>Output:</strong> [1,2]
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/list2.jpg" style="width: 542px; height: 222px;">
> 
> <pre>
> <strong>Input:</strong> head = [1,1,1,2,3]
> <strong>Output:</strong> [1,2,3]
> </pre>
> 
> **Constraints:**
> 
> * The number of nodes in the list is in the range `[0, 300]`.
> * `-100 <= Node.val <= 100`
> * The list is guaranteed to be **sorted** in ascending order.

## 解决方案

### 方法一：一次遍历

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
        ListNode* cur = head;
        while (cur->next != NULL) {
            if (cur->val == cur->next->val) {
                cur->next = cur->next->next;
            } else {
                cur = cur->next;
            }
        }
        return head;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为链表长度。
* 空间复杂度：*O*(1)。

## 参考链接

* [Remove Duplicates from Sorted List - LeetCode](https://leetcode.com/problems/remove-duplicates-from-sorted-list/){:target="_blank"}
