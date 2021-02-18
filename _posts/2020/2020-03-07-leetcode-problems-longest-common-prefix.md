---
layout: post
title:  "LeetCode 14. 最长公共前缀 简单"
date:   2020-03-07 19:00:29 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy String
excerpt:
  写一个函数来查找字符串数组的最长公共前缀。<br>
  如果没有公共前缀，则返回一个空字符串 `""`。
---
> ## 14. Longest Common Prefix
> 
> Write a function to find the longest common prefix string amongst an array of
> strings.
> 
> If there is no common prefix, return an empty string `""`.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> ["flower","flow","flight"]
> <strong>Output:</strong> "fl"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> ["dog","racecar","car"]
> <strong>Output:</strong> ""
> <strong>Explanation:</strong> There is no common prefix among the input strings.
> </pre>
> 
> **Note:**
> 
> All given inputs are in lowercase letters `a-z`.

## 解决方案

### 方法一：水平扫描

n 个字符串的公共前缀一定是其中的 n - 1 个字符串的公共前缀。

逐个遍历字符串，求出最长公共前缀。

```cpp
class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        string result = strs.size() ? strs[0] : "";
        for (string str : strs) {
            while (str.substr(0, result.size()) != result) {
                result = result.substr(0, result.size() - 1);
                if (result == "") return result;
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(S)。
  S 是字符串数组中字符数量的总和。
* 空间复杂度：*O*(1)。
  使用了常数级别的额外空间来保存公共前缀。

## 参考链接

* [Longest Common Prefix - LeetCode](https://leetcode.com/problems/longest-common-prefix/){:target="_blank"}
