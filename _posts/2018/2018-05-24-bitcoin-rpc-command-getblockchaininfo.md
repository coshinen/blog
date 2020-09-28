---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockchaininfo\""
date:   2018-05-24 11:27:13 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getblockchaininfo
---
## 1. 帮助内容

```shell
getblockchaininfo

返回一个包含关于区块链处理的各种状态信息的对象。

结果：
{
  "chain": "xxxx",             （字符串）当前 BIP70 中定义的网络名（main，test，regtest）
  "blocks": xxxxxx,            （数字）服务器当前已处理的区块数
  "headers": xxxxxx,           （数字）当前我们验证过的区块头数
  "bestblockhash": "...",      （字符串）当前最佳区块的哈希
  "difficulty": xxxxxx,        （数字）当前的难度
  "mediantime": xxxxxx,        （数字）当前最佳区块的中间时间
  "verificationprogress": xxxx,（数字）验证进度的估计值 [0..1]
  "chainwork": "xxxx"          （字符串）活跃的链上的总工作量，16 进制
  "pruned": xx,                （布尔型）区块是否处于修剪中
  "pruneheight": xxxxxx,       （数字）有效的最高的区块
  "softforks": [               （数组）正在进行的软分叉状态
     {
        "id": "xxxx",          （字符串）软分叉名
        "version": xx,         （数字）区块版本
        "enforce": {           （对象）对新版本的区块执行软分叉规则的进度
           "status": xx,       （布尔型）如果到达阈值则为 true
           "found": xx,        （数字）新版本发现的区块数
           "required": xx,     （数字）需要触发的区块数
           "window": xx,       （数字）最近区块的检查窗口的最大尺寸
        },
        "reject": { ... }      （对象）正在拒绝预软分叉区块的进度（和 "enforce" 域相同）
     }, ...
  ],
  "bip9_softforks": [          （数组）正在进行的 BIP9 软分叉的状态
     {
        "id": "xxxx",          （字符串）软分叉名
        "status": "xxxx",      （字符串）"defined"，"started"，"lockedin"，"active"，"failed" 之一
     }
  ]
}

例子：
> bitcoin-cli getblockchaininfo
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getblockchaininfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getblockchaininfo(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getblockchaininfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);

    UniValue obj(UniValue::VOBJ); // 2. 获取区块链状态信息并返回
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

    if (fPruneMode) // 修剪模式
    {
        CBlockIndex *block = chainActive.Tip();
        while (block && block->pprev && (block->pprev->nStatus & BLOCK_HAVE_DATA))
            block = block->pprev;

        obj.push_back(Pair("pruneheight",        block->nHeight)); // 修剪高度
    }
    return obj;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
