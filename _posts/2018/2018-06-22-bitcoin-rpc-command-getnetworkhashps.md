---
layout: post
title:  "比特币 RPC 命令剖析 \"getnetworkhashps\""
date:   2018-06-22 14:53:20 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getnetworkhashps ( blocks height )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getnetworkhashps
getnetworkhashps ( blocks height )

返回基于最后 n 个区块估算的每秒的哈希数。
传入 [blocks] 以覆盖一部分区块，-1 指定从上次难度改变以来。
传入 [height] 以估计发现某个区块时的网络速度。

参数：
1. blocks（整型，可选，默认为 120）区块的数量，或 -1 表示从上次难度改变以来。
2. height（整型，可选，默认为 -1）估计给定的高度时间。

结果：
x        （数字）估算的每秒的哈希数

例子：
> bitcoin-cli getnetworkhashps
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnetworkhashps", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getnetworkhashps` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getnetworkhashps(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue getnetworkhashps(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 2)
        throw runtime_error(
            "getnetworkhashps ( blocks height )\n"
            "\nReturns the estimated network hashes per second based on the last n blocks.\n"
            "Pass in [blocks] to override # of blocks, -1 specifies since last difficulty change.\n"
            "Pass in [height] to estimate the network speed at the time when a certain block was found.\n"
            "\nArguments:\n"
            "1. blocks     (numeric, optional, default=120) The number of blocks, or -1 for blocks since last difficulty change.\n"
            "2. height     (numeric, optional, default=-1) To estimate at the time of the given height.\n"
            "\nResult:\n"
            "x             (numeric) Hashes per second estimated\n"
            "\nExamples:\n"
            + HelpExampleCli("getnetworkhashps", "")
            + HelpExampleRpc("getnetworkhashps", "")
       ); // 1. 帮助内容

    LOCK(cs_main);
    return GetNetworkHashPS(params.size() > 0 ? params[0].get_int() : 120, params.size() > 1 ? params[1].get_int() : -1); // 2. 获取每秒的网络哈希并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 获取每秒的网络哈希并返回

获取每秒的网络哈希函数 `GetNetworkHashPS(params.size() > 0 ? params[0].get_int() : 120, params.size() > 1 ? params[1].get_int() : -1)` 实现在文件 `rpcmining.cpp` 中。

```cpp
/**
 * Return average network hashes per second based on the last 'lookup' blocks,
 * or from the last difficulty change if 'lookup' is nonpositive.
 * If 'height' is nonnegative, compute the estimate at the time when a given block was found.
 */ // 返回基于最新发现的块每秒的平均网络哈希，或若发现是非正则返回最新的难度改变。若高度非负，计算找到一个给定区块时的估计值
UniValue GetNetworkHashPS(int lookup, int height) { // 默认 (120, -1)
    CBlockIndex *pb = chainActive.Tip(); // 获取链尖区块索引

    if (height >= 0 && height < chainActive.Height()) // 若指定高度符合当前链高度范围
        pb = chainActive[height]; // 获取对应高度的区块索引

    if (pb == NULL || !pb->nHeight) // 索引为空 或 为创世区块索引
        return 0;

    // If lookup is -1, then use blocks since last difficulty change.
    if (lookup <= 0) // 若发现是 -1，则使用从上次难度改变后的区块
        lookup = pb->nHeight % Params().GetConsensus().DifficultyAdjustmentInterval() + 1;

    // If lookup is larger than chain, then set it to chain length.
    if (lookup > pb->nHeight) // 若发现大于链高度，则设置为链高度
        lookup = pb->nHeight;

    CBlockIndex *pb0 = pb;
    int64_t minTime = pb0->GetBlockTime(); // 获取最小创建区块时间
    int64_t maxTime = minTime;
    for (int i = 0; i < lookup; i++) {
        pb0 = pb0->pprev;
        int64_t time = pb0->GetBlockTime();
        minTime = std::min(time, minTime);
        maxTime = std::max(time, maxTime); // 获取最大创建区块时间
    }

    // In case there's a situation where minTime == maxTime, we don't want a divide by zero exception.
    if (minTime == maxTime) // 最小和最大不能相等
        return 0;

    arith_uint256 workDiff = pb->nChainWork - pb0->nChainWork; // 区间首尾区块的工作量之差
    int64_t timeDiff = maxTime - minTime; // 时间差

    return workDiff.getdouble() / timeDiff; // 转换为浮点数求平均值并返回
}
```

从这里可以看出获取的是某一区块或某一连续区间区块的网络算力即每秒哈希的次数。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
