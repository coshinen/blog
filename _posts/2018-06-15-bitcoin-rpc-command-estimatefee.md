---
layout: post
title:  "比特币 RPC 命令剖析 \"estimatefee\""
date:   2018-06-15 13:28:47 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
estimatefee nblocks # 估计交易在 nblocks 个区块开始确认的每千字节的大致交易费用
{% endhighlight %}

参数：<br>
1. `nblocks` （数字型）区块数量。

结果：（数字型）返回预估的每千字节的交易费。<br>
如果没有足够的交易和区块用来估算则会返回一个负值，-1 表示交易费为 0。

## 用法示例

{% highlight shell %}
$ bitcoin-cli estimatefee 6
-1
{% endhighlight %}

## 源码剖析
`estimatefee` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue estimatefee(const UniValue& params, bool fHelp); // 估算交易费
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue estimatefee(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "estimatefee nblocks\n"
            "\nEstimates the approximate fee per kilobyte needed for a transaction to begin\n"
            "confirmation within nblocks blocks.\n"
            "\nArguments:\n"
            "1. nblocks     (numeric)\n"
            "\nResult:\n"
            "n              (numeric) estimated fee-per-kilobyte\n"
            "\n"
            "A negative value is returned if not enough transactions and blocks\n"
            "have been observed to make an estimate.\n"
            "\nExample:\n"
            + HelpExampleCli("estimatefee", "6")
            );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 参数类型检查

    int nBlocks = params[0].get_int(); // 获取指定的块数
    if (nBlocks < 1) // 块数最低为 1
        nBlocks = 1;

    CFeeRate feeRate = mempool.estimateFee(nBlocks); // 交易内存池预估交易费（根据区块数）
    if (feeRate == CFeeRate(0)) // 若交易费为 0
        return -1.0; // 返回 -1.0

    return ValueFromAmount(feeRate.GetFeePerK()); // 否则，格式化后返回预估交易费
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.参数类型检查。<br>
3.获取指定的块数，最低为 1 块。<br>
4.在交易内存池中通过块数预估交易费。<br>
5.若预估交易费为 0，则返回 -1。<br>
6.否则获取每千字节的交易费并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#estimatefee)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
