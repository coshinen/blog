---
layout: post
title:  "比特币 RPC 命令剖析 \"getdifficulty\""
date:   2018-05-31 15:41:33 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getdifficulty
---
## 1. 帮助内容

```shell
getdifficulty

以最低难度（1.0）的倍数返回工作量证明难度。

结果：
n.nnn（数字）工作量证明难度是最低难度（1）的倍数。

例子：
> bitcoin-cli getdifficulty
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getdifficulty", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 源码剖析

`getdifficulty` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getdifficulty(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getdifficulty(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getdifficulty\n"
            "\nReturns the proof-of-work difficulty as a multiple of the minimum difficulty.\n"
            "\nResult:\n"
            "n.nnn       (numeric) the proof-of-work difficulty as a multiple of the minimum difficulty.\n"
            "\nExamples:\n"
            + HelpExampleCli("getdifficulty", "")
            + HelpExampleRpc("getdifficulty", "")
        ); // 1. 帮助内容

    LOCK(cs_main);
    return GetDifficulty(); // 2. 获取的难度值并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 获取的难度值并返回

函数 `GetDifficulty()` 实现在文件 `rpcblockchain.cpp` 中。

```cpp
double GetDifficulty(const CBlockIndex* blockindex)
{
    // Floating point number that is a multiple of the minimum difficulty, // 最低难度倍数的浮点数
    // minimum difficulty = 1.0. // 最低难度 = 1.0。
    if (blockindex == NULL)
    {
        if (chainActive.Tip() == NULL) // 链尖为空
            return 1.0; // 返回最低难度
        else
            blockindex = chainActive.Tip(); // 获取活跃的链尖区块索引
    }

    int nShift = (blockindex->nBits >> 24) & 0xff; // 获取 nBits 的高 8 位 2 进制

    double dDiff = // main and testnet (0x1d00ffff) or regtest (0x207fffff) 0x1e0ffff0 (dash)
        (double)0x0000ffff / (double)(blockindex->nBits & 0x00ffffff); // 计算难度并返回

    while (nShift < 29)
    {
        dDiff *= 256.0;
        nShift++;
    }
    while (nShift > 29) // main and testnet (0x1d, 29) or regtest (0x20, 32)
    {
        dDiff /= 256.0;
        nShift--;
    }

    return dDiff;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
