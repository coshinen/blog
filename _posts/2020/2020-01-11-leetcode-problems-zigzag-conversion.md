---
layout: post
title:  "LeetCode 6. Z 字形变换 中等"
date:   2020-01-11 14:57:51 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode String
excerpt: 给定一个字符串 `"PAYPALISHIRING"`，根据给定的行数，以从上到下、从左到右的 Z 字形排列，再以从左到右、从上到下的顺序读取，产生一个新字符串并返回。
---
> ## 6. ZigZag Conversion | Medium
> 
> The string `"PAYPALISHIRING"` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)
> 
> <pre>
> P   A   H   N
> A P L S I I G
> Y   I   R
> </pre>
> 
> And then read line by line: `"PAHNAPLSIIGYIR"`
> 
> Write the code that will take a string and make this conversion given a number of rows:
> 
> <pre>
> string convert(string s, int numRows);
> </pre>
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> s = "PAYPALISHIRING", numRows = 3
> <strong>Output:</strong> "PAHNAPLSIIGYIR"
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> s = "PAYPALISHIRING", numRows = 4
> <strong>Output:</strong> "PINALSIGYAHRPI"
> <strong>Explanation:</strong>
> 
> P     I    N
> A   L S  I G
> Y A   H R
> P     I
> </pre>

## 解决方案

### 方法一：按行排序（Sort by Row）

用 min(numRow, len(s)) 个字符串来保存每行从左到右读取的结果。
迭代字符串 s，把每个字符添加到对应行的字符串里。
用当前行 curRow 和当前方向 goingDown 两个变量对行进行跟踪。
只有迭代到最下面或最上面一行时，方向才会改变。

```cpp
class Solution {
public:
    string convert(string s, int numRows) {
        if (numRows == 1) return s;
        vector<string> rows(min(numRows, int(s.size())));
        int curRow = 0;
        bool goingDown = false;
        for (char c : s) {
            rows[curRow] += c;
            if (curRow == 0 || curRow == numRows - 1) goingDown = !goingDown;
            curRow += goingDown ? 1 : -1;
        }
        string ret;
        for (string row : rows) ret += row;
        return ret;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，其中 n == len(s)。
* 空间复杂度：_O_(n)。

### 方法二：按行访问（Visit by Row）

按照从左到右从上到下的顺序访问字符串。

分三行时的下标：
```
0   4   8     12
1 3 5 7 9  11 13
2   6   10
```

分四行时的下标：
```
0     6       12
1   5 7    11 13
2 4   8 10
3     9
```

对于所有整数 k：
* 第 0 行的字符位于索引 k(numRows + (numRows - 2)) 处。
* 中间行 i 的字符位于索引 k(numRows + (numRows - 2)) + i 和 (k + 1)(numRows + (numRows - 2)) - i 处。
* 第 numRows - 1 行的字符位于索引 k(numRows + (numRows - 2)) + numRows - 1 处。

```cpp
class Solution {
public:
    string convert(string s, int numRows) {
        if (numRows == 1) return s;
        string ret;
        int len = s.size();
        int cycleLen = numRows + numRows - 2;
        for (int i = 0; i < numRows; i++) {
            for (int j = 0; j + i < len; j += cycleLen) {
                ret += s[j + i];
                if (i != 0 && i != numRows - 1 && j + cycleLen - i < len) {
                    ret += s[j + cycleLen - i];
                }
            }
        }
        return ret;
    }
};
```

复杂度分析：
* 时间复杂度：_O_(n)，其中 n == len(s)。每个索引被访问一次。
* 空间复杂度：_O_(n)。

## 参考链接

* [ZigZag Conversion - LeetCode](https://leetcode.com/problems/zigzag-conversion/){:target="_blank"}
