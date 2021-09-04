---
layout: post
title:  "LeetCode 92. 翻转链表 II（中等）"
date:   2021-09-04 16:18:30 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Linked-List
---
> 给定一条单链表的 `head` 与两个整数 `left` 和 `right` 且 `left <= right`，从位置 `left` 到 `right` 翻转该链表的节点，并返回*翻转后的链表*。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2021/02/19/rev2ex2.jpg" style="width: 542px; height: 222px;">
> 
> **进阶：**你能一趟扫描完成该操作吗？
> 
> **限制条件：**
> 
> * 该链表的节点数为 `n`。
> * `1 <= n <= 500`
> * `-500 <= Node.val <= 500`
> * `1 <= left <= right <= n`

## 解决方案

### 方法一：头插法

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
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        ListNode dummy = ListNode(-1);
        dummy.next = head;
        ListNode* pre = &dummy;
        for (int i = 0; i < left - 1; i++) {
            pre = pre->next;
        }
        ListNode* cur = pre->next;
        ListNode* next;
        for (int i = 0; i < right - left; i++) {
            next = cur->next;
            cur->next = next->next;
            next->next = pre->next;
            pre->next = next;
        }
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为链表的节点数。
* 空间复杂度：*O*(1)。

## 参考链接

* [Reverse Linked List II - LeetCode](https://leetcode.com/problems/reverse-linked-list-ii/){:target="_blank"}
