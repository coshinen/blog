---
layout: post
title:  "比特币 RPC 命令剖析 \"getblock\""
date:   2018-05-23 10:30:06 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getblock "hash" ( verbose )
---
## 1. 帮助内容

```shell
getblock "hash" ( verbose )

如果 verbose 是 false，返回一个序列化的字符串，区块 'hash' 为 16 进制编码的数据。
如果 verbose 是 true，返回一个区块 <hash> 相关信息的对象。

参数：
1. "hash"（字符串，必备）区块哈希
2. verbose（布尔型，可选，默认为 true）true 对应一个 json 对象，false 对应 16 进制编码的数据

结果（对 verbose 为 true）：
{
  "hash" : "hash",             （字符串）区块哈希（和提供的一样）
  "confirmations" : n,         （数字）确认数，若区块不在主链上则为 -1
  "size" : n,                  （数字）区块大小
  "height" : n,                （数字）区块高度或索引
  "version" : n,               （数字）区块版本
  "merkleroot" : "xxxx",       （字符串）默克尔树根
  "tx" : [                     （字符串数组）交易索引集
     "transactionid"           （字符串）交易索引
     ,...
  ],
  "time" : ttt,                （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间
  "mediantime" : ttt,          （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的中间区块时间
  "nonce" : n,                 （数字）随机数
  "bits" : "1d00ffff",         （字符串）难度对应值
  "difficulty" : x.xxx,        （数字）难度
  "chainwork" : "xxxx",        （字符串）预计产生该区块上链需要的哈希次数（16 进制）
  "previousblockhash" : "hash",（字符串）上一个区块的哈希
  "nextblockhash" : "hash"     （字符串）下一个区块的哈希
}

结果（对 verbose 为 false）：
"data"（字符串）一个序列化的字符串，区块 'hash' 的 16 进制编码的数据。

例子：
> bitcoin-cli getblock 00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblock", "params": ["00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getblock` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getblock(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "getblock \"hash\" ( verbose )\n"
            "\nIf verbose is false, returns a string that is serialized, hex-encoded data for block 'hash'.\n"
            "If verbose is true, returns an Object with information about block <hash>.\n"
            "\nArguments:\n"
            "1. \"hash\"          (string, required) The block hash\n"
            "2. verbose           (boolean, optional, default=true) true for a json object, false for the hex encoded data\n"
            "\nResult (for verbose = true):\n"
            "{\n"
            "  \"hash\" : \"hash\",     (string) the block hash (same as provided)\n"
            "  \"confirmations\" : n,   (numeric) The number of confirmations, or -1 if the block is not on the main chain\n"
            "  \"size\" : n,            (numeric) The block size\n"
            "  \"height\" : n,          (numeric) The block height or index\n"
            "  \"version\" : n,         (numeric) The block version\n"
            "  \"merkleroot\" : \"xxxx\", (string) The merkle root\n"
            "  \"tx\" : [               (array of string) The transaction ids\n"
            "     \"transactionid\"     (string) The transaction id\n"
            "     ,...\n"
            "  ],\n"
            "  \"time\" : ttt,          (numeric) The block time in seconds since epoch (Jan 1 1970 GMT)\n"
            "  \"mediantime\" : ttt,    (numeric) The median block time in seconds since epoch (Jan 1 1970 GMT)\n"
            "  \"nonce\" : n,           (numeric) The nonce\n"
            "  \"bits\" : \"1d00ffff\", (string) The bits\n"
            "  \"difficulty\" : x.xxx,  (numeric) The difficulty\n"
            "  \"chainwork\" : \"xxxx\",  (string) Expected number of hashes required to produce the chain up to this block (in hex)\n"
            "  \"previousblockhash\" : \"hash\",  (string) The hash of the previous block\n"
            "  \"nextblockhash\" : \"hash\"       (string) The hash of the next block\n"
            "}\n"
            "\nResult (for verbose=false):\n"
            "\"data\"             (string) A string that is serialized, hex-encoded data for block 'hash'.\n"
            "\nExamples:\n"
            + HelpExampleCli("getblock", "\"00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09\"")
            + HelpExampleRpc("getblock", "\"00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09\"")
        ); // 1. 帮助内容

    LOCK(cs_main);

    std::string strHash = params[0].get_str();
    uint256 hash(uint256S(strHash));

    bool fVerbose = true;
    if (params.size() > 1)
        fVerbose = params[1].get_bool();

    if (mapBlockIndex.count(hash) == 0) // 2. 检查区块是否存在
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found");

    CBlock block;
    CBlockIndex* pblockindex = mapBlockIndex[hash];

    if (fHavePruned && !(pblockindex->nStatus & BLOCK_HAVE_DATA) && pblockindex->nTx > 0) // 3. 检查区块数据是否完整
        throw JSONRPCError(RPC_INTERNAL_ERROR, "Block not available (pruned data)");

    if(!ReadBlockFromDisk(block, pblockindex, Params().GetConsensus())) // 4. 从磁盘上读取区块
        throw JSONRPCError(RPC_INTERNAL_ERROR, "Can't read block from disk");

    if (!fVerbose) // 5. 序列化区块并返回
    {
        CDataStream ssBlock(SER_NETWORK, PROTOCOL_VERSION);
        ssBlock << block;
        std::string strHex = HexStr(ssBlock.begin(), ssBlock.end());
        return strHex;
    }

    return blockToJSON(block, pblockindex); // 6. 打包区块信息为 JSON 格式并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 检查区块是否存在

