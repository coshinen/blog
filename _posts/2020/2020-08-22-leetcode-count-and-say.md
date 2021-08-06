---
layout: post
title:  "LeetCode 38. 外观数列（简单）"
date:   2020-08-22 07:38:58 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy String
---
> 该**外观数列**是由递归公式定义的数字字符串序列：
> 
> * `countAndSay(1) = "1"`
> * `countAndSay(n)` 是从 `countAndSay(n-1)` 中“说出”数字字符串，然后将其转换为不同的数字字符串。
> 
> 要确定如何“说出”一个数字字符串，把它分成**最少**数量的组，使每个组都是一个连续的部分，所有部分具有**相同的字符**。
> 然后对于每个组，说出字符数，然后说出字符。
> 把语句转换为数字字符串，用数字替换计数，然后把每个语句串联起来。
> 
> 例如，说出并转换数字字符串 `"3322251"`：
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/23/countandsay.jpg" style="width: 581px; height: 172px;">
> 
> 给定一个正整数 `n`，返回第 `n` 个**外观**数列。
> 
> **限制条件：**
> 
> * `1 <= n <= 30`
> 
> <details>
> <summary>提示 1</summary>
> 下面是从 n=1 到 n=10 的外观数列：
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
> <summary>提示 2</summary>
> 生成第 <em>n</em> 个，只需要第 <em>n</em> 个。
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
