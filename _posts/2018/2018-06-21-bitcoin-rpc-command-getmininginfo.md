---
layout: post
title:  "比特币 RPC 命令剖析 \"getmininginfo\""
date:   2018-06-21 11:53:32 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getmininginfo
---
## 提示说明

```shell
getmininginfo # 获取挖矿信息
```

结果：返回一个包含挖矿相关信息的 json 对象。

```shell
{
  "blocks": nnn,             （数字）当前区块数
  "currentblocksize": nnn,   （数字）最后一个区块的大小
  "currentblocktx": nnn,     （数字）最后一个区块的交易数
  "difficulty": xxx.xxxxx    （数字）当前的挖矿难度
  "errors": "..."          （字符串）当前的错误
  "generate": true|false     （布尔型）挖矿开启或关闭（查看 getgenerate 或 setgenerate 命令）
  "genproclimit": n          （数字）挖矿线程数。如果未开启挖矿则为 -1。（查看 getgenerate 或 setgenerate 命令）
  "pooledtx": n              （数字）交易内存池的大小
  "testnet": true|false      （布尔型）使用了测试网或没有使用
  "chain": "xxxx",         （字符串）BIP70 定义的当前的网络名（main, test, regtest）
}
```

## 用法示例

### 比特币核心客户端

获取当前比特币核心服务器 CPU 挖矿的信息。

```shell
$ bitcoin-cli getmininginfo
{
  "blocks": 28404,
  "currentblocksize": 1000,
  "currentblocktx": 0,
  "difficulty": 0.001532956637923291,
  "errors": "",
  "genproclimit": 1,
  "networkhashps": 1284702.243902439,
  "pooledtx": 0,
  "testnet": false,
  "chain": "main",
  "generate": true
}
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmininginfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"blocks":28420,"currentblocksize":1000,"currentblocktx":0,"difficulty":0.001532956637923291,"errors":"","genproclimit":1,"networkhashps":1383698.563922942,"pooledtx":0,"testnet":false,"chain":"main","generate":true},"error":null,"id":"curltest"}
```

## 源码剖析

getmininginfo 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getmininginfo(const UniValue& params, bool fHelp); // 获取挖矿信息
```

实现在“rpcmining.cpp”文件中。

```cpp
UniValue getmininginfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
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
        );


    LOCK(cs_main);

    UniValue obj(UniValue::VOBJ); // 创建对象类型的返回结果
    obj.push_back(Pair("blocks",           (int)chainActive.Height())); // 加入激活的链高度
    obj.push_back(Pair("currentblocksize", (uint64_t)nLastBlockSize)); // 最新区块的大小
    obj.push_back(Pair("currentblocktx",   (uint64_t)nLastBlockTx)); // 最新区块的交易数
    obj.push_back(Pair("difficulty",       (double)GetDifficulty())); // 当前挖矿难度
    obj.push_back(Pair("errors",           GetWarnings("statusbar"))); // 错误
    obj.push_back(Pair("genproclimit",     (int)GetArg("-genproclimit", DEFAULT_GENERATE_THREADS))); // 矿工线程数
    obj.push_back(Pair("networkhashps",    getnetworkhashps(params, false))); // 全网算力
    obj.push_back(Pair("pooledtx",         (uint64_t)mempool.size())); // 交易内存池大小
    obj.push_back(Pair("testnet",          Params().TestnetToBeDeprecatedFieldRPC())); // 是否为测试网
    obj.push_back(Pair("chain",            Params().NetworkIDString())); // 链名
    obj.push_back(Pair("generate",         getgenerate(params, false))); // 挖矿状态
    return obj;
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁。
3. 追加必要的挖矿信息并返回。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