区块索引映射对象 `mapBlockIndex` 在文件 `main.h` 中被引用。

```cpp
struct BlockHasher
{
    size_t operator()(const uint256& hash) const { return hash.GetCheapHash(); }
};
...
typedef boost::unordered_map<uint256, CBlockIndex*, BlockHasher> BlockMap;
extern BlockMap mapBlockIndex;
```

定义在文件 `main.cpp` 中，是一个 `boost::unordered_map`。
这里的区块哈希器 `BlockHasher` 是一个重载了函数调用运算符的函数对象，用于获取区块哈希对象 `uint256` 的引用。

```cpp
BlockMap mapBlockIndex;
```

### 2.3. 检查区块数据是否完整

已修剪标志 `fHavePruned` 在文件 `main.h` 中被引用。

```cpp
/** True if any block files have ever been pruned. */
extern bool fHavePruned; // 如果任何区块文件被修剪过则为 true。
```

定义在文件 `main.cpp` 中，默认为 `false`，表示区块未修剪。

```cpp
bool fHavePruned = false;
```

区块索引变量 `pblockindex->nStatus` 和 `pblockindex->nTx` 定义在文件 `chain.h` 的区块索引类 `CBlockIndex` 中。
`BLOCK_HAVE_DATA` 是一个枚举类型，值为 `8`，表示在区块文件中是完整的区块。

```cpp
enum BlockStatus {
    ...
    BLOCK_HAVE_DATA          =    8, //! full block available in blk*.dat
    ...
};

/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */
class CBlockIndex
{
public:
    ...
    //! Number of transactions in this block.
    //! Note: in a potential headers-first mode, this number cannot be relied upon
    unsigned int nTx; //! 该区块中的交易数。
    ...
    //! Verification status of this block. See enum BlockStatus
    unsigned int nStatus; //! 该区块的验证状态。查看 enum BlockStatus
    ...
};
```

### 2.4. 从磁盘上读取区块

从磁盘上读取区块函数 `ReadBlockFromDisk(block, pblockindex, Params().GetConsensus())` 声明在文件 `main.h` 中。

```cpp
bool ReadBlockFromDisk(CBlock& block, const CDiskBlockPos& pos, const Consensus::Params& consensusParams);
bool ReadBlockFromDisk(CBlock& block, const CBlockIndex* pindex, const Consensus::Params& consensusParams);
```

实现在文件 `main.cpp` 中。

