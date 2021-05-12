---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockheader\""
date:   2018-05-29 21:11:12 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getblockheader "hash" ( verbose )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getblockheader
getblockheader "hash" ( verbose )

若 verbose 为 false，返回一个序列化的字符串，区块头 'hash' 的 16 进制编码数据。
若 verbose 为 true，返回一个包含区块头 <hash> 信息的对象。

参数：
1. "hash" （字符串，必备）区块哈希
2. verbose（布尔型，可选，默认为 true）true 为一个 json 对象，false 为 16 进制编码的数据

结果（verbose 为 true）：
{
  "hash" : "hash",      （字符串）区块哈希（和提供的一样）
  "confirmations" : n,  （数字）确认数，若区块不在主链上则为 -1
  "height" : n,         （数字）区块高度或索引
  "version" : n,        （数字）区块版本
  "merkleroot" : "xxxx",（字符串）默克尔树根
  "time" : ttt,         （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间
  "mediantime" : ttt,   （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的中间区块时间
  "nonce" : n,          （数字）随机数
  "bits" : "1d00ffff",  （字符串）难度对应值
  "difficulty" : x.xxx, （数字）难度
  "previousblockhash" : "hash",（字符串）上一个区块的哈希
  "nextblockhash" : "hash",    （字符串）下一个区块的哈希
  "chainwork" : "0000...1f3"   （字符串）预计生成当前链所需的哈希次数（16 进制）
}

结果（verbose 为 false）：
"data"（字符串）一个序列化的字符串，区块 'hash' 的 16 进制编码数据。

例子：
> bitcoin-cli getblockheader 00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockheader", "params": ["00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getblockheader` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getblockheader(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getblockheader(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);

    std::string strHash = params[0].get_str();
    uint256 hash(uint256S(strHash));

    bool fVerbose = true;
    if (params.size() > 1)
        fVerbose = params[1].get_bool();

    if (mapBlockIndex.count(hash) == 0) // 2. 检查区块是否存在
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found");

    CBlockIndex* pblockindex = mapBlockIndex[hash];

    if (!fVerbose) // 3. 序列化区块头并返回
    {
        CDataStream ssBlock(SER_NETWORK, PROTOCOL_VERSION);
        ssBlock << pblockindex->GetBlockHeader();
        std::string strHex = HexStr(ssBlock.begin(), ssBlock.end());
        return strHex;
    }

    return blockheaderToJSON(pblockindex); // 4. 把区块头封装为 JSON 格式并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 检查区块是否存在

参考[比特币 RPC 命令剖析 "getblock" 2.2. 检查区块是否存在](/blog/2018/05/bitcoin-rpc-command-getblock.html#22-检查区块是否存在)。

### 2.3. 序列化区块头并返回

参考[比特币 RPC 命令剖析 "getblock" 2.5. 序列化区块并返回](/blog/2018/05/bitcoin-rpc-command-getblock.html#25-序列化区块并返回)。

获取区块头函数 `pblockindex->GetBlockHeader()` 实现在文件 `chain.h` 中。

```cpp
/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */
class CBlockIndex
{
public:
    //! pointer to the hash of the block, if any. Memory is owned by this CBlockIndex
    const uint256* phashBlock; //! 指向区块哈希的指针（如果存在）。内存属于该 CBlockIndex

    //! pointer to the index of the predecessor of this block
    CBlockIndex* pprev; //! 指向该区块的上一块索引的指针
    ...
    //! block header
    int nVersion;
    uint256 hashMerkleRoot;
    unsigned int nTime;
    unsigned int nBits;
    unsigned int nNonce;
    ...
    CBlockHeader GetBlockHeader() const
    {
        CBlockHeader block;
        block.nVersion       = nVersion;
        if (pprev)
            block.hashPrevBlock = pprev->GetBlockHash();
        block.hashMerkleRoot = hashMerkleRoot;
        block.nTime          = nTime;
        block.nBits          = nBits;
        block.nNonce         = nNonce;
        return block;
    }

    uint256 GetBlockHash() const
    {
        return *phashBlock;
    }
    ...
};
```

### 2.4. 把区块头封装为 JSON 格式并返回

把区块头封装为 JSON 格式函数 `blockheaderToJSON(pblockindex)` 实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue blockheaderToJSON(const CBlockIndex* blockindex)
{
    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("hash", blockindex->GetBlockHash().GetHex())); // 区块哈希
    int confirmations = -1;
    // Only report confirmations if the block is on the main chain
    if (chainActive.Contains(blockindex)) // 仅当区块在主链上时报告确认数
        confirmations = chainActive.Height() - blockindex->nHeight + 1; // 计算确认数
    result.push_back(Pair("confirmations", confirmations)); // 确认数
    result.push_back(Pair("height", blockindex->nHeight)); // 区块高度
    result.push_back(Pair("version", blockindex->nVersion)); // 区块版本号
    result.push_back(Pair("merkleroot", blockindex->hashMerkleRoot.GetHex())); // 默克尔树根哈希
    result.push_back(Pair("time", (int64_t)blockindex->nTime)); // 区块创建时间
    result.push_back(Pair("mediantime", (int64_t)blockindex->GetMedianTimePast())); // 区块中间时间
    result.push_back(Pair("nonce", (uint64_t)blockindex->nNonce)); // 随机数
    result.push_back(Pair("bits", strprintf("%08x", blockindex->nBits))); // 难度对应值
    result.push_back(Pair("difficulty", GetDifficulty(blockindex))); // 难度
    result.push_back(Pair("chainwork", blockindex->nChainWork.GetHex())); // 链工作量

    if (blockindex->pprev) // 上一个区块的哈希
        result.push_back(Pair("previousblockhash", blockindex->pprev->GetBlockHash().GetHex()));
    CBlockIndex *pnext = chainActive.Next(blockindex);
    if (pnext) // 下一个区块的哈希
        result.push_back(Pair("nextblockhash", pnext->GetBlockHash().GetHex()));
    return result;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/chain.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.h){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
