---
layout: post
title:  "LeetCode 32. 最长有效括号 困难"
date:   2020-07-11 08:57:01 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode String Dynamic-Programming
excerpt: 给定一个只包含 `'('` 和 `')'` 的字符串，找出最长的有效（格式正确的）括号子串的长度。
---
## 32. Longest Valid Parentheses | Hard

> Given a string containing just the characters `'('` and `')'`, find the length of the longest valid (well-formed) parentheses substring.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> "(()"
> <strong>Output:</strong> 2
> <strong>Explanation:</strong> The longest valid parentheses substring is "()"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> ")()())"
> <strong>Output:</strong> 4
> <strong>Explanation:</strong> The longest valid parentheses substring is "()()"
> </pre>

## 解决方案

### 方法一：动态规划（Dynamic Programming）

有效子串一定以右括号 `')'` 结尾，所以左括号 `'('` 结尾的子串 dp 值为 0。

状态转移方程：
* dp[i] = dp[i - 2] + 2, s[i] == ')' 且 s[i - 1] == '('
* dp[i] = dp[i - 1] + dp[i - dp[i - 1] -2] + 2, s[i] == ')' 且 s[i - 1] == ')' 且 s[i - dp[i - 1] - 1] == '('

其中第 i 个元素表示以字符串中第 i 个字符结尾的最长有效子串的长度。

```cpp
class Solution {
public:
    int longestValidParentheses(string s) {
        int maxlen = 0, n = s.size();
        vector<int> dp(n, 0);
        for (int i = 1; i < n; i++) {
            if (s[i] == ')') {
                if (s[i - 1] == '(') {
                    dp[i] = (i - 2 >= 0 ? dp[i - 2] : 0) + 2;
                } else if (i - dp[i - 1] - 1 >= 0 && s[i - dp[i - 1] - 1] == '(') {
                    dp[i] = dp[i - 1] + (i - dp[i - 1] - 2 >= 0 ? dp[i - dp[i - 1] - 2] : 0) + 2;
                }
                maxlen = max(maxlen, dp[i]);
            }
        }
        return maxlen;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，n 为字符串长度，只需遍历字符串一次。
* 空间复杂度：_O_(n)，动态规划数组的大小为 n。

### 方法二：栈（Stack）

```cpp
class Solution {
public:
    int longestValidParentheses(string s) {
        int maxlen = 0;
        stack<int> stk;
        stk.push(-1);
        for (int i = 0; i < s.size(); i++) {
            if (s[i] == '(') {
                stk.push(i);
            } else {
                stk.pop();
                if (stk.empty()) {
                    stk.push(i);
                } else {
                    maxlen = max(maxlen, i - stk.top());
                }
            }
        }
        return maxlen;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，n 为字符串长度，只需遍历字符串一次。
* 空间复杂度：_O_(n)，栈最大为 n。

### 方法三：不使用额外空间（Without extra space）

```cpp
class Solution {
public:
    int longestValidParentheses(string s) {
        int left = 0, right = 0, maxlen = 0;
        for (int i = 0; i < s.size(); i++) {
            if (s[i] == '(') {
                left++;
            } else {
                right++;
            }
            if (left == right) {
                maxlen = max(maxlen, 2 * right);
            } else if (right > left) {
                left = right = 0;
            }
        }
        left = right = 0;
        for (int i = s.size() - 1; i >= 0; i--) {
            if (s[i] == '(') {
                left++;
            } else {
                right++;
            }
            if (left == right) {
                maxlen = max(maxlen, 2 * left);
            } else if (left > right) {
                left = right = 0;
            }
        }
        return maxlen;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，n 为字符串长度，需要正反遍历 2 遍字符串。
* 空间复杂度：_O_(1)。

## 参考链接

* [Longest Valid Parentheses - LeetCode](https://leetcode.com/problems/longest-valid-parentheses/){:target="_blank"}
