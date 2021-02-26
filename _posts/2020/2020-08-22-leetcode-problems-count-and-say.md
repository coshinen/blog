---
layout: post
title:  "LeetCode 38. 外观数列 简单"
date:   2020-08-22 07:38:58 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy String
excerpt:
  该**外观数列**是由递归公式定义的数字字符串序列：<br>
  * `countAndSay(1) = "1"`<br>
  * `countAndSay(n)` 是从 `countAndSay(n-1)` 中“说出”数字字符串，然后将其转换为不同的数字字符串。<br>
  要确定如何“说出”一个数字字符串，把它分成**最少**数量的组，使每个组都是一个连续的部分，所有部分具有**相同的字符**。
  然后对于每个组，说出字符数，然后说出字符。
  把语句转换为数字字符串，用数字替换计数，然后把每个语句串联起来。
---
> ## 38. Count and Say
> 
> The **count-and-say** sequence is a sequence of digit strings defined by the
> recursive formula:
> 
> * `countAndSay(1) = "1"`
> * `countAndSay(n)` is the way you would "say" the digit string from
> `countAndSay(n-1)`, which is then converted into a different digit string.
> 
> To determine how you "say" a digit string, split it into the **minimal**
> number of groups so that each group is a contiguous section all of the **same
> character**. Then for each group, say the number of characters, then say the
> character. To convert the saying into a digit string, replace the counts with
> a number and concatenate every saying.
> 
> For example, the saying and conversion for digit string `"3322251"`:
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/23/countandsay.jpg" style="width: 581px; height: 172px;">
> 
> Given a positive integer `n`, return the <code>n<sup>th</sup></code> term of
> the **count-and-say** sequence.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> n = 1
> <strong>Output:</strong> "1"
> <strong>Explanation:</strong> This is the base case.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> n = 4
> <strong>Output:</strong> "1211"
> <strong>Explanation:</strong>
> countAndSay(1) = "1"
> countAndSay(2) = say "1" = one 1 = "11"
> countAndSay(3) = say "11" = two 1's = "21"
> countAndSay(4) = say "21" = one 2 + one 1 = "12" + "11" = "1211"
> </pre>
> 
> **Constraints:**
> 
> * `1 <= n <= 30`
> 
> <details>
> <summary>Hint 1</summary>
> The following are the terms from n=1 to n=10 of the count-and-say sequence:
> <pre>
>  1.     1
>  2.     11
>  3.     21
>  4.     1211
>  5.     111221 
>  6.     312211
>  7.     13112221
>  8.     1113213211
>  9.     31131211131221
> 10.     13211311123113112211
> </pre>
> </details>
> 
> <details>
> <summary>Hint 2</summary>
> To generate the <em>n</em><sup>th</sup> term, just count and say the <em>n</em>-1<sup>th</sup> term.
> </details>

## 解决方案

### 方法一：递归

```cpp
class Solution {
public:
    string countAndSay(int n) {
        if (n == 1) return "1";
        string previous = countAndSay(n - 1);
        string result = "";
        int count = 1;
        for (int i = 0; i < previous.size(); i++) {
            if (previous[i] == previous[i + 1]) {
                count++;
            } else {
                result += to_string(count) + previous[i];
                count = 1;
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
  最多递归 29 次。
* 空间复杂度：*O*(1)。
  递归过程使用的堆栈空间。

## 参考链接

* [Count and Say - LeetCode](https://leetcode.com/problems/count-and-say/){:target="_blank"}
