---
layout: post
title:  "LeetCode 20. 有效的括号（简单）"
date:   2020-04-18 10:07:43 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy String Stack
---
> 给定一个只含字符 `'('`, `')'`, `'{'`, `'}'`, `'['` 和 `']'` 的字符串 `s`，判断输入字符串是否有效。
> 
> 一个输入字符串是否有效：
> 
> 1. 左括号必须由相同类型的右括号闭合。
> 2. 左括号必须按正确的顺序闭合。
> 
> **限制条件：**
> 
> * <code>1 <= s.length <= 10<sup>4</sup></code>
> * `s` 仅由括号 `'()[]{}'` 组成。
> 
> <details>
> <summary>提示 1</summary>
> 有效括号表达的一个有趣特性是，有效表达的子表达也应该是有效表达。（非每个子表达）例如：
> <pre>
> { { } [ ] [ [ [ ] ] ] } 是有效表达
>           [ [ [ ] ] ]   是有效子表达
>   { } [ ]               是有效子表达
> </pre>
> 我们能以某种方式利用这种递归结构吗？
> </details>
> 
> <details>
> <summary>提示 2</summary>
> 如果每当我们在表达中遇到一堆匹配的括号时，我们只是将其从表达中删除会怎样？
> 这将不断缩短表达。例如：
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
> 有效表达！
> </details>
> 
> <details>
> <summary>提示 3</summary>
> 在这里<b>堆栈</b>数据结构可以方便地表示该问题的这种递归结构。
> 我们不能从内到外处理这个问题，因为我们对整体结构没有概念。
> 但，堆栈可以帮助我们递归处理该问题，即从外到内。
> </details>

## 解决方案

### 方法一：栈

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
* 时间复杂度：*O*(n)。
* 空间复杂度：*O*(n)。

## 参考链接

* [Valid Parentheses - LeetCode](https://leetcode.com/problems/valid-parentheses/){:target="_blank"}
