---
layout: post
title:  "LeetCode 56. 合并区间 中等"
date:   2020-12-26 17:10:52 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Array Sort
excerpt: 给定一个`区间` <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code> 的集合，合并所有重叠的区间，并返回*一个覆盖所有输入区间的不重叠区间的集合*。
---
> ## 56. Merge Intervals
> 
> Given an array of `intervals` where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> intervals = [[1,3],[2,6],[8,10],[15,18]]
> <strong>Output:</strong> [[1,6],[8,10],[15,18]]
> <strong>Explanation:</strong> Since intervals [1,3] and [2,6] overlaps, merge them into [1,6].
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> intervals = [[1,4],[4,5]]
> <strong>Output:</strong> [[1,5]]
> <strong>Explanation:</strong> Intervals [1,4] and [4,5] are considered overlapping.
> </pre>
> 
> **Constraints:**
> 
> * <code>1 <= intervals.length <= 10<sup>4</sup></code>
> * <code>intervals[i].length == 2</code>
> * <code>0 <= start<sub>i</sub> <= end<sub>i</sub> <= 10<sup>4</sup></code>

## 解决方案

### 方法一：排序

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};
        sort(intervals.begin(), intervals.end());
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
* 时间复杂度：*O*(nlogn)。
  n 为输入区间的数量，排序时间复杂度为 *O*(logn)，只需扫描所有区间一次。
* 空间复杂度：*O*(logn)。
  排序所需的空间。

## 参考链接

* [Merge Intervals - LeetCode](https://leetcode.com/problems/merge-intervals/){:target="_blank"}
