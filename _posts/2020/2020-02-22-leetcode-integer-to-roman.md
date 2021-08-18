---
layout: post
title:  "LeetCode 12. 整数转罗马数字（中等）"
date:   2020-02-22 20:23:04 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Hash-Table Math String
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
> 给定一个整数，把它转换为一个罗马数字。
> 
> **限制条件：**
> 
> * `1 <= num <= 3999`

## 解决方案

### 方法一：贪心

以阿拉伯数字表示的整数作为 Key 从大到小构建哈希表，对应的 Value 为罗马数字。

Nums | Roman
-----|------
1000 | M
900  | CM
500  | D
400  | CD
100  | C
90   | XC
50   | L
40   | XL
10   | X
9    | IX
5    | V
4    | IV
1    | I

遍历该哈希表，依次使用最大的数所对应的罗马数字来表示。

```cpp
class Solution {
public:
    string intToRoman(int num) {
        int nums[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        string romans[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        string result;
        for (int i = 0; i < 13; i++) {
            while (num >= nums[i]) {
                num -= nums[i];
                result += romans[i];
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
* 空间复杂度：*O*(1)。

## 参考链接

* [Integer to Roman - LeetCode](https://leetcode.com/problems/integer-to-roman/){:target="_blank"}
