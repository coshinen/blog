---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxoutsetinfo\""
date:   2018-06-11 13:59:06 +0800
author: mistydew
categories: Blockchain
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
  "height":n,     (numeric) The current block height (index)
  "bestblock": "hex",   (string) the best block hash hex
  "transactions": n,      (numeric) The number of transactions
  "txouts": n,            (numeric) The number of output transactions
  "bytes_serialized": n,  (numeric) The serialized size
  "hash_serialized": "hash",   (string) The serialized hash
  "total_amount": x.xxx          (numeric) The total amount
}
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli gettxoutsetinfo
{
  "height": 75783,
  "bestblock": "0000761ee2941959c0d576af9e3e26b22a1ee96ec73223f2d0cf0f32796c0ad7",
  "transactions": 76107,
  "txouts": 76291,
  "bytes_serialized": 0,
  "hash_serialized": "817697834c7d0753b7bf4f3618d10de37a15e8805b4a830461f3b6a40dcfe320",
  "total_amount": 6862930.00000000
}
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
