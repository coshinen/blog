---
layout: post
title:  "LeetCode 43. 字符串相乘（中等）"
date:   2020-09-26 08:17:57 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Math String
---
> 给定两个以字符串形式表示的非负整数 `num1` 和 `num2`，返回 `num1` 和 `num2` 的乘积，也用字符串表示。
> 
> **注：**你不能使用内置的大整数库或直接转换输入为整数。
> 
> **限制条件：**
> 
> * `1 <= num1.length, num2.length <= 200`
> * `num1` 和 `num2` 都仅由数字组成。
> * `num1` 和 `num2` 都不含任何前导零，除数字 `0` 本身。

## 解决方案

### 方法一：做加法

```cpp
class Solution {
private:
    string addStrings(string &num1, string &num2) {
        int i = num1.size() - 1, j = num2.size() - 1, add = 0;
        string result;
        while (i >= 0 || j >= 0 || add != 0) {
            int x = i >= 0 ? num1[i] - '0' : 0;
            int y = j >= 0 ? num2[j] - '0' : 0;
            int tmp = x + y + add;
            result.push_back(tmp % 10);
            add = tmp / 10;
            i--;
            j--;
        }
        reverse(result.begin(), result.end());
        for (auto& c: result) c += '0';
        return result;
    }

public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";
        string result = "0";
        int m = num1.size(), n = num2.size();
        for (int i = n - 1; i >= 0; i--) {
            string tmp;
            int add = 0;
            for (int j = n - 1; j > i; j--) tmp.push_back(0);
            int y = num2[i] - '0';
            for (int j = m - 1; j >= 0; j--) {
                int x = num1[j] - '0';
                int product = x * y + add;
                tmp.push_back(product % 10);
                add = product / 10;
            }
            while (add != 0) {
                tmp.push_back(add % 10);
                add /= 10;
            }
            reverse(tmp.begin(), tmp.end());
            for (auto& c: tmp) c += '0';
            result = addStrings(result, tmp);
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn + n<sup>2</sup>)。
  m 和 n 分别为字符串 num1 和 num2 的长度，从右向左遍历 num2 的每一位都要与 num1 的每一位相乘，计算乘积的次数为 mn。
  字符串相加共 n 次，相加的字符串最长为 m + n，时间复杂度为 *O*(mn + n<sup>2</sup>)。
* 空间复杂度：*O*(m + n)。
  乘积的最大长度为 m + n。

### 方法二：做乘法

```cpp
class Solution {
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";
        int m = num1.size(), n = num2.size();
        auto retArr = vector<int>(m + n);
        for (int i = m - 1; i >= 0; i--) {
            int x = num1[i] - '0';
            for (int j = n - 1; j >= 0; j--) {
                int y = num2[j] - '0';
                retArr[i + j + 1] += x * y;
            }
        }
        for (int i = m + n - 1; i > 0; i--) {
            retArr[i - 1] += retArr[i] / 10;
            retArr[i] %= 10;
        }
        int idx = retArr[0] == 0 ? 1 : 0;
        string result;
        while (idx < m + n) result.push_back(retArr[idx++]);
        for (auto& c: result) c += '0';
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mn)。
  m 和 n 分别为字符串 num1 和 num2 的长度，需要计算 num1 的每一位和 num2 的每一位的乘积。
* 空间复杂度：*O*(m + n)。
  需要额外创建一个长度为 m + n 的数组用于存储乘积。

## 参考链接

* [Multiply Strings - LeetCode](https://leetcode.com/problems/multiply-strings/){:target="_blank"}