```cpp
bool ReadBlockFromDisk(CBlock& block, const CDiskBlockPos& pos, const Consensus::Params& consensusParams)
{
    block.SetNull();

    // Open history file to read
    CAutoFile filein(OpenBlockFile(pos, true), SER_DISK, CLIENT_VERSION);
    if (filein.IsNull())
        return error("ReadBlockFromDisk: OpenBlockFile failed for %s", pos.ToString());

    // Read block
    try {
        filein >> block;
    }
    catch (const std::exception& e) {
        return error("%s: Deserialize or I/O error - %s at %s", __func__, e.what(), pos.ToString());
    }

    // Check the header
    if (!CheckProofOfWork(block.GetHash(), block.nBits, consensusParams))
        return error("ReadBlockFromDisk: Errors in block header at %s", pos.ToString());

    return true;
}

bool ReadBlockFromDisk(CBlock& block, const CBlockIndex* pindex, const Consensus::Params& consensusParams)
{
    if (!ReadBlockFromDisk(block, pindex->GetBlockPos(), consensusParams)) // 调用上面的重载函数读取区块
        return false;
    if (block.GetHash() != pindex->GetBlockHash()) // 验证读取的区块哈希
        return error("ReadBlockFromDisk(CBlock&, CBlockIndex*): GetHash() doesn't match index for %s at %s",
                pindex->ToString(), pindex->GetBlockPos().ToString());
    return true;
}
```

函数 `block.GetHash()` 声明在文件 `primitives/block.h` 的区块头类 `CBlockHeader` 中。

```cpp
/** Nodes collect new transactions into a block, hash them into a hash tree,
 * and scan through nonce values to make the block's hash satisfy proof-of-work
 * requirements.  When they solve the proof-of-work, they broadcast the block
 * to everyone and the block is added to the block chain.  The first transaction
 * in the block is a special one that creates a new coin owned by the creator
 * of the block.
 */
class CBlockHeader // 区块头部分（包含区块版本、前一个区块的哈希、默尔克树根哈希、创建区块的时间、难度对应值和随机数）共 80 bytes
{
public:
    ...
    uint256 GetHash() const;
    ...
};

class CBlock : public CBlockHeader
{
    ...
};
```

实现在文件 `primitives/block.cpp` 中。

```cpp
uint256 CBlockHeader::GetHash() const
{
    return SerializeHash(*this);
}
```

这里调用模板函数 `SerializeHash(*this)` 序列化区块的哈希。

### 2.5. 序列化区块并返回

若 `verbose` 为 `false`，则序列化区块数据，转换为 16 进制并返回。
数据流类 `CDataStream` 定义在文件 `streams.h` 中，重载了输出运算符 `<<`。

```cpp
/** Double ended buffer combining vector and stream-like interfaces.
 *
 * >> and << read and write unformatted data using the above serialization templates.
 * Fills with data in linear time; some stringstream implementations take N^2 time.
 */
class CDataStream
{
    ...
    template<typename T>
    CDataStream& operator<<(const T& obj)
    {
        // Serialize to this stream
        ::Serialize(*this, obj, nType, nVersion);
        return (*this);
    }
    ...
};
```

结合向量和流式接口的双端缓冲区。
使用上述序列化模板 `>>` 和 `<<` 来读写未格式化的数据。
以线性时间填充数据；一些字符串流的实现需要 N^2 的时间。

调用模板函数 `HexStr(ssBlock.begin(), ssBlock.end())` 把流化的数据转换为 16 进制。
实现在文件 `utilstrencodings.h` 中。

```cpp
template<typename T>
std::string HexStr(const T itbegin, const T itend, bool fSpaces=false)
{
    std::string rv;
    static const char hexmap[16] = { '0', '1', '2', '3', '4', '5', '6', '7',
                                     '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };
    rv.reserve((itend-itbegin)*3); // 乘 3 的原因：一个字节 8 位，对应 16 进制的 2 位，再加上中间的空格
    for(T it = itbegin; it < itend; ++it)
    {
        unsigned char val = (unsigned char)(*it);
        if(fSpaces && it != itbegin) // 空格隔开每一个 16 进制字符，默认不加空格
            rv.push_back(' ');
        rv.push_back(hexmap[val>>4]); // 高 4 位
        rv.push_back(hexmap[val&15]); // 低 4 位
    }

    return rv;
}
```

把每个字节拆成高 4 位和低 4 位分别转换为 16 进制的字符。
还可以在每个 16 进制字符中间加入空格，默认不加。

### 2.6. 打包区块信息为 JSON 格式并返回

