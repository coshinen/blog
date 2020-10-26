---
layout: post
title:  "比特币 RPC 命令剖析 \"getmininginfo\""
date:   2018-06-21 21:53:32 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getmininginfo
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getmininginfo
getmininginfo

返回一个包含挖矿相关信息的 json 对象。

结果：
{
  "blocks": nnn,          （数字）当前的区块数
  "currentblocksize": nnn,（数字）最新的区块大小
  "currentblocktx": nnn,  （数字）最新区块的交易数
  "difficulty": xxx.xxxxx （数字）当前的难度
  "errors": "..."         （字符串）当前的错误
  "generate": true|false  （布尔型）挖矿是否开启（查看 getgenerate 或 setgenerate 调用）
  "genproclimit": n       （数字）挖矿处理器限制。如果未开启挖矿则为 -1。（查看 getgenerate 或 setgenerate 调用）
  "pooledtx": n           （数字）交易内存池的大小
  "testnet": true|false   （布尔型）是否在使用测试网络
  "chain": "xxxx",        （字符串）当前 BIP70 定义的网络名（main，test，regtest）
}

例子：
> bitcoin-cli getmininginfo
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmininginfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getmininginfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getmininginfo(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue getmininginfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getmininginfo\n"
            "\nReturns a json object containing mining-related information."
            "\nResult:\n"
            "{\n"
            "  \"blocks\": nnn,             (numeric) The current block\n"
            "  \"currentblocksize\": nnn,   (numeric) The last block size\n"
            "  \"currentblocktx\": nnn,     (numeric) The last block transaction\n"
            "  \"difficulty\": xxx.xxxxx    (numeric) The current difficulty\n"
            "  \"errors\": \"...\"          (string) Current errors\n"
            "  \"generate\": true|false     (boolean) If the generation is on or off (see getgenerate or setgenerate calls)\n"
            "  \"genproclimit\": n          (numeric) The processor limit for generation. -1 if no generation. (see getgenerate or setgenerate calls)\n"
            "  \"pooledtx\": n              (numeric) The size of the mem pool\n"
            "  \"testnet\": true|false      (boolean) If using testnet or not\n"
            "  \"chain\": \"xxxx\",         (string) current network name as defined in BIP70 (main, test, regtest)\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getmininginfo", "")
            + HelpExampleRpc("getmininginfo", "")
        ); // 1. 帮助内容


    LOCK(cs_main);

    UniValue obj(UniValue::VOBJ);
    obj.push_back(Pair("blocks",           (int)chainActive.Height())); // 活跃的链高度
    obj.push_back(Pair("currentblocksize", (uint64_t)nLastBlockSize)); // 最新的区块大小
    obj.push_back(Pair("currentblocktx",   (uint64_t)nLastBlockTx)); // 最新区块的交易数
    obj.push_back(Pair("difficulty",       (double)GetDifficulty())); // 当前的挖矿难度
    obj.push_back(Pair("errors",           GetWarnings("statusbar"))); // 错误信息
    obj.push_back(Pair("genproclimit",     (int)GetArg("-genproclimit", DEFAULT_GENERATE_THREADS))); // 矿工线程数限制
    obj.push_back(Pair("networkhashps",    getnetworkhashps(params, false))); // 网络算力
    obj.push_back(Pair("pooledtx",         (uint64_t)mempool.size())); // 交易内存池大小
    obj.push_back(Pair("testnet",          Params().TestnetToBeDeprecatedFieldRPC())); // 是否为测试网
    obj.push_back(Pair("chain",            Params().NetworkIDString())); // 链名
    obj.push_back(Pair("generate",         getgenerate(params, false))); // 挖矿状态
    return obj;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
