---
layout: post
title:  "比特币 RPC 命令剖析 \"submitblock\""
date:   2018-05-28 10:46:23 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
submitblock "hexdata" ( "jsonparametersobject" ) # 尝试提交一个新区块到网络
{% endhighlight %}

**注：`jsonparametersobject` 当前被忽略。详见 [https://en.bitcoin.it/wiki/BIP_0022](https://en.bitcoin.it/wiki/BIP_0022)。**

参数：<br>
1. `hexdata` （字符串，必备）用于提交的 16 进制编码的区块数据。<br>
2. `jsonparametersobject` （字符串，可选）可选的参数对象。<br>
{% highlight shell %}
{
  "workid" : "id"  （字符串，可选）如果服务器提供一个工作 id，它必须包含在提交内容中。
}
{% endhighlight %}

结果：无返回值。

## 用法示例

提交一个创世区块信息的 16 进制数据。

{% highlight shell %}
$ bitcoin-cli submitblock 0100000000000000000000000000000000000000000000000000000000000000000000008a90d89da5e45e4156d19fb3144a46207a1d757d99471a98ead9be728c282a4fe032b05affff001dbdf3f1c40101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff5b04ffff001d01044c5246696e616e6369616c2054696d657320323031382f30332f32302046616365626f6f6b20646174612073746f726d207769706573206e6561726c7920243337626e206f6666206d61726b65742076616c7565ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000
duplicate-inconclusive
{% endhighlight %}


## 源码剖析
`submitblock` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue submitblock(const UniValue& params, bool fHelp); // 提交区块
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue submitblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数只有 1 个
        throw runtime_error( // 命令帮助反馈
            "submitblock \"hexdata\" ( \"jsonparametersobject\" )\n"
            "\nAttempts to submit new block to network.\n"
            "The 'jsonparametersobject' parameter is currently ignored.\n"
            "See https://en.bitcoin.it/wiki/BIP_0022 for full specification.\n"

            "\nArguments\n"
            "1. \"hexdata\"    (string, required) the hex-encoded block data to submit\n"
            "2. \"jsonparametersobject\"     (string, optional) object of optional parameters\n"
            "    {\n"
            "      \"workid\" : \"id\"    (string, optional) if the server provided a workid, it MUST be included with submissions\n"
            "    }\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("submitblock", "\"mydata\"")
            + HelpExampleRpc("submitblock", "\"mydata\"")
        );

    CBlock block;
    if (!DecodeHexBlk(block, params[0].get_str())) // 解码 16 进制的区块数据
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "Block decode failed");

    uint256 hash = block.GetHash(); // 获取区块哈希
    bool fBlockPresent = false;
    {
        LOCK(cs_main);
        BlockMap::iterator mi = mapBlockIndex.find(hash); // 通过区块索引得到该区块对应迭代器
        if (mi != mapBlockIndex.end()) { // 如果找到了
            CBlockIndex *pindex = mi->second; // 获取其区块索引
            if (pindex->IsValid(BLOCK_VALID_SCRIPTS))
                return "duplicate";
            if (pindex->nStatus & BLOCK_FAILED_MASK)
                return "duplicate-invalid";
            // Otherwise, we might only have the header - process the block before returning
            fBlockPresent = true;
        }
    }

    CValidationState state;
    submitblock_StateCatcher sc(block.GetHash());
    RegisterValidationInterface(&sc);
    bool fAccepted = ProcessNewBlock(state, Params(), NULL, &block, true, NULL);
    UnregisterValidationInterface(&sc);
    if (fBlockPresent)
    {
        if (fAccepted && !sc.found)
            return "duplicate-inconclusive";
        return "duplicate";
    }
    if (fAccepted)
    {
        if (!sc.found)
            return "inconclusive";
        state = sc.state;
    }
    return BIP22ValidationResult(state);
}

{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.解码 16 进制的区块数据。<br>
3.获取区块哈希。<br>
4.查找该区块是否存在，若存在，...<br>
5.若不存在，...

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#submitblock)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
