---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockchaininfo\""
date:   2018-05-22 11:27:13 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getblockchaininfo # 获取区块链信息：链名、区块数、区块头数、最佳块哈希、难度等
{% endhighlight %}

结果：返回一个包含区块链进度相关变量状态信息的对象。<br>
{% highlight shell %}
{
  "chain": "xxxx",        (string) current network name as defined in BIP70 (main, test, regtest)
  "blocks": xxxxxx,         (numeric) the current number of blocks processed in the server
  "headers": xxxxxx,        (numeric) the current number of headers we have validated
  "bestblockhash": "...", (string) the hash of the currently best block
  "difficulty": xxxxxx,     (numeric) the current difficulty
  "mediantime": xxxxxx,     (numeric) median time for the current best block
  "verificationprogress": xxxx, (numeric) estimate of verification progress [0..1]
  "chainwork": "xxxx"     (string) total amount of work in active chain, in hexadecimal
  "pruned": xx,             (boolean) if the blocks are subject to pruning
  "pruneheight": xxxxxx,    (numeric) heighest block available
  "softforks": [            (array) status of softforks in progress
     {
        "id": "xxxx",        (string) name of softfork
        "version": xx,         (numeric) block version
        "enforce": {           (object) progress toward enforcing the softfork rules for new-version blocks
           "status": xx,       (boolean) true if threshold reached
           "found": xx,        (numeric) number of blocks with the new version found
           "required": xx,     (numeric) number of blocks required to trigger
           "window": xx,       (numeric) maximum size of examined window of recent blocks
        },
        "reject": { ... }      (object) progress toward rejecting pre-softfork blocks (same fields as "enforce")
     }, ...
  ],
  "bip9_softforks": [       (array) status of BIP9 softforks in progress
     {
        "id": "xxxx",        (string) name of the softfork
        "status": "xxxx",    (string) one of "defined", "started", "lockedin", "active", "failed"
     }
  ]
}
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli getblockchaininfo
{
  "chain": "main",
  "blocks": 0,
  "headers": 0,
  "bestblockhash": "00000000b183b4db893e4dfc15bd22c5371080c13966e511751de4fe82c96384",
  "difficulty": 1,
  "mediantime": 1521496800,
  "verificationprogress": 0.007146723558115435,
  "chainwork": "0000000000000000000000000000000000000000000000000000000100010001",
  "pruned": false,
  "softforks": [
    {
      "id": "bip34",
      "version": 2,
      "enforce": {
        "status": false,
        "found": 0,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": false,
        "found": 0,
        "required": 950,
        "window": 1000
      }
    }, 
    {
      "id": "bip66",
      "version": 3,
      "enforce": {
        "status": false,
        "found": 0,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": false,
        "found": 0,
        "required": 950,
        "window": 1000
      }
    }, 
    {
      "id": "bip65",
      "version": 4,
      "enforce": {
        "status": false,
        "found": 0,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": false,
        "found": 0,
        "required": 950,
        "window": 1000
      }
    }
  ],
  "bip9_softforks": [
    {
      "id": "csv",
      "status": "defined"
    }
  ]
}
{% endhighlight %}

