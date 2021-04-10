---
layout: post
title:  "LeetCode 71. 简化路径（中等）"
date:   2021-04-10 17:10:38 +0800
author: mistydew
comments: true
category: 力扣题解
tags: LeetCode Medium String Stack
excerpt:
  给定一个字符串`路径`，表示指向一个 Unix 风格文件系统上文件或目录的**绝对路径**（以一个单斜杠 `'/'` 开头），转换它到简化后的**规范路径**。<br>
  在一个 Unix 风格的文件系统上，一个句号 `'.'` 表示当前目录，一个双句号 `'..'` 表示目录的上一层级，任意多个连续的斜杠（即，`'//'`）都被当作一个单斜杠 `'/'` 处理。
  对这个问题，任何其他格式的句号诸如 `'...'` 都被当作文件/目录名处理。<br>
  **规范路径**应该遵循下面的格式：<br>
  * 该路径以一个单斜杠 `'/'` 开头。<br>
  * 任意两个目录通过一个单斜杠 `'/'` 分隔。<br>
  * 该路径不以 `'/'` 结尾。<br>
  * 该路径只包含从根目录到目标文件或目录的路径上的目录（即，无句号 `'.'` 或双句号 `'..'`）。<br>
  返回*简化后的**规范路径***。
---
> ## 71. Simplify Path
> 
> Given a string `path`, which is an **absolute path** (starting with a slash
> `'/'`) to a file or directory in a Unix-style file system, convert it to the
> simplified **canonical path**.
> 
> In a Unix-style file system, a period `'.'` refers to the current directory, a
> double period `'..'` refers to the directory up a level, and any multiple
> consecutive slashes (i.e. `'//'`) are treated as a single slash `'/'`. For
> this problem, any other format of periods such as `'...'` are treated as
> file/directory names.
> 
> The **canonical path** should have the following format:
> 
> * The path starts with a single slash `'/'`.
> * Any two directories are separated by a single slash `'/'`.
> * The path does not end with a trailing `'/'`.
> * The path only contains the directories on the path from the root directory
> to the target file or directory (i.e. no period `'.'` or double period `'..'`)
> 
> Return *the simplified **canonical path***.
> 
> **Example 1:**
> 
> <pre>
> <strong>Input:</strong> path = "/home/"
> <strong>Output:</strong> "/home"
> <strong>Explanation:</strong> Note that there is no trailing slash after the last directory name.
> </pre>
> 
> **Example 2:**
> 
> <pre>
> <strong>Input:</strong> path = "/../"
> <strong>Output:</strong> "/"
> <strong>Explanation:</strong> Going one level up from the root directory is a no-op, as the root level is the highest level you can go.
> </pre>
> 
> **Example 3:**
> 
> <pre>
> <strong>Input:</strong> path = "/home//foo/"
> <strong>Output:</strong> "/home/foo"
> <strong>Explanation:</strong> In the canonical path, multiple consecutive slashes are replaced by a single one.
> </pre>
> 
> **Example 4:**
> 
> <pre>
> <strong>Input:</strong> path = "/a/./b/../../c/"
> <strong>Output:</strong> "/c"
> </pre>
> 
> **Constraints:**
> 
> * `1 <= path.length <= 3000`
> * `path` consists of English letters, digits, period `'.'`, slash `'/'` or
> `'_'`.
> * `path` is a valid absolute Unix path.

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
