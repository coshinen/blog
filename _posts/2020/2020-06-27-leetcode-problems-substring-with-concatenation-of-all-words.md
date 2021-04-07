---
layout: post
title:  "LeetCode 30. 串联所有单词的子串（困难）"
date:   2020-06-27 17:36:16 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Hash-Table Two-Pointers String
excerpt:
  给你一个字符串 **s** 和一系列长度相同的单词 **words**。
  找出 **s** 中由 **words** 里每个单词串联成子串的所有起始位置。
---
> ## 30. Substring with Concatenation of All Words
> 
> You are given a string, **s**, and a list of words, **words**, that are all of
> the same length. Find all starting indices of substring(s) in **s** that is a
> concatenation of each word in **words** exactly once and without any
> intervening characters.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong>
>   <strong>s</strong> = "barfoothefoobarman",
>   <strong>words</strong> = ["foo","bar"]
> <strong>Output:</strong> [0,9]
> <strong>Explanation:</strong> Substrings starting at index 0 and 9 are "barfoo" and "foobar" respectively.
> The output order does not matter, returning [9,0] is fine too.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong>
>   <strong>s</strong> = "wordgoodgoodgoodbestword",
>   <strong>words</strong> = ["word","good","best","word"]
> <strong>Output:</strong> []
> </pre>

## 解决方案

### 方法一：双指针

```cpp
class Solution {
public:
    vector<int> findSubstring(string s, vector<string>& words) {
        if (s.empty() || words.empty()) return {};
        vector<int> result;
        int len = words[0].size();
        int n = words.size();
        unordered_map<string, int> umap1;
        for (const auto& word : words) ++umap1[word];
        for (int i = 0; i < len; ++i) {
            int left = i;
            int right = i;
            int count = 0;
            unordered_map<string, int> umap2;
            while (right + len <= s.size()) {
                string word = s.substr(right, len);
                right += len;
                if (umap1.count(word) == 0) {
                    count = 0;
                    left = right;
                    umap2.clear();
                } else {
                    ++umap2[word];
                    ++count;
                    while (umap2.at(word) > umap1.at(word)) {
                        string word = s.substr(left, len);
                        --count;
                        --umap2[word];
                        left += len;
                    }
                    if (count == n) result.push_back(left);
                }
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Substring with Concatenation of All Words - LeetCode](https://leetcode.com/problems/substring-with-concatenation-of-all-words/){:target="_blank"}
