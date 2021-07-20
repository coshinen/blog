---
layout: post
title:  "LeetCode 83. 删除有序链表中的重复元素（简单）"
date:   2021-07-03 10:58:24 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Linked-List
---
> 给定一个升序排列的单链表 `head`，*删除所有重复元素，使每个元素只出现一次*。
> 返回*同样**按升序排列的**单链表*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/01/04/list2.jpg" style="width: 542px; height: 222px;">
> 
> **限制条件：**
> 
> * 链表中节点数在范围 `[0, 300]` 里。
> * `-100 <= Node.val <= 100`
> * 已确保链表按升序*排列*。

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
