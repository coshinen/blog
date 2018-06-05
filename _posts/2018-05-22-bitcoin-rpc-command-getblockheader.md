---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockheader\""
date:   2018-05-22 15:11:12 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getblockheader "hash" ( verbose ) # 通过指定的区块哈希（16 进制形式）获取相应区块头的信息
{% endhighlight %}

参数：<br>
1. `"hash"` （字符串，必备）区块哈希（16 进制形式）。<br>
2. `verbose` （布尔型，可选，默认为 true）true 获取区块头信息的 json 格式对象，false 获取 16 进制编码的区块头数据。

结果（verbose 为 true）：<br>
{% highlight shell %}
{
  "hash" : "hash",     (string) the block hash (same as provided)
  "confirmations" : n,   (numeric) The number of confirmations, or -1 if the block is not on the main chain
  "height" : n,          (numeric) The block height or index
  "version" : n,         (numeric) The block version
  "merkleroot" : "xxxx", (string) The merkle root
  "time" : ttt,          (numeric) The block time in seconds since epoch (Jan 1 1970 GMT)
  "mediantime" : ttt,    (numeric) The median block time in seconds since epoch (Jan 1 1970 GMT)
  "nonce" : n,           (numeric) The nonce
  "bits" : "1d00ffff", (string) The bits
  "difficulty" : x.xxx,  (numeric) The difficulty
  "previousblockhash" : "hash",  (string) The hash of the previous block
  "nextblockhash" : "hash",      (string) The hash of the next block
  "chainwork" : "0000...1f3"     (string) Expected number of hashes required to produce the current chain (in hex)
}
{% endhighlight %}

结果（verbose 为 false）：<br>
{% highlight shell %}
"data"             (string) A string that is serialized, hex-encoded data for block 'hash'.
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli getblockheader 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
{
  "hash": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
  "confirmations": 1,
  "height": 0,
  "version": 1,
  "merkleroot": "",
  "time": 1521496800,
  "mediantime": 1521496800,
  "nonce": 3304190909,
  "bits": "1d00ffff",
  "difficulty": 1,
  "chainwork": "0000000000000000000000000000000000000000000000000000000100010001"
}
{% endhighlight %}

