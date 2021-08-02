---
layout: post
title:  "LeetCode 57. 插入区间（中等）"
date:   2021-01-02 21:46:59 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Sort
---
> 给定一个*无重叠的*区间集合，插入一个新的区间到区间集中（如果必要就合并）。
> 
> 你可以假设区间最初是根据它们的开始时间排序的。
> 
> **限制条件：**
> 
> * <code>0 <= intervals.length <= 10<sup>4</sup></code>
> * <code>intervals[i].length == 2</code>
> * <code>0 <= intervals[i][0] <= intervals[i][1] <= 10<sup>5</sup></code>
> * `intervals` 根据 `intervals[i][0]` 按**升**序排列。
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
