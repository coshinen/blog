---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockchaininfo\""
date:   2018-05-22 11:27:13 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin client rpc
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getblockchaininfo # 获取区块链信息
{% endhighlight %}

结果：返回一个包含关于区块链处理的变量状态信息的对象。<br>
{% highlight shell %}
{
  "chain": "xxxx",        （字符串）当前 BIP70 定义的（main, test, regtest）网络名
  "blocks": xxxxxx,         （数字）当前服务器已处理的区块数
  "headers": xxxxxx,        （数字）当前我们验证过的区块头数
  "bestblockhash": "...", （字符串）当前最佳区块哈希
  "difficulty": xxxxxx,     （数字）当前难度
  "mediantime": xxxxxx,     （数字）当前最佳区块的中间时间
  "verificationprogress": xxxx, （数字）验证进度的估计值 [0..1]
  "chainwork": "xxxx"     （字符串）激活链上的总工作量，16 进制
  "pruned": xx,             （布尔型）如果区块被修剪
  "pruneheight": xxxxxx,    （数字）可用的最高区块
  "softforks": [            （数组）正在进行的软分叉状态
     {
        "id": "xxxx",        （字符串）软分叉名
        "version": xx,         （数字）区块版本
        "enforce": {           （对象）对新版本的区块执行软分叉规则的进度
           "status": xx,       （布尔型）如果到达阈值则为 true
           "found": xx,        （数字）找到的新版本的区块数
           "required": xx,     （数字）需要触发的区块数
           "window": xx,       （数字）最近区块的检查窗口的最大尺寸
        },
        "reject": { ... }      （对象）正在拒绝预软分叉区块的进度（和 "enforce" 域相同）
     }, ...
  ],
  "bip9_softforks": [       （数组）正在进行的 BIP9 软分叉的状态
     {
        "id": "xxxx",        （字符串）软分叉名
        "status": "xxxx",    （字符串）状态 "defined", "started", "lockedin", "active", "failed" 之一
     }
  ]
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取当前区块链信息。

{% highlight shell %}
$ bitcoin-cli getblockchaininfo
{
  "chain": "main",
  "blocks": 21787,
  "headers": 21787,
  "bestblockhash": "0000008ab63f8498ae2adf1029b069ac5ea9d5a15631fea9107205cfdaf72f03",
  "difficulty": 0.0003833332740605197,
  "mediantime": 1529899046,
  "verificationprogress": 0.9999999830005525,
  "chainwork": "0000000000000000000000000000000000000000000000000000000a8c2b98b0",
  "pruned": false,
  "softforks": [
    {
      "id": "bip34",
      "version": 2,
      "enforce": {
        "status": true,
        "found": 1000,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": true,
        "found": 1000,
        "required": 950,
        "window": 1000
      }
    }, 
    {
      "id": "bip66",
      "version": 3,
      "enforce": {
        "status": true,
        "found": 1000,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": true,
        "found": 1000,
        "required": 950,
        "window": 1000
      }
    }, 
    {
      "id": "bip65",
      "version": 4,
      "enforce": {
        "status": true,
        "found": 1000,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": true,
        "found": 1000,
        "required": 950,
        "window": 1000
      }
    }
  ],
  "bip9_softforks": [
    {
      "id": "csv",
      "status": "failed"
    }
  ]
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"chain":"main","blocks":25094,"headers":25094,"bestblockhash":"000000d3941157a9621e13d7b672e2616a82591e4d7fabfb4d42108d688b03a9","difficulty":0.001532956637923291,"mediantime":1529917586,"verificationprogress":0.9999999861643509,"chainwork":"0000000000000000000000000000000000000000000000000000000f2bfb4635","pruned":false,"softforks":[{"id":"bip34","version":2,"enforce":{"status":true,"found":1000,"required":750,"window":1000},"reject":{"status":true,"found":1000,"required":950,"window":1000}},{"id":"bip66","version":3,"enforce":{"status":true,"found":1000,"required":750,"window":1000},"reject":{"status":true,"found":1000,"required":950,"window":1000}},{"id":"bip65","version":4,"enforce":{"status":true,"found":1000,"required":750,"window":1000},"reject":{"status":true,"found":1000,"required":950,"window":1000}}],"bip9_softforks":[{"id":"csv","status":"failed"}]},"error":null,"id":"curltest"}
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
4.返回结果。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblockchaininfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
