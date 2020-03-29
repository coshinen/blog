---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockhash\""
date:   2018-05-28 14:48:05 +0800
author: mistydew
comments: true
categories: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getblockhash index
---
## 提示说明

```shell
getblockhash index # 获取在最佳区块链上指定索引的区块哈希
```

参数：<br>
1.index（整型，必备）区块索引（最佳链高度）。

结果：（字符串）区块哈希（16 进制形式）。

## 用法示例

### 比特币核心客户端

获取索引/高度为 0 的（创世区块）区块哈希。

```shell
$ bitcoin-cli getblockhash 0
000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhash", "params": [0] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f","error":null,"id":"curltest"}
```

## 源码剖析
getblockhash 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getblockhash(const UniValue& params, bool fHelp); // 获取指定区块索引的区块哈希
```

实现在“rpcblockchain.cpp”文件中。

```cpp
UniValue getblockhash(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数只有 1 个
        throw runtime_error( // 命令帮助反馈
            "getblockhash index\n"
            "\nReturns hash of block in best-block-chain at index provided.\n"
            "\nArguments:\n"
            "1. index         (numeric, required) The block index\n"
            "\nResult:\n"
            "\"hash\"         (string) The block hash\n"
            "\nExamples:\n"
            + HelpExampleCli("getblockhash", "1000")
            + HelpExampleRpc("getblockhash", "1000")
        );

    LOCK(cs_main); // 上锁

    int nHeight = params[0].get_int(); // 获取指定的区块索引作为区块链高度
    if (nHeight < 0 || nHeight > chainActive.Height()) // 检测指定高度是否在该区块链高度范围内
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Block height out of range");

    CBlockIndex* pblockindex = chainActive[nHeight]; // 获取激活链对应高度的区块索引
    return pblockindex->GetBlockHash().GetHex(); // 获取该索引对应区块哈希，转换为 16 进制并返回
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁。
3. 获取指定的区块索引作为区块链高度。
4. 获取激活区块链相应高度的区块索引。
5. 获取该区块的哈希，转换为 16 进制并返回。

相关函数调用见 RPC 命令 [getbestblockhash](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html)。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblockhash){:target="_blank"}
