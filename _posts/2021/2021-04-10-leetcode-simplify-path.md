---
layout: post
title:  "LeetCode 71. 简化路径（中等）"
date:   2021-04-10 17:10:38 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Stack
---
> 给定一个字符串`路径`，表示指向一个 Unix 风格文件系统上文件或目录的**绝对路径**（以一个单斜杠 `'/'` 开头），转换它到简化后的**规范路径**。
> 
> 在一个 Unix 风格的文件系统上，一个句号 `'.'` 表示当前目录，一个双句号 `'..'` 表示目录的上一层级，任意多个连续的斜杠（即，`'//'`）都被当作一个单斜杠 `'/'` 处理。
> 对这个问题，任何其他格式的句号诸如 `'...'` 都被当作文件/目录名处理。
> 
> **规范路径**应该遵循下面的格式：
> 
> * 该路径以一个单斜杠 `'/'` 开头。
> * 任意两个目录通过一个单斜杠 `'/'` 分隔。
> * 该路径不以 `'/'` 结尾。
> * 该路径只包含从根目录到目标文件或目录的路径上的目录（即，无句号 `'.'` 或双句号 `'..'`）。
> 
> 返回*简化后的**规范路径***。
> 
> **限制条件：**
> 
> * `1 <= path.length <= 3000`
> * `path` 由英文字母、数字、句号 `'.'`、斜杠 `'/'` 或 `'_'` 组成。
> * `path` 是一个有效的 Unix 绝对路径。

## 解决方案

### 方法一：模拟+栈

```cpp
class Solution {
public:
    string simplifyPath(string path) {
        stringstream ss(path);
        vector<string> stack;
        string cur;
        while (getline(ss, cur, '/')) {
            if (cur != "" && cur != ".") {
                if (cur != "..") {
                    stack.push_back(cur);
                } else if (!stack.empty()) {
                    stack.pop_back();
                }
            }
        }
        if (stack.empty()) {
            return "/";
        } else {
            string scpath = "";
            for (string str : stack) {
                scpath.append("/").append(str);
            }
            return scpath;
        }
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为输入路径的目录层级。
* 空间复杂度：*O*(1)。

## 参考链接

* [Simplify Path - LeetCode](https://leetcode.com/problems/simplify-path/){:target="_blank"}
