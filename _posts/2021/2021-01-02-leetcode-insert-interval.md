---
layout: post
title:  "LeetCode 57. 插入区间（中等）"
date:   2021-01-02 21:46:59 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Sort
excerpt:
  给定一个*无重叠的*区间集合，插入一个新的区间到区间集中（如果必要就合并）。<br>
  你可以假设区间最初是根据它们的开始时间排序的。
---
> ## 57. Insert Interval
> 
> Given a set of *non-overlapping* intervals, insert a new interval into the
> intervals (merge if necessary).
> 
> You may assume that the intervals were initially sorted according to their
> start times.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> intervals = [[1,3],[6,9]], newInterval = [2,5]
> <strong>Output:</strong> [[1,5],[6,9]]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]
> <strong>Output:</strong> [[1,2],[3,10],[12,16]]
> <strong>Explanation:</strong> Because the new interval [4,8] overlaps with [3,5],[6,7],[8,10].
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> intervals = [], newInterval = [5,7]
> <strong>Output:</strong> [[5,7]]
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> intervals = [[1,5]], newInterval = [2,3]
> <strong>Output:</strong> [[1,5]]
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> intervals = [[1,5]], newInterval = [2,7]
> <strong>Output:</strong> [[1,7]]
> </pre>
> 
> **Constraints:**
> 
> * <code>0 <= intervals.length <= 10<sup>4</sup></code>
> * <code>intervals[i].length == 2</code>
> * <code>0 <= intervals[i][0] <= intervals[i][1] <= 10<sup>5</sup></code>
> * `intervals` is sorted by `intervals[i][0]` in **ascending** order.
> * <code>newInterval.length == 2</code>
> * <code>0 <= newInterval[0] <= newInterval[1] <= 10<sup>5</sup></code>

## 解决方案

### 方法一：模拟

在区间集适当的位置插入新的区间，然后按上一题的方法求解。

```cpp
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        if (intervals.empty()) return {newInterval};
        if (newInterval.empty()) return intervals;
        bool inserted = false;
        for (auto it = intervals.begin(); it != intervals.end(); it++) {
            if ((*it)[0] >= newInterval[0]) {
                intervals.insert(it, newInterval);
                inserted = true;
                break;
            }
        }
        if (!inserted) intervals.push_back(newInterval);
        vector<vector<int>> merged;
        for (int i = 0; i < intervals.size(); i++) {
            int left = intervals[i][0], right = intervals[i][1];
            if (merged.empty() || merged.back()[1] < left) {
                merged.push_back({left, right});
            } else {
                merged.back()[1] = max(merged.back()[1], right);
            }
        }
        return merged;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为区间集的大小。
* 空间复杂度：*O*(1)。

## 参考链接

* [Insert Interval - LeetCode](https://leetcode.com/problems/insert-interval/){:target="_blank"}