若 verbose 为 true，则返回区块信息。
函数 `blockToJSON(block, pblockindex)` 实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue blockToJSON(const CBlock& block, const CBlockIndex* blockindex, bool txDetails = false)
{
    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("hash", block.GetHash().GetHex())); // 先加入区块的哈希（16 进制形式）
    int confirmations = -1; // 记录该区块的确认数
    // Only report confirmations if the block is on the main chain
    if (chainActive.Contains(blockindex)) // 若该区块在链上
        confirmations = chainActive.Height() - blockindex->nHeight + 1; // 计算确认数，注：刚上链的确认数为 1
    result.push_back(Pair("confirmations", confirmations)); // 加入确认数
    result.push_back(Pair("size", (int)::GetSerializeSize(block, SER_NETWORK, PROTOCOL_VERSION))); // 区块大小（单位字节）
    result.push_back(Pair("height", blockindex->nHeight)); // 区块高度
    result.push_back(Pair("version", block.nVersion)); // 区块版本
    result.push_back(Pair("merkleroot", block.hashMerkleRoot.GetHex())); // 默克树根
    UniValue txs(UniValue::VARR); // 数组类型的交易对象
    BOOST_FOREACH(const CTransaction&tx, block.vtx)
    { // 遍历交易列表
        if(txDetails) // false
        { // 交易细节
            UniValue objTx(UniValue::VOBJ);
            TxToJSON(tx, uint256(), objTx); // 把交易信息转换为 JSON 格式输入到 objTx
            txs.push_back(objTx);
        }
        else // 加入交易哈希
            txs.push_back(tx.GetHash().GetHex());
    }
    result.push_back(Pair("tx", txs)); // 交易集
    result.push_back(Pair("time", block.GetBlockTime())); // 获取区块创建时间
    result.push_back(Pair("mediantime", (int64_t)blockindex->GetMedianTimePast()));
    result.push_back(Pair("nonce", (uint64_t)block.nNonce)); // 随机数
    result.push_back(Pair("bits", strprintf("%08x", block.nBits))); // 难度对应值
    result.push_back(Pair("difficulty", GetDifficulty(blockindex))); // 难度
    result.push_back(Pair("chainwork", blockindex->nChainWork.GetHex())); // 链工作量

    if (blockindex->pprev) // 如果有前一个区块
        result.push_back(Pair("previousblockhash", blockindex->pprev->GetBlockHash().GetHex())); // 加入前一个区块的哈希
    CBlockIndex *pnext = chainActive.Next(blockindex);
    if (pnext) // 如果后后一个区块
        result.push_back(Pair("nextblockhash", pnext->GetBlockHash().GetHex())); // 加入后一个区块的哈希
    return result;
}
```

函数 `chainActive.Contains(blockindex)` 和 `chainActive.Next(blockindex)` 均声明在文件 `chain.h` 的链类 `CChain` 中。

```cpp
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中已索引的区块链。
    ...
    /** Returns the index entry at a particular height in this chain, or NULL if no such height exists. */
    CBlockIndex *operator[](int nHeight) const { // 返回该链上指定高度的索引条目，若这样的高度不存在则返回 NULL。
        if (nHeight < 0 || nHeight >= (int)vChain.size())
            return NULL;
        return vChain[nHeight];
    }
    ...
    /** Efficiently check whether a block is present in this chain. */
    bool Contains(const CBlockIndex *pindex) const { // 有效检测该链上是否存在某个块。
        return (*this)[pindex->nHeight] == pindex;
    }
    
    /** Find the successor of a block in this chain, or NULL if the given index is not found or is the tip. */
    CBlockIndex *Next(const CBlockIndex *pindex) const { // 在该链上找到一个区块的后继者，若给定的区块未找到或为链尖则返回 NULL。
        if (Contains(pindex))
            return (*this)[pindex->nHeight + 1];
        else
            return NULL;
    }
    ...
};
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
* [bitcoin/chain.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.h){:target="_blank"}
* [bitcoin/block.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/primitives/block.h){:target="_blank"}
* [bitcoin/block.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/primitives/block.cpp){:target="_blank"}
* [bitcoin/streams.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/streams.h){:target="_blank"}
* [bitcoin/utilstrencodings.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/utilstrencodings.h){:target="_blank"}
