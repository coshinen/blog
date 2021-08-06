---
layout: post
title:  "LeetCode 36. 有效的数独（中等）"
date:   2020-08-08 13:13:10 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Hash-Table
---
> 判断一个 `9x9` 的数独是否有效。
> 只需**根据以下规则**验证已填入的数字：
> 
> 1. 每一行必须包含数字 `1-9` 且不能重复。
> 2. 每一列必须包含数字 `1-9` 且不能重复。
> 3. 每个 `3x3` 的子网格必须包含数字 `1-9` 且不能重复。
> 
> **注意：**
> 
> * 数独（部分填充）可能有效，但不一定可解。
> * 只有填充的单元格需要根据上述规则进行验证。
> 
> <img style="height:250px; width:250px" src="https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714svg.png">
> 
> **限制条件：**
> 
> * `board.length == 9`
> * `board[i].length == 9`
> * `board[i][j]` 是一个数或 '.'。

## 解决方案

### 方法一：一次迭代

```cpp
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        unordered_map<char, int> rows[9], colums[9], boxes[9];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char num = board[i][j];
                if (num != '.') {
                    int box_idx = (i / 3) * 3 + j / 3;
                    rows[i][num]++;
                    colums[j][num]++;
                    boxes[box_idx][num]++;
                    if (rows[i][num] > 1 || colums[j][num] > 1 || boxes[box_idx][num] > 1)
                        return false;
                }
            }
        }
        return true;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(1)。
  只迭代了 81 个单元格一遍。
* 空间复杂度：*O*(1)。

## 参考链接

* [Valid Sudoku - LeetCode](https://leetcode.com/problems/valid-sudoku/){:target="_blank"}
