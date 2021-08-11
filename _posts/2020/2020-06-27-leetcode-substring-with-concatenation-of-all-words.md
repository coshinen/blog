---
layout: post
title:  "LeetCode 30. 串联所有单词的子串（困难）"
date:   2020-06-27 17:36:16 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard Hash-Table String Sliding-Window
---
> 给你一个字符串 `s` 和一个字符串**长度相同**的数组 `words`。
> 返回 `s` 中 substring(s) 的所有起始索引，该子串是 `words` 中各个单词**按任意顺序的一次**串联，且**中间不含任何字符**。
> 
> 你可以按**任意顺序**返回答案。
> 
> **限制条件：**
> 
> * <code>1 <= s.length <= 10<sup>4</sup></code>
> * `s` 由小写英文字母组成。
> * `1 <= words.length <= 5000`
> * `1 <= words[i].length <= 30`
> * `words[i]` 由小写英文字母组成。

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
