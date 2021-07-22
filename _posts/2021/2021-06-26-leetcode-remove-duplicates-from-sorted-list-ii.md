---
layout: post
title:  "LeetCode 82. 删除有序链表中的重复元素II（中等）"
date:   2021-06-26 14:40:06 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Linked-List Two-Pointers
---
> 给定一个升序排列的单链表 `head`，*删除所有含重复数字的节点，原链表中只保留没有重复的数字*。
> 返回*同样**按升序排列的**单链表*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/linkedlist1.jpg" style="width: 500px; height: 142px;">
> 
> **限制条件：**
> 
> * 链表中节点数在范围 `[0, 300]` 里。
> * `-100 <= Node.val <= 100`
> * 已确保链表按升序*排列*。

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
