---
layout: post
title:  "LeetCode 23. 合并 k 个有序链表（困难）"
date:   2020-05-09 08:18:24 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Linked-List Divide-and-Conquer Heap
---
> 给你一个含 `k` 条单链表的数组 `lists`，每条单链表都是按升序排列的。
> 
> *合并所有单链表到一条有序链表并返回它*。
> 
> **限制条件：**
> 
> * `k == lists.length`
> * <code>0 <= k <= 10<sup>4</sup></code>
> * `0 <= lists[i].length <= 500`
> * <code>-10<sup>4</sup> <= lists[i][j] <= 10<sup>4</sup></code>
> * `lists[i]` 是按**升序排列的**有序链表。
> * `lists[i].length` 的总和不超过 <code>10<sup>4</sup></code>。

## 解决方案

### 方法一：一条一条合并链表

使用合并 2 条有序链表的方法，一条一条合并，k 条链表需要进行 k - 1 次合并。

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
    ListNode* mergeTwoLists(ListNode *l1, ListNode *l2) {
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

    ListNode* mergeKLists(vector<ListNode*>& lists) {
        ListNode *result = nullptr;
        for (int i = 0; i < lists.size(); ++i) {
            result = mergeTwoLists(result, lists[i]);
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*((k<sup>2</sup>) * n)。
  第 i 次合并后，result 的长度为 i * n，时间代价是*O*(n + (i - 1) * n) = *O*(i * n)，所以总时间代价是*O*((((1 +k) * k) / 2) * n) = *O*((k<sup>2</sup>) * n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Merge k Sorted Lists - LeetCode](https://leetcode.com/problems/merge-k-sorted-lists/){:target="_blank"}
