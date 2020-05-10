---
layout: post
title:  "LeetCode 20. 有效的括号 简单"
date:   2020-04-18 10:07:43 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode
excerpt: 给定一个只包含字符 `'('`, `')'`, `'{'`, `'}'`, `'['` 和 `']'` 的字符串，判断字符串是否有效。
---
## 20. Valid Parentheses | Easy

> Given a string containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.
> 
> An input string is valid if:
> 
> 1. Open brackets must be closed by the same type of brackets.
> 2. Open brackets must be closed in the correct order.
> 
> Note that an empty string is also considered valid.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> "()"
> <strong>Output:</strong> true
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> "()[]{}"
> <strong>Output:</strong> true
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> "(]"
> <strong>Output:</strong> false
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> "([)]"
> <strong>Output:</strong> false
> </pre>
> 
> **Example 5:**
> 
> <pre>
> <strong>Input:</strong> "{[]}"
> <strong>Output:</strong> true
> </pre>
> 
> <details>
> <summary>Hint 1</summary>
> An interesting property about a valid parenthesis expression is that a sub-expression of a valid expression should also be a valid expression. (Not every sub-expression) e.g.
> <pre>
> { { } [ ] [ [ [ ] ] ] } is VALID expression
>           [ [ [ ] ] ]    is VALID sub-expression
>   { } [ ]                is VALID sub-expression
> </pre>
> Can we exploit this recursive structure somehow?
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> What if whenever we encounter a matching pair of parenthesis in the expression, we simply remove it from the expression? This would keep on shortening the expression. e.g.
> <pre>
> { { ( { } ) } }
>       |_|
> 
> { { (      ) } }
>     |______|
> 
> { {          } }
>   |__________|
> 
> {                }
> |________________|
> </pre>
> VALID EXPRESSION!
> </details>
> 
> <details>
> <summary>Hint 3</summary>
> The <b>stack</b> data structure can come in handy here in representing this recursive structure of the problem. We can't really process this from the inside out because we don't have an idea about the overall structure. But, the stack can help us process this recursively i.e. from outside to inwards.
> </details>

## 解决方案

### 方法一：栈（Stack）

```cpp
class Solution {
public:
    bool isValid(string s) {
        if (s.empty()) {
            return true;
        }
        if (s.size() % 2 != 0) {
            return false;
        }
        stack<char> st;
        for (int i = 0; i < s.size(); i++) {
            if (s[i] == '(' || s[i] == '[' || s[i] == '{') {
                st.push(s[i]);
            } else {
                if (st.empty()) {
                    return false;
                }
                if ((s[i] == ')' && st.top() != '(') || (s[i] == ']' && st.top() != '[') || (s[i] == '}' && st.top() !='{')) {
                    return false;
                }
                st.pop();
            }
        }
        return st.empty();
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)。
* 空间复杂度：_O_(n)。

## 参考链接

* [Valid Parentheses - LeetCode](https://leetcode.com/problems/valid-parentheses/){:target="_blank"}
