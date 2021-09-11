---
layout: post
title:  "LeetCode 93. 恢复 IP 地址（中等）"
date:   2021-09-11 20:33:41 +0800
author: Coshin
comments: true
category: 力扣题解
tags: LeetCode Medium String Backtracking
---
> 给定一个仅含数字的字符串 `s`，返回所有可能从 `s` 中获得的有效 IP 地址。
> 你可以以**任何**顺序返回它们。
> 
> 一个**有效的 IP 地址**由确定的 4 个整数组成，每个整数在范围 `0` 到 `255` 中，通过点分隔并且没有前导零。
> 例如，“0.1.2.201” 和 “192.168.1.1” 是**有效的** IP 地址，“0.011.255.245”、“192.168.1.312” 和 “192.168@1.1” 是**无效的** IP 地址。
> 
> **限制条件：**
> 
> * `0 <= s.length <= 3000`
> * `s` 仅由数字组成。

## 解决方案

### 方法一：回溯

```cpp
class Solution {
private:
    vector<int> segments;
    vector<string> result;

    void dfs(const string& s, int id, int start) {
        if (id == 4) {
            if (start == s.size()) {
                string ip;
                for (int i = 0; i < 4; i++) {
                    ip += to_string(segments[i]);
                    if (i != 4 - 1) ip += ".";
                }
                result.push_back(ip);
            }
            return;
        }
        if (start == s.size()) return;
        if (s[start] == '0') {
            segments[id] = 0;
            dfs(s, id + 1, start + 1);
        }
        int addr = 0;
        for (int end = start; end < s.size(); end++) {
            addr = addr * 10 + (s[end] - '0');
            if (addr > 0 && addr <= 255) {
                segments[id] = addr;
                dfs(s, id + 1, end + 1);
            } else {
                break;
            }
        }
    }

public:
    vector<string> restoreIpAddresses(string s) {
        segments.resize(4);
        dfs(s, 0, 0);
        return result;
    }
};
```

复杂度分析：
* 时间复杂度：*O*(n)。
  n 为输入字符串的长度。
* 空间复杂度：*O*(1)。

## 参考链接

* [Restore IP Addresses - LeetCode](https://leetcode.com/problems/restore-ip-addresses/){:target="_blank"}