## 源码剖析
`getblockchaininfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getblockchaininfo(const UniValue& params, bool fHelp); // 获取区块链信息
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue getblockchaininfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 该命令没有参数
        throw runtime_error( // 帮助信息反馈
            "getblockchaininfo\n"
            "Returns an object containing various state info regarding block chain processing.\n"
            "\nResult:\n"
            "{\n"
            "  \"chain\": \"xxxx\",        (string) current network name as defined in BIP70 (main, test, regtest)\n"
            "  \"blocks\": xxxxxx,         (numeric) the current number of blocks processed in the server\n"
            "  \"headers\": xxxxxx,        (numeric) the current number of headers we have validated\n"
            "  \"bestblockhash\": \"...\", (string) the hash of the currently best block\n"
            "  \"difficulty\": xxxxxx,     (numeric) the current difficulty\n"
            "  \"mediantime\": xxxxxx,     (numeric) median time for the current best block\n"
            "  \"verificationprogress\": xxxx, (numeric) estimate of verification progress [0..1]\n"
            "  \"chainwork\": \"xxxx\"     (string) total amount of work in active chain, in hexadecimal\n"
            "  \"pruned\": xx,             (boolean) if the blocks are subject to pruning\n"
            "  \"pruneheight\": xxxxxx,    (numeric) heighest block available\n"
            "  \"softforks\": [            (array) status of softforks in progress\n"
            "     {\n"
            "        \"id\": \"xxxx\",        (string) name of softfork\n"
            "        \"version\": xx,         (numeric) block version\n"
            "        \"enforce\": {           (object) progress toward enforcing the softfork rules for new-version blocks\n"
            "           \"status\": xx,       (boolean) true if threshold reached\n"
            "           \"found\": xx,        (numeric) number of blocks with the new version found\n"
            "           \"required\": xx,     (numeric) number of blocks required to trigger\n"
            "           \"window\": xx,       (numeric) maximum size of examined window of recent blocks\n"
            "        },\n"
            "        \"reject\": { ... }      (object) progress toward rejecting pre-softfork blocks (same fields as \"enforce\")\n"
            "     }, ...\n"
            "  ],\n"
            "  \"bip9_softforks\": [       (array) status of BIP9 softforks in progress\n"
            "     {\n"
            "        \"id\": \"xxxx\",        (string) name of the softfork\n"
            "        \"status\": \"xxxx\",    (string) one of \"defined\", \"started\", \"lockedin\", \"active\", \"failed\"\n"
            "     }\n"
            "  ]\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getblockchaininfo", "")
            + HelpExampleRpc("getblockchaininfo", "")
        );

    LOCK(cs_main);

    UniValue obj(UniValue::VOBJ); // 构造一个目标对象
    obj.push_back(Pair("chain",                 Params().NetworkIDString())); // 网络 ID，主网 或 测试网
    obj.push_back(Pair("blocks",                (int)chainActive.Height())); // 当前区块高度
    obj.push_back(Pair("headers",               pindexBestHeader ? pindexBestHeader->nHeight : -1)); // 当前最佳区块头高度，同区块高度
    obj.push_back(Pair("bestblockhash",         chainActive.Tip()->GetBlockHash().GetHex())); // 最佳区块哈希（16 进制）
    obj.push_back(Pair("difficulty",            (double)GetDifficulty())); // 挖矿难度
    obj.push_back(Pair("mediantime",            (int64_t)chainActive.Tip()->GetMedianTimePast())); // 当前时间
    obj.push_back(Pair("verificationprogress",  Checkpoints::GuessVerificationProgress(Params().Checkpoints(), chainActive.Tip()))); // 验证进度，与检查点和链尖有关
    obj.push_back(Pair("chainwork",             chainActive.Tip()->nChainWork.GetHex())); // 当前的链工作量（16 进制）
    obj.push_back(Pair("pruned",                fPruneMode)); // 是否开启修剪模式

    const Consensus::Params& consensusParams = Params().GetConsensus();
    CBlockIndex* tip = chainActive.Tip();
    UniValue softforks(UniValue::VARR);
    UniValue bip9_softforks(UniValue::VARR);
    softforks.push_back(SoftForkDesc("bip34", 2, tip, consensusParams));
    softforks.push_back(SoftForkDesc("bip66", 3, tip, consensusParams));
    softforks.push_back(SoftForkDesc("bip65", 4, tip, consensusParams));
    bip9_softforks.push_back(BIP9SoftForkDesc("csv", consensusParams, Consensus::DEPLOYMENT_CSV));
    obj.push_back(Pair("softforks",             softforks)); // 软分叉
    obj.push_back(Pair("bip9_softforks", bip9_softforks)); // bip9_软分叉

    if (fPruneMode) // 若开启了修剪模式
    {
        CBlockIndex *block = chainActive.Tip();
        while (block && block->pprev && (block->pprev->nStatus & BLOCK_HAVE_DATA))
            block = block->pprev;

        obj.push_back(Pair("pruneheight",        block->nHeight)); // 加入修剪到的高度
    }
    return obj; // 返回目标对象
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.构造一个目标类型的对象。<br>
3.追加区块链相关信息到该对象。<br>
4.返回结果。<br>

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblockchaininfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
