---
layout: post
title:  "比特币 RPC 命令剖析 \"getnetworkhashps\""
date:   2018-05-25 14:53:20 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getnetworkhashps ( blocks height ) # 获取基于最后 n 个区块估算的网络算力（每秒网络哈希次数）
{% endhighlight %}

参数：<br>
1. `blocks` （整型，可选，默认为 120）区块的数量，-1 表示从上一次变化的难度开始。<br>
2. `height` （整型，可选，默认为 -1 表示当前高度）给定区块链高度用于评估当某个块被找到时的网络速度。

结果：（数字）返回估算的每秒网络哈希的次数（链工作量 chainwork 之差 / 时间 time 之差）。

## 用法示例

### 比特币核心客户端

用法一：未 IBD 时高度为 0，获取此时的网络算力。

{% highlight shell %}
$ bitcoin-cli getnetworkhashps
0
{% endhighlight %}

用法二：获取第三个区块产生时的算力。

{% highlight shell %}
$ bitcoin-cli getnetworkhashps 1 3
10011731.54545454
{% endhighlight %}

计算方法：用第三块与第二块的工作量之差 / 第三块与第二块产生时间之差。<br>
公式：(chainwork3 - chainwork(3 - 1) ) / (time3 - time(3 - 1) )。

用法三：获取产生前三个区块的算力。

{% highlight shell %}
$ bitcoin-cli getnetworkhashps 3 3
27789.49269520433
{% endhighlight %}

或使 blocks 为 0，效果同上。

{% highlight shell %}
$ bitcoin-cli getnetworkhashps 0 3
27789.49269520433
{% endhighlight %}

或使 blocks 为 -1，效果同上。

{% highlight shell %}
$ bitcoin-cli getnetworkhashps -1 3
27789.49269520433
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnetworkhashps", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":1721333.071895425,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getnetworkhashps` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getnetworkhashps(const UniValue& params, bool fHelp); // 获取全网算力
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue getnetworkhashps(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 2) // 参数个数最多为 2 个
        throw runtime_error( // 命令帮助反馈
            "getnetworkhashps ( blocks height )\n"
            "\nReturns the estimated network hashes per second based on the last n blocks.\n"
            "Pass in [blocks] to override # of blocks, -1 specifies since last difficulty change.\n"
            "Pass in [height] to estimate the network speed at the time when a certain block was found.\n"
            "\nArguments:\n"
            "1. blocks     (numeric, optional, default=120) The number of blocks, or -1 for blocks since last difficulty change.\n"
            "2. height     (numeric, optional, default=-1) To estimate at the time of the given height.\n"
            "\nResult:\n"
            "x             (numeric) Hashes per second estimated\n"
            "\nExamples:\n"
            + HelpExampleCli("getnetworkhashps", "")
            + HelpExampleRpc("getnetworkhashps", "")
       );

    LOCK(cs_main);
    return GetNetworkHashPS(params.size() > 0 ? params[0].get_int() : 120, params.size() > 1 ? params[1].get_int() : -1); // 获取网络算力（哈希次数/秒）并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取指定高度及块数的算力（网络哈希/秒），并返回。

第三步，调用 GetNetworkHashPS(params.size() > 0 ? params[0].get_int() : 120, params.size() > 1 ? params[1].get_int() : -1) 函数获取算力，
该函数实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
/**
 * Return average network hashes per second based on the last 'lookup' blocks,
 * or from the last difficulty change if 'lookup' is nonpositive.
 * If 'height' is nonnegative, compute the estimate at the time when a given block was found.
 */ // 返回基于最新发现的块每秒的平均网络哈希，或若发现是非正则返回最新的难度改变。若高度非负，计算找到一个给定区块时的估计值
UniValue GetNetworkHashPS(int lookup, int height) { // 默认 (120, -1)
    CBlockIndex *pb = chainActive.Tip(); // 获取链尖区块索引

    if (height >= 0 && height < chainActive.Height()) // 若指定高度符合当前链高度范围
        pb = chainActive[height]; // 获取对应高度的区块索引

    if (pb == NULL || !pb->nHeight) // 索引为空 或 为创世区块索引
        return 0;

    // If lookup is -1, then use blocks since last difficulty change.
    if (lookup <= 0) // 若发现是 -1，则使用从上次难度改变后的区块
        lookup = pb->nHeight % Params().GetConsensus().DifficultyAdjustmentInterval() + 1;

    // If lookup is larger than chain, then set it to chain length.
    if (lookup > pb->nHeight) // 若发现大于链高度，则设置为链高度
        lookup = pb->nHeight;

    CBlockIndex *pb0 = pb;
    int64_t minTime = pb0->GetBlockTime(); // 获取最小创建区块时间
    int64_t maxTime = minTime;
    for (int i = 0; i < lookup; i++) {
        pb0 = pb0->pprev;
        int64_t time = pb0->GetBlockTime();
        minTime = std::min(time, minTime);
        maxTime = std::max(time, maxTime); // 获取最大创建区块时间
    }

    // In case there's a situation where minTime == maxTime, we don't want a divide by zero exception.
    if (minTime == maxTime) // 最小和最大不能相等
        return 0;

    arith_uint256 workDiff = pb->nChainWork - pb0->nChainWork; // 区间首尾区块的工作量之差
    int64_t timeDiff = maxTime - minTime; // 时间差

    return workDiff.getdouble() / timeDiff; // 转换为浮点数求平均值并返回
}
{% endhighlight %}

从这里可以看出获取的是某一区块或某一连续区间区块的网络算力即每秒哈希的次数。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getnetworkhashps)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
