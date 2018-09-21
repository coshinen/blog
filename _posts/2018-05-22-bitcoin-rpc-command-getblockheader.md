---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockheader\""
date:   2018-05-22 15:11:12 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getblockheader "hash" ( verbose )
---
## 提示说明

{% highlight shell %}
getblockheader "hash" ( verbose ) # 通过区块哈希（16 进制形式）获取指定区块头的信息
{% endhighlight %}

参数：<br>
1. "hash" （字符串，必备）区块哈希（16 进制形式）。<br>
2. verbose （布尔型，可选，默认为 true）true 获取区块头信息的 json 格式对象，false 获取 16 进制编码的区块头数据。

结果（verbose 为 true）：<br>
{% highlight shell %}
{
  "hash" : "hash",     （字符串）区块哈希（和提供的一样）
  "confirmations" : n,   （数字）确认数，若区块不在主链上则为 -1
  "height" : n,          （数字）区块高度或区块索引
  "version" : n,         （数字）区块版本
  "merkleroot" : "xxxx", （字符串）默尔克数根哈希
  "time" : ttt,          （数字）从（格林尼治时间 1970-01-01 00:00:00）开始以秒为单位的区块时间
  "mediantime" : ttt,    （数字）从（格林尼治时间 1970-01-01 00:00:00）开始以秒为单位的中间区块时间（意味不明）
  "nonce" : n,           （数字）随机数
  "bits" : "1d00ffff", （字符串）难度对应值
  "difficulty" : x.xxx,  （数字）难度
  "previousblockhash" : "hash",  （字符串）前一个区块的哈希
  "nextblockhash" : "hash",      （字符串）下一个区块的哈希
  "chainwork" : "0000...1f3"     （字符串）预计生成当前链所需的哈希次数（16 进制）
}
{% endhighlight %}

结果（verbose 为 false）：（字符串）返回序列化的字符串，16 进制编码的区块头数据。

## 用法示例

### 比特币核心客户端

用法一：获取最佳区块头的详细信息。

{% highlight shell %}
$ bitcoin-cli getbestblockhash
000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
$ bitcoin-cli getblockheader 000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
{
  "hash": "000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53",
  "confirmations": 1,
  "height": 20034,
  "version": 536870912,
  "merkleroot": "eb4313dc4dcb57e94d7c46632456a61a64ed44dfc0a6eadc6357083cfa82a120",
  "time": 1529895963,
  "mediantime": 1529895953,
  "nonce": 1286380,
  "bits": "1e028c2a",
  "difficulty": 0.001533333096242079,
  "chainwork": "00000000000000000000000000000000000000000000000000000009bb56ea79",
  "previousblockhash": "000000280142d26678ec5ee733a8bd81325f2cff2a8e7b3beb714e999ffd2fa0",
  "nextblockhash": "000000dce9599ed928a5bf2170629b790b9ebabf5592701bce8f3e783288c62f"
}
{% endhighlight %}

用法二：获取最佳区块头的详细信息，显示指定 verbose 为 true。

{% highlight shell %}
$ bitcoin-cli getbestblockhash
000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
$ bitcoin-cli getblockheader 000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53 true
... # 结果同上
{% endhighlight %}

用法三：设置 verbose 为 false，获取序列化的最佳区块头数据（用途不明）。

{% highlight shell %}
$ bitcoin-cli getbestblockhash
000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
$ bitcoin-cli getblockheader 000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53 false
00000020a02ffd9f994e71eb3b7b8e2aff2c5f3281bda833e75eec7866d242012800000020a182fa3c085763dceaa6c0df44ed641aa6562463467c4de957cb4ddc1343eb1b5c305b2a8c021eeca01300
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockheader", "params": ["000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"hash":"000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53","confirmations":5117,"height":20034,"version":536870912,"merkleroot":"eb4313dc4dcb57e94d7c46632456a61a64ed44dfc0a6eadc6357083cfa82a120","time":1529895963,"mediantime":1529895953,"nonce":1286380,"bits":"1e028c2a","difficulty":0.001533333096242079,"chainwork":"00000000000000000000000000000000000000000000000000000009bb56ea79","previousblockhash":"000000280142d26678ec5ee733a8bd81325f2cff2a8e7b3beb714e999ffd2fa0","nextblockhash":"000000dce9599ed928a5bf2170629b790b9ebabf5592701bce8f3e783288c62f"},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getblockheader 对应的函数在“rpcserver.h”文件中被引用。

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
