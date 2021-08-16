---
layout: post
title:  "LeetCode 19. 移除链表末尾的第 n 个节点（中等）"
date:   2020-04-11 19:27:35 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Linked-List Two-Pointers
---
> 给定一条链表的头 `head`，移除该链表末尾的`第 n 个`节点并返回它的头。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/03/remove_ex1.jpg" style="width: 542px; height: 222px;">
> 
> **限制条件：**
> 
> * 链表中的节点数是 `sz`。
> * `1 <= sz <= 30`
> * `0 <= Node.val <= 100`
> * `1 <= n <= sz`
> 
> <details>
> <summary>提示 1</summary>
> 维持两个指针并以 n 步的延迟更新一个指针。
> </details>

## 解决方案

### 方法一：遍历两次

该问题的关键是找出倒数第 n 个节点为正数第几个节点，因为是单链表。
1. 首先要确定的是单链表的长度，需要遍历一次链表得到长度 len，这样就确定了待删除的是正数第 len - (n - 1) = len - n + 1 个节点。
2. 接着第二次遍历链表到待删除节点的前一个节点，进行删除。

设置哑节点到链表的头部，来处理特殊情况，比如只有一个节点的链表。

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
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy;
        dummy.next = head;
        ListNode *first = head;
        int len = 0;
        while (first != NULL) {
            first = first->next;
            len++;
        }
        ListNode *second = &dummy;
        len = len - (n - 1) -1;
        while (len > 0) {
            second = second->next;
            len--;
        }
        second->next = second->next->next;
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  遍历 2 次链表，执行了 2 * len - n 次操作。
* 空间复杂度：*O*(1)。
  哑节点。

### 方法二：遍历一次

方法一的缺点是遍历了两次链表，因为确定目标节点的正向位置，就必须要知道链表的长度。

如何只遍历一次链表删除目标节点呢？那么问题就转换成了如何在不知道单链表长度的情况下删除该链表的倒数第 n 个节点。

使用双指针，像滑动窗口一样，固定宽度即左右两个指针间的距离，当第一个指针抵达链表末尾时，第二个指针指向的位置刚好就是待删除节点的前一个节点。

同样在链表头部添加一个哑节点，处理只有一个节点链表的情况。

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
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy;
        dummy.next = head;
        ListNode *first = &dummy;
        ListNode *second = &dummy;
        while (n > 0) {
            first = first->next;
            n--;
        }
        while (first->next != NULL) {
            first = first->next;
            second = second->next;
        }
        second->next = second->next->next;
        return dummy.next;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  只遍历了一次链表。
* 空间复杂度：*O*(1)。
  哑节点。

## 参考链接

* [Remove Nth Node From End of List - LeetCode](https://leetcode.com/problems/remove-nth-node-from-end-of-list/){:target="_blank"}
