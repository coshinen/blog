---
layout: post
title:  "LeetCode 13. 罗马数字转整数（简单）"
date:   2020-02-29 19:48:34 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Easy Hash-Table Math String
---
> 罗马数字由七种不同的符号表示：`I`、`V`、`X`、`L`、`C`、`D` 和 `M`。
> 
> <pre>
> Symbol       Value
> I             1
> V             5
> X             10
> L             50
> C             100
> D             500
> M             1000
> </pre>
> 
> 例如，`2` 用罗马数字写作 `II`，就是两个 1 加在一起。
> `12` 写作 `XII`，就是简单的 `X + II`。
> 数字 `27` 写作 `XXVII`，就是 `XX + V + II`。
> 
> 罗马数字通常是从左到右从大到小写的。
> 然而，数字 4 不是 `IIII`。
> 取而代之的是，数字 4 写作 `IV`。
> 因为 1 在 5 的前面，我们减去它就等于 4。
> 同样的原则也适用于数字 9，即写作 `IX`。
> 使用减法的情况有 6 种：
> 
> * `I` 可以放在 `V`（5）和 `X`（10）前变成 4 和 9。
> * `X` 可以放在 `L`（50）和 `C`（100）前变成 40 和 90。 
> * `C` 可以放在 `D`（500）和 `M`（1000）前变成 400 和 900。
> 
> 给定一个罗马数字，把它转换为一个整数。
> 
> **限制条件：**
> 
> * `1 <= s.length <= 15`
> * `s` 仅包含字符（`I`、`V`、`X`、`L`、`C`、`D`、`M`）。
> * 已**确保** `s` 是一个有效的罗马数字在范围 `[1, 3999]` 里。
> 
> <details>
> <summary>提示 1</summary>
> 通过从后往前处理字符串并使用映射，问题更容易解决。
> </details>

## 解决方案

### 方法一：使用 STL 哈希表

```cpp
class Solution {
public:
    int romanToInt(string s) {
        unordered_map<string, int> umap = {
            {"I", 1},
            {"IV", 3},
            {"IX", 8},
            {"V", 5},
            {"X", 10},
            {"XL", 30},
            {"XC", 80},
            {"L", 50},
            {"C", 100},
            {"CD", 300},
            {"CM", 800},
            {"D", 500},
            {"M", 1000}
        };
        int result = umap[s.substr(0, 1)];
        for (int i = 1; i < s.size(); i++) {
            string two = s.substr(i - 1, 2);
            string one = s.substr(i, 1);
            result += umap[two] ? umap[two] : umap[one];
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  STL unordered_map 的查找速度为 *O*(1)，只需遍历字符串一次。
* 空间复杂度：*O*(1)。

## 参考链接

* [Roman to Integer - LeetCode](https://leetcode.com/problems/roman-to-integer/){:target="_blank"}
