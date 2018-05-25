---
layout: post
title:  "比特币 RPC 命令剖析 \"getmininginfo\""
date:   2018-05-25 11:53:32 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getmininginfo # 获取挖矿信息：区块数、当前块大小、当前块交易数、难度、错误、挖矿线程数、全网算力、交易内存池大小、链名、挖矿状态等信息
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli getmininginfo
{
  "blocks": 0,
  "currentblocksize": 0,
  "currentblocktx": 0,
  "difficulty": 1,
  "errors": "",
  "genproclimit": 2,
  "networkhashps": 0,
  "pooledtx": 0,
  "testnet": false,
  "chain": "main",
  "generate": false
}
{% endhighlight %}

## 源码剖析
`getmininginfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getmininginfo(const UniValue& params, bool fHelp); // 获取挖矿信息
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.追加必要的挖矿信息并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getmininginfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
