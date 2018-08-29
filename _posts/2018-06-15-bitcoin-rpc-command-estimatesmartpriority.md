---
layout: post
title:  "比特币 RPC 命令剖析 \"estimatesmartpriority\""
date:   2018-06-15 14:47:33 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli estimatesmartpriority nblocks
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
estimatesmartpriority nblocks # 估计一笔 0 交易费的交易在 `nblocks` 个区块开始确认的大致优先级，如果可能则返回估计有效的区块数
{% endhighlight %}

**警告：该接口不稳定且可能消失或改变！**

参数：<br>
1. `nblocks` （数字）区块数。

结果：<br>
{% highlight shell %}
{
  "priority" : x.x,    （数字）估算的优先级
  "blocks" : n         （数字）估计被找到的区块数
}
{% endhighlight %}

**注：如果没有足够的交易和区块用来做估算任意数量的区块，则返回一个负值。<br>
但是如果交易内存池拒绝费用已设置，则会返回 1e9 * MAX_MONEY。**
变量 MAX_MONEY 定义在“amount.h”文件中。

{% highlight C++ %}
static const CAmount MAX_MONEY = 21000000 * COIN; // 2100 万 BTC
{% endhighlight %}

## 用法示例

### 比特币核心客户端

估算交易经 6 个区块确认所需的优先级，并获取估算时找到的区块数。

{% highlight shell %}
$ bitcoin-cli estimatesmartpriority 6
{
  "priority": -1,
  "blocks": 25
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "estimatesmartpriority", "params": [6] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"priority":-1,"blocks":25},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`estimatesmartpriority` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue estimatesmartpriority(const UniValue& params, bool fHelp); // 智能估计交易优先级
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue estimatesmartpriority(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "estimatesmartpriority nblocks\n"
            "\nWARNING: This interface is unstable and may disappear or change!\n"
            "\nEstimates the approximate priority a zero-fee transaction needs to begin\n"
            "confirmation within nblocks blocks if possible and return the number of blocks\n"
            "for which the estimate is valid.\n"
            "\nArguments:\n"
            "1. nblocks     (numeric)\n"
            "\nResult:\n"
            "{\n"
            "  \"priority\" : x.x,    (numeric) estimated priority\n"
            "  \"blocks\" : n         (numeric) block number where estimate was found\n"
            "}\n"
            "\n"
            "A negative value is returned if not enough transactions and blocks\n"
            "have been observed to make an estimate for any number of blocks.\n"
            "However if the mempool reject fee is set it will return 1e9 * MAX_MONEY.\n"
            "\nExample:\n"
            + HelpExampleCli("estimatesmartpriority", "6")
            );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 检查参数类型

    int nBlocks = params[0].get_int(); // 获取指定的区块数

    UniValue result(UniValue::VOBJ);
    int answerFound; // 估计有效的区块数
    double priority = mempool.estimateSmartPriority(nBlocks, &answerFound); // 智能估算估算优先级并获取估算有效的区块数
    result.push_back(Pair("priority", priority)); // 交易优先级
    result.push_back(Pair("blocks", answerFound)); // 有效区块数
    return result; // 返回结果集
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.参数类型检查。<br>
3.获取指定的块数。<br>
4.智能估算优先级，同时获取估算有效的区块数。<br>
5.把交易优先级和有效区块数加入结果对象并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#estimatesmartpriority)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
