---
layout: post
title:  "比特币 RPC 命令「estimatesmartpriority」"
date:   2018-07-27 20:47:33 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli estimatesmartpriority nblocks
---
## 1. 帮助内容

```shell
$ bitcoin-cli help estimatesmartpriority
estimatesmartpriority nblocks

警告：这个接口不稳定并且可能消失或改变！

估计一笔 0 交易费的交易在 nblocks 个区块开始确认的大致优先级，如果可能则返回估计有效的区块数

参数：
1. nblocks（数字）

结果：
{
  "priority" : x.x,（数字）估算的优先级
  "blocks" : n     （数字）找到估值的区块号
}

如果没有观察足够的交易和区块来估算任意数量的区块则返回一个负值。
但是如果设置了内存池的拒绝费用则返回 1e9 * MAX_MONEY。

例子：
> bitcoin-cli estimatesmartpriority 6
```

最大钱变量 `MAX_MONEY` 定义在文件 `amount.h` 中，共 2100 万个 BTC。

```cpp
typedef int64_t CAmount;

static const CAmount COIN = 100000000;
static const CAmount CENT = 1000000;

extern const std::string CURRENCY_UNIT;

/** No amount larger than this (in satoshi) is valid.
 *
 * Note that this constant is *not* the total money supply, which in Bitcoin
 * currently happens to be less than 21,000,000 BTC for various reasons, but
 * rather a sanity check. As this sanity check is used by consensus-critical
 * validation code, the exact value of the MAX_MONEY constant is consensus
 * critical; in unusual circumstances like a(nother) overflow bug that allowed
 * for the creation of coins out of thin air modification could lead to a fork.
 * */
static const CAmount MAX_MONEY = 21000000 * COIN;
```

## 2. 源码剖析

`estimatesmartpriority` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue estimatesmartpriority(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue estimatesmartpriority(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "estimatesmartpriority nblocks\n"
            "\nWARNING: This interface is unstable and may disappear or change!\n"
            "\nEstimates the approximate priority a zero-fee transaction needs to begin\n"
            "confirmation within nblocks blocks if possible and return the number of blocks\n"
            "for which the estimate is valid.\n"
            "\nArguments:\n"
            "1. nblocks     (numeric)\n"
            "\nResult:\n"
            "{\n"
            "  \"priority\" : x.x,    (numeric) estimated priority\n"
            "  \"blocks\" : n         (numeric) block number where estimate was found\n"
            "}\n"
            "\n"
            "A negative value is returned if not enough transactions and blocks\n"
            "have been observed to make an estimate for any number of blocks.\n"
            "However if the mempool reject fee is set it will return 1e9 * MAX_MONEY.\n"
            "\nExample:\n"
            + HelpExampleCli("estimatesmartpriority", "6")
            ); // 1. 帮助内容

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 2. RPC 类型检测

    int nBlocks = params[0].get_int();

    UniValue result(UniValue::VOBJ);
    int answerFound;
    double priority = mempool.estimateSmartPriority(nBlocks, &answerFound); // 3. 估算精确的优先级同时获取相应的区块号并返回
    result.push_back(Pair("priority", priority));
    result.push_back(Pair("blocks", answerFound));
    return result;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/amount.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/amount.h){:target="_blank"}
* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
