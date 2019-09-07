---
layout: post
title:  "比特币 RPC 命令剖析 \"estimatepriority\""
date:   2018-07-25 14:09:52 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli estimatepriority nblocks
---
## 提示说明

```shell
estimatepriority nblocks # 估算一笔 0 交易费的交易在 nblocks 个区块开始确认的大致优先级
```

参数：
1. nblocks（数字）区块数。

结果：（数字）返回预估的交易优先级。<br>
如果没有足够的交易和区块用来估算则会返回一个负值，-1 表示交易优先级为 0。

## 用法示例

### 比特币核心客户端

估算交易经 6 个区块确认所需的优先级。

```shell
$ bitcoin-cli estimatepriority 6
-1
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "estimatepriority", "params": [6] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":-1,"error":null,"id":"curltest"}
```

## 源码剖析
estimatepriority 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue estimatepriority(const UniValue& params, bool fHelp); // 预估交易优先级
```

实现在“rpcmining.cpp”文件中。

```cpp
UniValue estimatepriority(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
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
            );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 检查参数类型

    int nBlocks = params[0].get_int(); // 获取指定区块数
    if (nBlocks < 1) // 区块至少为 1 块
        nBlocks = 1;

    return mempool.estimatePriority(nBlocks); // 在交易内存池中根据块数估算交易优先级，并返回
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 参数类型检查。
3. 获取指定的块数，最低为 1 块。
4. 在交易内存池中通过块数预估交易优先级并返回。

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#estimatepriority){:target="_blank"}
