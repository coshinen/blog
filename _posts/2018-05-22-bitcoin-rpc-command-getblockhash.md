---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockhash\""
date:   2018-05-22 14:48:05 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin bitcoin-cli commands
excerpt: $ bitcoin-cli getblockhash index
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getblockhash index # 获取在最佳区块链上指定索引的区块哈希
{% endhighlight %}

参数：<br>
1. `index` （整型，必备）区块索引（最佳链高度）。

结果：（字符串）区块哈希（16 进制形式）。

## 用法示例

### 比特币核心客户端

获取索引/高度为 0 的（创世区块）区块哈希。

{% highlight shell %}
$ bitcoin-cli getblockhash 0
000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhash", "params": [0] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getblockhash` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getblockhash(const UniValue& params, bool fHelp); // 获取指定区块索引的区块哈希
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取指定的区块索引作为区块链高度。<br>
4.获取激活区块链相应高度的区块索引。<br>
5.获取该区块的哈希，转换为 16 进制并返回。

相关函数调用见 RPC 命令 [`getbestblockhash`](/2018/05/22/bitcoin-rpc-command-getbestblockhash)。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblockhash)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
