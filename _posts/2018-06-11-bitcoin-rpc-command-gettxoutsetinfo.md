---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxoutsetinfo\""
date:   2018-06-11 13:59:06 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin bitcoin-cli commands
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
gettxoutsetinfo # 获取关于未花费交易输出集合的统计信息
{% endhighlight %}

**注：该调用可能会花费些时间。**

结果：<br>
{% highlight shell %}
{
  "height":n,     （数字）当前的区块高度（索引）
  "bestblock": "hex",   （字符串）最佳区块 16 进制哈希值
  "transactions": n,      （数字）交易总数
  "txouts": n,            （数字）交易输出总数
  "bytes_serialized": n,  （数字）序列化后的大小
  "hash_serialized": "hash",   （字符串）序列化的哈希
  "total_amount": x.xxx          （数字）总金额
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取当前钱包内的交易输出集信息。

{% highlight shell %}
$ bitcoin-cli gettxoutsetinfo
{
  "height": 25350,
  "bestblock": "000000a350d458f968423e63621cc5d0b9cc43ebf2f01da8de702384c9bb7965",
  "transactions": 25350,
  "txouts": 25352,
  "bytes_serialized": 1783248,
  "hash_serialized": "3f4d4871a2afa2eb1602ab861dfe566520d2d120e26c02704cd71bdf2fa0159f",
  "total_amount": 1267500.00000000
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxoutsetinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"height":25337,"bestblock":"0000011d9ae76ab49b2ad035a6c954b6799ea7775fb1d002544a9e004fd13a03","transactions":25337,"txouts":25339,"bytes_serialized":1782325,"hash_serialized":"488680b4d72b1954ec6d78872d27530f71d5e80421c59208894a786cc4e6b009","total_amount":1266850.00000000},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`gettxoutsetinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue gettxoutsetinfo(const UniValue& params, bool fHelp); // 获取交易输出集合信息
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue gettxoutsetinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "gettxoutsetinfo\n"
            "\nReturns statistics about the unspent transaction output set.\n"
            "Note this call may take some time.\n"
            "\nResult:\n"
            "{\n"
            "  \"height\":n,     (numeric) The current block height (index)\n"
            "  \"bestblock\": \"hex\",   (string) the best block hash hex\n"
            "  \"transactions\": n,      (numeric) The number of transactions\n"
            "  \"txouts\": n,            (numeric) The number of output transactions\n"
            "  \"bytes_serialized\": n,  (numeric) The serialized size\n"
            "  \"hash_serialized\": \"hash\",   (string) The serialized hash\n"
            "  \"total_amount\": x.xxx          (numeric) The total amount\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("gettxoutsetinfo", "")
            + HelpExampleRpc("gettxoutsetinfo", "")
        );

    UniValue ret(UniValue::VOBJ); // 对象类型返回结果

    CCoinsStats stats;
    FlushStateToDisk(); // 刷新状态信息到磁盘
    if (pcoinsTip->GetStats(stats)) { // 获取币状态信息
        ret.push_back(Pair("height", (int64_t)stats.nHeight)); // 区块链高度
        ret.push_back(Pair("bestblock", stats.hashBlock.GetHex())); // 最佳区块哈希
        ret.push_back(Pair("transactions", (int64_t)stats.nTransactions)); // 交易数
        ret.push_back(Pair("txouts", (int64_t)stats.nTransactionOutputs)); // 交易输出数
        ret.push_back(Pair("bytes_serialized", (int64_t)stats.nSerializedSize)); // 序列化的字节大小
        ret.push_back(Pair("hash_serialized", stats.hashSerialized.GetHex())); // 序列化的哈希
        ret.push_back(Pair("total_amount", ValueFromAmount(stats.nTotalAmount))); // 总金额
    }
    return ret; // 返回结果
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.更新内存中的数据到本地磁盘。。<br>
3.获取币状态信息，添加到结果集并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#gettxoutsetinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
