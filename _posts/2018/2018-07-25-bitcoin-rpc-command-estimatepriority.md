---
layout: post
title:  "比特币 RPC 命令剖析 \"estimatepriority\""
date:   2018-07-25 20:09:52 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli estimatepriority nblocks
---
## 1. 帮助内容

```shell
$ bitcoin-cli help estimatepriority
estimatepriority nblocks

估算一笔 0 费用的交易在第 nblocks 个区块开始确认的大致优先级。

参数：
1. nblocks（数字）

结果：
n（数字）估算的优先级

如果没有观察足够的交易和区块用来估算则返回一个负值。

例子：
> bitcoin-cli estimatepriority 6
```

## 2. 源码剖析

`estimatepriority` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue estimatepriority(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue estimatepriority(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "estimatepriority nblocks\n"
            "\nEstimates the approximate priority a zero-fee transaction needs to begin\n"
            "confirmation within nblocks blocks.\n"
            "\nArguments:\n"
            "1. nblocks     (numeric)\n"
            "\nResult:\n"
            "n              (numeric) estimated priority\n"
            "\n"
            "A negative value is returned if not enough transactions and blocks\n"
            "have been observed to make an estimate.\n"
            "\nExample:\n"
            + HelpExampleCli("estimatepriority", "6")
            ); // 1. 帮助内容

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 2. RPC 类型检测

    int nBlocks = params[0].get_int();
    if (nBlocks < 1)
        nBlocks = 1;

    return mempool.estimatePriority(nBlocks); // 3. 根据给定区块号估算优先级并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
