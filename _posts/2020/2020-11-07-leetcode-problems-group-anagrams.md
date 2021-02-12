---
layout: post
title:  "LeetCode 49. 字母异序词分组 中等"
date:   2020-11-07 19:59:48 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium Hash-Table String
excerpt:
  给定一个字符串数组 `strs`，把**字母异序词**分为一组。<br>
  **字母异序词**是通过重排不同单词或短语的字母形成的单词或短语，通常只使用所有原始字母一次。
---
> ## 49. Group Anagrams
> 
> Given an array of strings `strs`, group **the anagrams** together. You can
> return the answer in **any order**.
> 
> An **Anagram** is a word or phrase formed by rearranging the letters of a
> different word or phrase, typically using all the original letters exactly
> once.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> strs = ["eat","tea","tan","ate","nat","bat"]
> <strong>Output:</strong> [["bat"],["nat","tan"],["ate","eat","tea"]]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> strs = [""]
> <strong>Output:</strong> [[""]]
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> strs = ["a"]
> <strong>Output:</strong> [["a"]]
> </pre>
> 
> **Constraints:**
> 
> * <code>1 <= strs.length <= 10<sup>4</sup></code>
> * `0 <= strs[i].length <= 100`
> * `strs[i]` consists of lower-case English letters.

## 解决方案

### 方法一：通过排序的字符串分类

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> umap;
        for (auto& str: strs) {
            string tmp = str;
            sort(tmp.begin(), tmp.end());
            umap[tmp].push_back(str);
        }
        vector<vector<string>> result;
        for (auto& map: umap) {
            result.push_back(map.second);
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(nklogk)。
  n 为数组 `strs` 的大小，k 为数组 `strs` 中字符串的最大长度，排序的复杂度为 *O*(klogk)。
* 空间复杂度：*O*(nk)。

## 参考链接

* [Group Anagrams - LeetCode](https://leetcode.com/problems/group-anagrams/){:target="_blank"}
