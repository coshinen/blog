---
layout: post
title:  "比特币 RPC 命令剖析 \"getmempoolinfo\""
date:   2018-05-22 16:19:08 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getmempoolinfo # 获取交易内存池激活状态的细节
{% endhighlight %}

结果：<br>
{% highlight shell %}
{
  "size": xxxxx,               （数字）当前的交易数
  "bytes": xxxxx,              （数字）全部交易的总大小
  "usage": xxxxx,              （数字）交易内存池的总内存用量
  "maxmempool": xxxxx,         （数字）交易内存池的最大内存用量
  "mempoolminfee": xxxxx       （数字）能接受的最小交易费
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取当前交易内存池信息。

{% highlight shell %}
$ bitcoin-cli getmempoolinfo
{
  "size": 2,
  "bytes": 382,
  "usage": 1792,
  "maxmempool": 300000000,
  "mempoolminfee": 0.00000000
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmempoolinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"size":2,"bytes":382,"usage":1792,"maxmempool":300000000,"mempoolminfee":0.00000000},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getmempoolinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getmempoolinfo(const UniValue& params, bool fHelp); // 获取交易内存池信息
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue getmempoolinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
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
        );

    return mempoolInfoToJSON(); // 把交易内存池信息打包为 JSON 格式并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.打包交易内存池信息为 JSON 格式并返回。

第二步，调用 mempoolInfoToJSON() 函数打包交易池信息至 JSON 格式的目标对象，该函数实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue mempoolInfoToJSON()
{
    UniValue ret(UniValue::VOBJ); // 构造一个目标对象
    ret.push_back(Pair("size", (int64_t) mempool.size())); // 内存池当前大小
    ret.push_back(Pair("bytes", (int64_t) mempool.GetTotalTxSize())); // 内存池交易总大小
    ret.push_back(Pair("usage", (int64_t) mempool.DynamicMemoryUsage())); // 动态内存用量
    size_t maxmempool = GetArg("-maxmempool", DEFAULT_MAX_MEMPOOL_SIZE) * 1000000;
    ret.push_back(Pair("maxmempool", (int64_t) maxmempool)); // 内存池的大小
    ret.push_back(Pair("mempoolminfee", ValueFromAmount(mempool.GetMinFee(maxmempool).GetFeePerK()))); // 内存池最小费用

    return ret;
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getmempoolinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
