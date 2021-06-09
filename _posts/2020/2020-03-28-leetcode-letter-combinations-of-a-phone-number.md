---
layout: post
title:  "LeetCode 17. 电话号码的字母组合（中等）"
date:   2020-03-28 22:15:39 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Backtracking
excerpt:
  给定一个包含数字 `2-9` 范围内的字符串，返回它能表示的所有可能的字母组合。<br>
  一个数字到字母的映射（就像手机按键）基于下面。
  注意 1 没有映射到任何字母。
---
> ## 17. Letter Combinations of a Phone Number
> 
> Given a string containing digits from `2-9` inclusive, return all possible
> letter combinations that the number could represent.
> 
> A mapping of digit to letters (just like on the telephone buttons) is given
> below. Note that 1 does not map to any letters.
> 
> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Telephone-keypad2.svg/200px-Telephone-keypad2.svg.png" style="width: 200px; height: 162px;">
> 
> **Example:**
> 
> <pre>
> <strong>Input:</strong> "23"
> <strong>Output:</strong> ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"].
> </pre>
> 
> **Note:**
> 
> Although the above answer is in lexicographical order, your answer could be in
> any order you want.

## 解决方案

### 方法一：深度优先搜索

```cpp
class Solution {
private:
    unordered_map<char, string> umap = {
        {'2', "abc"},
        {'3', "def"},
        {'4', "ghi"},
        {'5', "jkl"},
        {'6', "mno"},
        {'7', "pqrs"},
        {'8', "tuv"},
        {'9', "wxyz"}
    };
    vector<string> result;
    string s;

    void dfs(string& digits, int idx) {
        if (idx == digits.size()) {
            result.push_back(s);
        }
        for (int i = 0; i < umap[digits[idx]].size(); i++) {
            s += umap[digits[idx]][i];
            dfs(digits, idx + 1);
            s.pop_back();
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        if (digits == "") return result;
        dfs(digits, 0);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(3<sup>N</sup> * 4<sup>M</sup>)。
  N 是对应三个字母的数字，M 是对应四个字母的数字，N + M 是输入数字的总数。
* 空间复杂度：*O*(3<sup>N</sup> * 4<sup>M</sup>)。
  共 3<sup>N</sup> * 4<sup>M</sup> 种可能的组合。

## 参考链接

* [Letter Combinations of a Phone Number - LeetCode](https://leetcode.com/problems/letter-combinations-of-a-phone-number/){:target="_blank"}