## 源码剖析
`getblockheader` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getblockheader(const UniValue& params, bool fHelp); // 获取指定区块哈希的区块头信息
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue getblockheader(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数至少为 1 个（区块哈希），至多 2 个
        throw runtime_error( // 命令帮助反馈
            "getblockheader \"hash\" ( verbose )\n"
            "\nIf verbose is false, returns a string that is serialized, hex-encoded data for blockheader 'hash'.\n"
            "If verbose is true, returns an Object with information about blockheader <hash>.\n"
            "\nArguments:\n"
            "1. \"hash\"          (string, required) The block hash\n"
            "2. verbose           (boolean, optional, default=true) true for a json object, false for the hex encoded data\n"
            "\nResult (for verbose = true):\n"
            "{\n"
            "  \"hash\" : \"hash\",     (string) the block hash (same as provided)\n"
            "  \"confirmations\" : n,   (numeric) The number of confirmations, or -1 if the block is not on the main chain\n"
            "  \"height\" : n,          (numeric) The block height or index\n"
            "  \"version\" : n,         (numeric) The block version\n"
            "  \"merkleroot\" : \"xxxx\", (string) The merkle root\n"
            "  \"time\" : ttt,          (numeric) The block time in seconds since epoch (Jan 1 1970 GMT)\n"
            "  \"mediantime\" : ttt,    (numeric) The median block time in seconds since epoch (Jan 1 1970 GMT)\n"
            "  \"nonce\" : n,           (numeric) The nonce\n"
            "  \"bits\" : \"1d00ffff\", (string) The bits\n"
            "  \"difficulty\" : x.xxx,  (numeric) The difficulty\n"
            "  \"previousblockhash\" : \"hash\",  (string) The hash of the previous block\n"
            "  \"nextblockhash\" : \"hash\",      (string) The hash of the next block\n"
            "  \"chainwork\" : \"0000...1f3\"     (string) Expected number of hashes required to produce the current chain (in hex)\n"
            "}\n"
            "\nResult (for verbose=false):\n"
            "\"data\"             (string) A string that is serialized, hex-encoded data for block 'hash'.\n"
            "\nExamples:\n"
            + HelpExampleCli("getblockheader", "\"00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09\"")
            + HelpExampleRpc("getblockheader", "\"00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09\"")
        );

    LOCK(cs_main); // 上锁

    std::string strHash = params[0].get_str(); // 获取区块哈希字符串
    uint256 hash(uint256S(strHash)); // 创建 uint256 局部对象

    bool fVerbose = true; // 详细信息标志，默认为 true
    if (params.size() > 1)
        fVerbose = params[1].get_bool(); // 获取是否显示详细信息

    if (mapBlockIndex.count(hash) == 0) // 判断哈希对应的区块是否存在于区块索引映射
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found");

    CBlockIndex* pblockindex = mapBlockIndex[hash]; // 获取指定哈希的区块索引

    if (!fVerbose) // false
    {
        CDataStream ssBlock(SER_NETWORK, PROTOCOL_VERSION); // 序列化
        ssBlock << pblockindex->GetBlockHeader(); // 通过区块索引获取并导入区块头数据
        std::string strHex = HexStr(ssBlock.begin(), ssBlock.end()); // 16 进制化
        return strHex; // 返回
    }

    return blockheaderToJSON(pblockindex); // 封装区块头信息为 JSON 格式并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取指定区块哈希并创建 uint256 对象。<br>
4.设置显示详细信息标志。<br>
5.检查指定区块哈希的区块是否存在于区块索引映射。<br>
6.获取指定区块哈希对应的区块索引。<br>
7.若详细标志为 false，则序列化区块数据，转换为 16 进制并返回。<br>
8.否则把区块头信息打包为 JSON 格式并返回。

最后调用 blockheaderToJSON(pblockindex) 函数把区块索引信息封装为 JSON 格式。<br>
该函数实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue blockheaderToJSON(const CBlockIndex* blockindex)
{
    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("hash", blockindex->GetBlockHash().GetHex())); // 区块哈希
    int confirmations = -1;
    // Only report confirmations if the block is on the main chain
    if (chainActive.Contains(blockindex))
        confirmations = chainActive.Height() - blockindex->nHeight + 1; // 计算确认数
    result.push_back(Pair("confirmations", confirmations)); // 确认数
    result.push_back(Pair("height", blockindex->nHeight)); // 区块链高度
    result.push_back(Pair("version", blockindex->nVersion)); // 区块版本号
    result.push_back(Pair("merkleroot", blockindex->hashMerkleRoot.GetHex())); // 默克树根
    result.push_back(Pair("time", (int64_t)blockindex->nTime)); // 区块创建时间
    result.push_back(Pair("mediantime", (int64_t)blockindex->GetMedianTimePast()));
    result.push_back(Pair("nonce", (uint64_t)blockindex->nNonce)); // 随机数
    result.push_back(Pair("bits", strprintf("%08x", blockindex->nBits))); // 难度对应值
    result.push_back(Pair("difficulty", GetDifficulty(blockindex))); // 难度
    result.push_back(Pair("chainwork", blockindex->nChainWork.GetHex())); // 工作量

    if (blockindex->pprev) // 上一个区块的哈希
        result.push_back(Pair("previousblockhash", blockindex->pprev->GetBlockHash().GetHex()));
    CBlockIndex *pnext = chainActive.Next(blockindex);
    if (pnext) // 下一个区块的哈希
        result.push_back(Pair("nextblockhash", pnext->GetBlockHash().GetHex()));
    return result;
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblockheader)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
