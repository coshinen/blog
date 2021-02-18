---
layout: post
title:  "LeetCode 38. 外观数列 简单"
date:   2020-08-22 07:38:58 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Easy String
excerpt:
  外观数列是下面前 5 项的整数序列：<br>
  ……<br>
  给定一个整数 *n* (1 ≤ *n* ≤ 30)，生成外观数列的第 *n* 项。
---
> ## 38. Count and Say
> 
> The count-and-say sequence is the sequence of integers with the first five
> terms as following:
> 
> <pre>
> 1.     1
> 2.     11
> 3.     21
> 4.     1211
> 5.     111221
> </pre>
> 
> `1` is read off as `"one 1"` or `11`.<br>
> `11` is read off as `"two 1s"` or `21`.<br>
> `21` is read off as `"one 2, then one 1"` or `1211`.
> 
> Given an integer *n* where 1 ≤ *n* ≤ 30, generate the *n*<sup>th</sup> term of
> the count-and-say sequence. You can do so recursively, in other words from the
> previous member read off the digits, counting the number of digits in groups
> of the same digit.
> 
> Note: Each term of the sequence of integers will be represented as a string.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> 1
> <strong>Output:</strong> "1"
> <strong>Explanation:</strong> This is the base case.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> 4
> <strong>Output:</strong> "1211"
> <strong>Explanation:</strong> For n = 3 the term was "21" in which we have two groups "2" and "1", "2" can be read as "12" which means frequency = 1 and value = 2, the same way "1" is read as "11", so the answer is the concatenation of "12" and "11" which is "1211".
> </pre>
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
