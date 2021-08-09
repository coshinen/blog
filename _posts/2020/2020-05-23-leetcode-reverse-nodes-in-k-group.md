---
layout: post
title:  "LeetCode 25. k 个一组反转节点（困难）"
date:   2020-05-23 08:37:46 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Linked-List
---
> 给定一条单链表，每次反转 *k* 个节点的子链表并返回其修改后的链表。
> 
> *k* 是一个正整数且小于或等于链表的长度。
> 如果节点数不是 *k* 的倍数，那么最终剩下的节点应该保持不变。
> 
> 你不能更改链表节点的值，只能改变节点本身。
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/03/reverse_ex1.jpg" style="width: 542px; height: 222px;">
> 
> **限制条件：**
> 
> * 链表中的节点数在范围 `sz` 里。
> * `1 <= sz <= 5000`
> * `0 <= Node.val <= 1000`
> * `1 <= k <= sz`

## 解决方案

### 方法一：模拟

链表以 k 个节点为一组进行分组，最后一组若不足 k 个节点则不需要进行反转。

把每 k 个节点组成的子链表进行反转操作后，注意把反转后的子链表接入链表。

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
private:
    pair<ListNode*, ListNode*> reverseGroup(ListNode* head, ListNode* tail) {
        ListNode *prev = tail->next;
        ListNode *tmp = head;
        while (prev != tail) {
            ListNode *next = tmp->next;
            tmp->next = prev;
            prev = tmp;
            tmp = next;
        }
        return {tail, head};
    }

public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode hair, *prev = &hair;
        hair.next = head;
        while (head) {
            ListNode *tail = prev;
            for (int i = 0; i < k; i++) {
                tail = tail->next;
                if (!tail) return hair.next;
            }
            ListNode *next = tail->next;
            pair<ListNode*, ListNode*> result = reverseGroup(head, tail);
            head = result.first;
            tail = result.second;
            prev->next = head;
            tail->next = next;
            prev = tail;
            head = tail->next;
        }
        return hair.next;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为链表的长度即链表上节点的数量。
* 空间复杂度：*O*(1)。
  哑节点。

## 参考链接

* [Reverse Nodes in k-Group - LeetCode](https://leetcode.com/problems/reverse-nodes-in-k-group/){:target="_blank"}
