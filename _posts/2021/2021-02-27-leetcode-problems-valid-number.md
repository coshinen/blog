---
layout: post
title:  "LeetCode 65. 有效数字（困难）"
date:   2021-02-27 17:08:37 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Hard Math String
excerpt:
  一个**有效数字**可以分成下面几个部分（按顺序）：<br>
  1. 一个**小数**或一个**整数**。<br>
  2. （可选）一个 `'e'` 或 `'E'`，后面跟一个**整数**。<br>
  一个**小数**可以分成下面几个部分（按顺序）：<br>
  1. （可选）一个符号字符（`'+'` 或 `'-'`）。<br>
  2. 下面格式之一：<br>
  &nbsp;&nbsp;1. 至少一个数字，后面跟一个点 `'.'`。<br>
  &nbsp;&nbsp;2. 至少一个数字，后面跟一个点 `'.'`，后面再跟至少一个数字。<br>
  &nbsp;&nbsp;3. 一个点 `'.'`，后面跟至少一个数字。<br>
  一个**整数**可以分成下面几个部分（按顺序）：<br>
  1. （可选）一个符号字符（`'+'` 或 `'-'`）。<br>
  2. 至少一个数字。<br>
  给定一个字符串 `s`，*如果 `s` 是一个**有效数字***返回 `true`。
---
> ## 65. Valid Number
> 
> A **valid number** can be split up into these components (in order):
> 
> 1. A **decimal number** or an **integer**.
> 2. (Optional) An `'e'` or `'E'`, followed by an **integer**.
> 
> A **decimal number** can be split up into these components (in order):
> 
> 1. (Optional) A sign character (either `'+'` or `'-'`).
> 2. One of the following formats:
>    1. At least one digit, followed by a dot `'.'`.
>    2. At least one digit, followed by a dot `'.'`, followed by at least one digit.
>    3. A dot `'.'`, followed by at least one digit.
> 
> An **integer** can be split up into these components (in order):
> 
> 1. (Optional) A sign character (either `'+'` or `'-'`).
> 2. At least one digit.
> 
> For example, all the following are valid numbers: `["2", "0089", "-0.1",
> "+3.14", "4.", "-.9", "2e10", "-90E3", "3e+7", "+6e-1", "53.5e93",
> "-123.456e789"]`, while the following are not valid numbers: `["abc", "1a",
> "1e", "e3", "99e2.5", "--6", "-+3", "95a54e53"]`.
> 
> Given a string `s`, return `true` *if `s` is a **valid number***.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> s = "0"
> <strong>Output:</strong> true
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> s = "e"
> <strong>Output:</strong> false
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> s = "."
> <strong>Output:</strong> false
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> s = ".1"
> <strong>Output:</strong> true
> </pre>
> 
> **Constraints:**
> 
> * `1 <= s.length <= 20`
> * `s` consists of only English letters (both uppercase and lowercase), digits
> (`0-9`), plus `'+'`, minus `'-'`, or dot `'.'`.

## 解决方案

### 方法一：有限状态自动机

```cpp
class Solution {
private:
    enum State {
        STATE_INIT,
        STATE_INT_SIGN,
        STATE_INT,
        STATE_POINT,
        STATE_POINT_WITHOUT_INT,
        STATE_FRACTION,
        STATE_EXP,
        STATE_EXP_SIGN,
        STATE_EXP_NUM,
        STATE_END
    };
    enum CharType {
        CHAR_NUM,
        CHAR_EXP,
        CHAR_POINT,
        CHAR_SIGN,
        CHAR_ILLEGAL
    };
    CharType toCharType(char ch) {
        if (ch >= '0' && ch <= '9') {
            return CHAR_NUM;
        } else if (ch == 'e' || ch == 'E') {
            return CHAR_EXP;
        } else if (ch == '.') {
            return CHAR_POINT;
        } else if (ch == '+' || ch == '-') {
            return CHAR_SIGN;
        } else {
            return CHAR_ILLEGAL;
        }
    }
public:
    bool isNumber(string s) {
        unordered_map<State, unordered_map<CharType, State>> transfer{
            {
                STATE_INIT, {
                    {CHAR_NUM, STATE_INT},
                    {CHAR_POINT, STATE_POINT_WITHOUT_INT},
                    {CHAR_SIGN, STATE_INT_SIGN}
                }
            }, {
                STATE_INT_SIGN, {
                    {CHAR_NUM, STATE_INT},
                    {CHAR_POINT, STATE_POINT_WITHOUT_INT}
                }
            }, {
                STATE_INT, {
                    {CHAR_NUM, STATE_INT},
                    {CHAR_EXP, STATE_EXP},
                    {CHAR_POINT, STATE_POINT}
                }
            }, {
                STATE_POINT, {
                    {CHAR_NUM, STATE_FRACTION},
                    {CHAR_EXP, STATE_EXP}
                }
            }, {
                STATE_POINT_WITHOUT_INT, {
                    {CHAR_NUM, STATE_FRACTION}
                }
            }, {
                STATE_FRACTION, {
                    {CHAR_NUM, STATE_FRACTION},
                    {CHAR_EXP, STATE_EXP}
                }
            }, {
                STATE_EXP, {
                    {CHAR_NUM, STATE_EXP_NUM},
                    {CHAR_SIGN, STATE_EXP_SIGN}
                }
            }, {
                STATE_EXP_SIGN, {
                    {CHAR_NUM, STATE_EXP_NUM}
                }
            }, {
                STATE_EXP_NUM, {
                    {CHAR_NUM, STATE_EXP_NUM}
                }
            }
        };
        int len = s.size();
        State state = STATE_INIT;
        for (int i = 0; i < len; i++) {
            CharType type = toCharType(s[i]);
            if (transfer[state].find(type) == transfer[state].end()) {
                return false;
            } else {
                state = transfer[state][type];
            }
        }
        return state == STATE_INT || state == STATE_POINT || state == STATE_FRACTION || state == STATE_EXP_NUM || state == STATE_END;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为输入字符串的长度，只需遍历字符串一次，状态转移的时间复杂度为 *O*(1)。
* 空间复杂度：*O*(1)。
  状态转移表大小固定。

## 参考链接

* [Valid Number - LeetCode](https://leetcode.com/problems/valid-number/){:target="_blank"}
