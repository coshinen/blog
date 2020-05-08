---
layout: post
title:  "LeetCode 22. 生成括号 中等"
date:   2020-05-02 11:25:16 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode
excerpt: 给定括号的对数 n，写一个函数用于生成所有括号的有效组合。
---
## 22. Generate Parentheses | Medium

> Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.
> 
> For example, given n = 3, a solution set is:
> 
> <pre>
> [
>   "((()))",
>   "(()())",
>   "(())()",
>   "()(())",
>   "()()()"
> ]
> </pre>

## 问题分析

给定括号的对数 n，写一个函数用于生成所有括号的有效组合。

## 解决方案

### 方法一：暴力法（Brute Force）

生成括号的所有 2^2n 种组合，并逐个检查组合是否有效。

```cpp
class Solution {
    bool valid(const string& str) {
        int balance = 0;
        for (char c : str) {
            if (c == '(') {
                ++balance;
            } else {
                --balance;
                if (balance < 0)
                    return false;
            }
        }
        return balance == 0;
    }

    void generate_all(string& current, int n, vector<string>& result) {
        if (n == current.size()) {
            if (valid(current))
                result.push_back(current);
            return;
        }
        current += '(';
        generate_all(current, n, result);
        current.pop_back();
        current += ')';
        generate_all(current, n, result);
        current.pop_back();
    }
public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        string current;
        generate_all(current, 2 * n, result);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(2^2n*n)，一共有 2^2n 种可能的组合，建立并验证每种组合的复杂度为 _O_(n)。
* 空间复杂度：_O_(n)，每层递归需要 _O_(1) 的空间，最多递归 2n 层。

## 参考链接

* [Generate Parentheses - LeetCode](https://leetcode.com/problems/generate-parentheses/){:target="_blank"}
