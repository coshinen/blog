---
layout: post
title:  "比特币 RPC 命令「getmempoolinfo」"
date:   2018-06-01 21:19:08 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getmempoolinfo
getmempoolinfo

返回交易内存池活跃状态的详细信息。

结果：
{
  "size": xxxxx,               （数字）当前的交易数
  "bytes": xxxxx,              （数字）全部交易的总大小
  "usage": xxxxx,              （数字）内存池的总内存用量
  "maxmempool": xxxxx,         （数字）内存池的最大内存用量
  "mempoolminfee": xxxxx       （数字）交易被接受的最低费用
}

例子：
> bitcoin-cli getmempoolinfo
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmempoolinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getmempoolinfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getmempoolinfo(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getmempoolinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getmempoolinfo\n"
            "\nReturns details on the active state of the TX memory pool.\n"
            "\nResult:\n"
            "{\n"
            "  \"size\": xxxxx,               (numeric) Current tx count\n"
            "  \"bytes\": xxxxx,              (numeric) Sum of all tx sizes\n"
            "  \"usage\": xxxxx,              (numeric) Total memory usage for the mempool\n"
            "  \"maxmempool\": xxxxx,         (numeric) Maximum memory usage for the mempool\n"
            "  \"mempoolminfee\": xxxxx       (numeric) Minimum fee for tx to be accepted\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getmempoolinfo", "")
            + HelpExampleRpc("getmempoolinfo", "")
        ); // 1. 帮助内容

    return mempoolInfoToJSON(); // 2. 把交易内存池信息打包为 JSON 格式并返回
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 把交易内存池信息打包为 JSON 格式并返回

打包交易池信息为 JSON 格式的函数 `mempoolInfoToJSON()` 实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue mempoolInfoToJSON()
{
    UniValue ret(UniValue::VOBJ);
    ret.push_back(Pair("size", (int64_t) mempool.size())); // 内存池的大小
    ret.push_back(Pair("bytes", (int64_t) mempool.GetTotalTxSize())); // 内存池总的交易大小
    ret.push_back(Pair("usage", (int64_t) mempool.DynamicMemoryUsage())); // 内存池的动态内存用量
    size_t maxmempool = GetArg("-maxmempool", DEFAULT_MAX_MEMPOOL_SIZE) * 1000000;
    ret.push_back(Pair("maxmempool", (int64_t) maxmempool)); // 内存池的上限
    ret.push_back(Pair("mempoolminfee", ValueFromAmount(mempool.GetMinFee(maxmempool).GetFeePerK()))); // 内存池的最低交易费

    return ret;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
