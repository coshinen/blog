---
layout: post
title:  "LeetCode 68. 文本对齐（困难）"
date:   2021-03-20 19:21:46 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Hard String
excerpt:
  给定一个单词数组和一个宽度 *maxWidth*，格式化文本，使每一行都恰好有 *maxWidth* 个字符，并且完全（左右）对齐。<br>
  你应该使用贪心算法来放置给定的单词；
  也就是说，尽可能多地往每行里放置单词。
  必要时可填充额外的空格 `' '` 使每行刚好有 *maxWidth* 个字符。<br>
  单词之间多余的空格应该尽可能均匀地分布。
  如果一行中的空格数不能在单词之间平均分配，则左侧的空槽将被分配比右侧更多的空格。<br>
  对于文本的最后一行，应该向左对齐，并且单词之间不能插入**额外的**空格。<br>
  **注意：**<br>
  * 一个单词定义为仅由非空格字符组成的字符序列。<br>
  * 每个单词的长度保证大于 0 且不超过 *maxWidth*。<br>
  * 输入数组 `words` 至少包含一个词。
---
> ## 68. Text Justification
> 
> Given an array of words and a width *maxWidth*, format the text such that each
> line has exactly *maxWidth* characters and is fully (left and right)
> justified.
> 
> You should pack your words in a greedy approach; that is, pack as many words
> as you can in each line. Pad extra spaces `' '` when necessary so that each
> line has exactly *maxWidth* characters.
> 
> Extra spaces between words should be distributed as evenly as possible. If the
> number of spaces on a line do not divide evenly between words, the empty slots
> on the left will be assigned more spaces than the slots on the right.
> 
> For the last line of text, it should be left justified and no **extra** space
> is inserted between words.
> 
> **Note:**
> 
> * A word is defined as a character sequence consisting of non-space characters
> only.
> * Each word's length is guaranteed to be greater than 0 and not exceed
> *maxWidth*.
> * The input array `words` contains at least one word.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> words = ["This", "is", "an", "example", "of", "text", "justification."], maxWidth = 16
> <strong>Output:</strong>
> [
>    "This    is    an",
>    "example  of text",
>    "justification.  "
> ]
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> words = ["What","must","be","acknowledgment","shall","be"], maxWidth = 16
> <strong>Output:</strong>
> [
>   "What   must   be",
>   "acknowledgment  ",
>   "shall be        "
> ]
> <strong>Explanation:</strong> Note that the last line is "shall be    " instead of "shall     be", because the last line must be left-justified instead of fully-justified.
> Note that the second line is also left-justified becase it contains only one word.
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> words = ["Science","is","what","we","understand","well","enough","to","explain","to","a","computer.","Art","is","everything","else","we","do"], maxWidth = 20
> <strong>Output:</strong>
> [
>   "Science  is  what we",
>   "understand      well",
>   "enough to explain to",
>   "a  computer.  Art is",
>   "everything  else  we",
>   "do                  "
> ]
> </pre>
> 
> **Constraints:**
> 
> * `1 <= words.length <= 300`
> * `1 <= words[i].length <= 20`
> * `words[i]` consists of only English letters and symbols.
> * `1 <= maxWidth <= 100`
> * `words[i].length <= maxWidth`

## 解决方案

### 方法一：贪心算法

```cpp
class Solution {
private:
    string packLine(vector<string>& words, int begin, int end, int maxWidth, bool lastLine = false) {
        int wordCount = end - begin + 1;
        int spaceCount = maxWidth - wordCount + 1;
        for (int i = begin; i <= end; i++) {
            spaceCount -= words[i].size();
        }
        int spaceSuffix = 1;
        int spaceAvg = (wordCount == 1) ? 1 : spaceCount / (wordCount - 1);
        int spaceExtra = (wordCount == 1) ? 1 : spaceCount % (wordCount - 1);
        string line;
        for (int i = begin; i < end; i++) {
            line += words[i];
            if (lastLine) {
                fill_n(back_inserter(line), 1, ' ');
                continue;
            }
            fill_n(back_inserter(line), spaceSuffix + spaceAvg + ((i - begin) < spaceExtra), ' ');
        }
        line += words[end];
        fill_n(back_inserter(line), maxWidth - line.size(), ' ');
        return line;
    }

public:
    vector<string> fullJustify(vector<string>& words, int maxWidth) {
        vector<string> result;
        int count = 0, begin = 0, n = words.size();
        for (int i = 0; i < n; i++) {
            count += words[i].size() + 1;
            if (i == n - 1 || count + words[i + 1].size() > maxWidth) {
                result.push_back(packLine(words, begin, i, maxWidth, i == n - 1));
                begin = i + 1;
                count = 0;
            }
        }
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为给定数组的单词数。
* 空间复杂度：*O*(1)。

## 参考链接

* [Text Justification - LeetCode](https://leetcode.com/problems/text-justification/){:target="_blank"}
