---
layout: post
title:  "LeetCode 79. 单词搜索（中等）"
date:   2021-06-05 08:20:13 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium Array Backtracking
excerpt:
  给定一个 `m x n` 的字符网格 `board` 和一个字符串 `word`，*如果 `word` 存在于网格*返回 `true`。<br>
  单词按字母顺序由相邻单元格的字母构成，相邻单元格是水平或垂直相邻的。
  同一个单元格的字母不能重复使用。
---
> ## 79. Word Search
> 
> Given an `m x n` grid of characters `board` and a string `word`, return `true`
> *if `word` exists in the grid*.
> 
> The word can be constructed from letters of sequentially adjacent cells, where
> adjacent cells are horizontally or vertically neighboring. The same letter
> cell may not be used more than once.
> 
> **Example 1:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/04/word2.jpg" style="width: 322px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
> <strong>Output:</strong> true
> </pre>
> 
> **Example 2:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/11/04/word-1.jpg" style="width: 322px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"
> <strong>Output:</strong> true
> </pre>
> 
> **Example 3:**
> 
> <img alt="" src="https://assets.leetcode.com/uploads/2020/10/15/word3.jpg" style="width: 322px; height: 242px;">
> 
> <pre>
> <strong>Input:</strong> board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"
> <strong>Output:</strong> false
> </pre>
> 
> **Constraints:**
> 
> * `m == board.length`
> * `n = board[i].length`
> * `1 <= m, n <= 6`
> * `1 <= word.length <= 15`
> * `board` and `word` consists of only lowercase and uppercase English letters.
> 
> **Follow up:** Could you use search pruning to make your solution faster with
> a larger `board`?

## 解决方案

### 方法一：回溯

```cpp
class Solution {
private:
    bool check(vector<vector<char>>& board, vector<vector<int>>& visited, int i, int j, string& s, int k) {
        if (board[i][j] != s[k]) {
            return false;
        } else if (k == s.size() - 1) {
            return true;
        }
        visited[i][j] = true;
        vector<pair<int, int>> directions{ {0, 1}, {0, -1}, {1, 0}, {-1, 0}};
        bool result = false;
        for (const auto& dir: directions) {
            int newi = i + dir.first, newj = j + dir.second;
            if (newi >= 0 && newi < board.size() &&
                newj >= 0 && newj < board[0].size() &&
                !visited[newi][newj]) {
                bool flag = check(board, visited, newi, newj, s, k + 1);
                if (flag) {
                    result = true;
                    break;
                }
            }
        }
        visited[i][j] = false;
        return result;
    }
    
public:
    bool exist(vector<vector<char>>& board, string word) {
        int m = board.size(), n = board[0].size();
        vector<vector<int>> visited(m, vector<int>(n));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                bool flag = check(board, visited, i, j, word, 0);
                if (flag) return true;
            }
        }
        return false;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(mnx3<sup>len</sup>)。
  m 和 n 分别为网格的长和宽，len 为字符串的长度。
* 空间复杂度：*O*(mn)。
  数组 visited 大小为 *O*(mn)，栈深度最大为 *O*(min(mn, len))。

## 参考链接

* [Word Search - LeetCode](https://leetcode.com/problems/word-search/){:target="_blank"}
