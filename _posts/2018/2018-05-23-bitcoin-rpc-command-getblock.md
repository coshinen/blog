---
layout: post
title:  "比特币 RPC 命令剖析 \"getblock\""
date:   2018-05-23 10:30:06 +0800
author: mistydew
comments: true
categories: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getblock "hash" ( verbose )
---
## 提示说明

```shell
getblock "hash" ( verbose ) # 通过区块哈希（16 进制形式）获取指定区块信息
```

参数：
1. "hash"（字符串，必备）区块哈希（16 进制形式）。
2. verbose（布尔型，可选，默认为 true）true 获取区块信息的 json 格式对象，false 获取 16 进制编码的区块数据。

结果（verbose 为 true）：

```shell
{
  "hash" : "hash",     （字符串）区块哈希（和提供的一样）
  "confirmations" : n,   （数字）确认数，若指定区块不在主链上则该值为 -1
  "size" : n,            （数字）区块大小
  "height" : n,          （数字）区块高度或区块索引
  "version" : n,         （数字）区块版本
  "merkleroot" : "xxxx", （字符串）默尔克数根哈希
  "tx" : [               （字符串数组）交易索引集
     "transactionid"     （字符串）交易索引
     ,...
  ],
  "time" : ttt,          （数字）从（格林尼治时间 1970-01-01 00:00:00）开始以秒为单位的区块时间
  "mediantime" : ttt,    （数字）从（格林尼治时间 1970-01-01 00:00:00）开始以秒为单位的中间区块时间（意味不明）
  "nonce" : n,           （数字）随机数
  "bits" : "1d00ffff", （字符串）难度对应值（与难度呈反比）
  "difficulty" : x.xxx,  （数字）难度
  "chainwork" : "xxxx",  （字符串）预计产生该区块上链所需的哈希次数
  "previousblockhash" : "hash",  （字符串）前一个区块的哈希
  "nextblockhash" : "hash"       （字符串）下一个区块的哈希
}
```

结果（verbose 为 false）：（字符串）一个序列化的字符串，区块信息的 16 进制编码的数据。

## 用法示例

### 比特币核心客户端

用法一：获取最佳区块的详细信息。

```shell
$ bitcoin-cli getbestblockhash
000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
$ bitcoin-cli getblock 000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
{
  "hash": "000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53",
  "confirmations": 1,
  "size": 181,
  "height": 20034,
  "version": 536870912,
  "merkleroot": "eb4313dc4dcb57e94d7c46632456a61a64ed44dfc0a6eadc6357083cfa82a120",
  "tx": [
    "eb4313dc4dcb57e94d7c46632456a61a64ed44dfc0a6eadc6357083cfa82a120"
  ],
  "time": 1529895963,
  "mediantime": 1529895953,
  "nonce": 1286380,
  "bits": "1e028c2a",
  "difficulty": 0.001533333096242079,
  "chainwork": "00000000000000000000000000000000000000000000000000000009bb56ea79",
  "previousblockhash": "000000280142d26678ec5ee733a8bd81325f2cff2a8e7b3beb714e999ffd2fa0",
  "nextblockhash": "000000dce9599ed928a5bf2170629b790b9ebabf5592701bce8f3e783288c62f"
}
```

用法二：获取最佳区块的详细信息，显示指定 verbose 为 true。

```shell
$ bitcoin-cli getbestblockhash
000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
$ bitcoin-cli getblock 000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53 true
... # 结果同上
```

用法三：设置 verbose 为 false，获取序列化的最佳区块数据。

```shell
$ bitcoin-cli getbestblockhash
000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53
$ bitcoin-cli getblock 000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53 false
00000020a02ffd9f994e71eb3b7b8e2aff2c5f3281bda833e75eec7866d242012800000020a182fa3c085763dceaa6c0df44ed641aa6562463467c4de957cb4ddc1343eb1b5c305b2a8c021eeca013000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0502424e0101ffffffff0100f2052a0100000023210299727931231540202a3b33c956bf2af144330b731153a2fd9ba194e367ed6414ac00000000
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblock", "params": ["000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"hash":"000000ee6688672afe26c714e89592d2926eb53dfd8642f0a7412a6c43973a53","confirmations":5038,"size":181,"height":20034,"version":536870912,"merkleroot":"eb4313dc4dcb57e94d7c46632456a61a64ed44dfc0a6eadc6357083cfa82a120","tx":["eb4313dc4dcb57e94d7c46632456a61a64ed44dfc0a6eadc6357083cfa82a120"],"time":1529895963,"mediantime":1529895953,"nonce":1286380,"bits":"1e028c2a","difficulty":0.001533333096242079,"chainwork":"00000000000000000000000000000000000000000000000000000009bb56ea79","previousblockhash":"000000280142d26678ec5ee733a8bd81325f2cff2a8e7b3beb714e999ffd2fa0","nextblockhash":"000000dce9599ed928a5bf2170629b790b9ebabf5592701bce8f3e783288c62f"},"error":null,"id":"curltest"}
```

## 源码剖析

getblock 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getblock(const UniValue& params, bool fHelp); // 获取区块信息
```

实现在“rpcblockchain.cpp”文件中。

```cpp
UniValue getblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 1.必须有 1 个参数（某区块的哈希），最多 2 个
        throw runtime_error( // 命令帮助反馈
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
        );

    LOCK(cs_main);

    std::string strHash = params[0].get_str(); // 2.把参数转换为字符串
    uint256 hash(uint256S(strHash)); // 包装成 uint256 对象

    bool fVerbose = true; // 3.详细标志，默认为 true
    if (params.size() > 1) // 若有第 2 个参数
        fVerbose = params[1].get_bool(); // 获取 verbose 的值（布尔型）

    if (mapBlockIndex.count(hash) == 0) // 4.检查指定哈希是否在区块索引映射中
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found");

    CBlock block; // 创建一个局部的区块对象
    CBlockIndex* pblockindex = mapBlockIndex[hash]; // 获取指定哈希对应的区块索引指针

    if (fHavePruned && !(pblockindex->nStatus & BLOCK_HAVE_DATA) && pblockindex->nTx > 0) // 5.区块文件未被修剪过 或 区块状态为在区块文件中为完整区块 或 区块索引中的交易号为 0
        throw JSONRPCError(RPC_INTERNAL_ERROR, "Block not available (pruned data)");

    if(!ReadBlockFromDisk(block, pblockindex, Params().GetConsensus())) // 6.从磁盘上的文件中读取区块信息
        throw JSONRPCError(RPC_INTERNAL_ERROR, "Can't read block from disk");

    if (!fVerbose) // 7.false
    {
        CDataStream ssBlock(SER_NETWORK, PROTOCOL_VERSION); // 序列化数据
        ssBlock << block; // 导入区块数据
        std::string strHex = HexStr(ssBlock.begin(), ssBlock.end()); // 16 进制化
        return strHex; // 返回
    }

    return blockToJSON(block, pblockindex); // 8.打包区块信息为 JSON 格式并返回
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 把首个参数转换为字符串，并包装为 uint256 对象。
3. 获取指定的详细标志（布尔型）。
4. 检查指定的哈希是否在区块索引映射中。
5. 检查区块数据状态。
6. 从磁盘上的区块文件中读取区块数据。
7. 若详细标志为 false，则序列化区块数据，转换为 16 进制并返回。
8. 否则把区块信息打包为 JSON 格式并返回。

第四步，对象 mapBlockIndex 在“main.h”文件中被引用。

```cpp
struct BlockHasher // 区块哈希的函数对象
{
    size_t operator()(const uint256& hash) const { return hash.GetCheapHash(); }
};
...
typedef boost::unordered_map<uint256, CBlockIndex*, BlockHasher> BlockMap;
extern BlockMap mapBlockIndex; // 区块索引映射 <区块哈希，区块索引指针，函数对象>
```

在“main.cpp”文件中定义，是一个 boost::unordered_map。
这里的 BlockHasher 是一个重载了函数调用运算符的函数对象，用于获取区块哈希的 uint256 对象引用。

```cpp
BlockMap mapBlockIndex; // 保存区块链上区块的索引
```

第五步，检查区块状态。变量 fHavePruned 在“main.h”文件中被引用，

```cpp
/** True if any block files have ever been pruned. */
extern bool fHavePruned; // 如果全部区块文件被修剪过则为 true
```

定义在“main.cpp”文件中，初始化为 false，表示默认不修剪，为完整区块。

```cpp
bool fHavePruned = false;
```

变量 pblockindex->nStatus 和 pblockindex->nTx 定义在“chain.h”文件的 CBlockIndex 类中。
BLOCK_HAVE_DATA 是一个枚举类型，这里的值为 8，表示在区块文件中是完整的区块。

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
 */ // 区块链是一个始于以创世区块为根的树状结构，每个区块可有多个候选作为下一个区块。一个区块索引可能有多个 pprev 指向它，但最多只能有一个能成为当前激活分支的一部分。
class CBlockIndex // 区块索引类
{
public:
    ...
    //! Number of transactions in this block.
    //! Note: in a potential headers-first mode, this number cannot be relied upon
    unsigned int nTx; // 该区块中的交易数
    ...
    //! Verification status of this block. See enum BlockStatus
    unsigned int nStatus; // 验证该区块的状态
    ...
};
```

第六步，调用 ReadBlockFromDisk(block, pblockindex, Params().GetConsensus()) 函数从磁盘上的文件中读取区块数据到局部对象 block。该函数声明在“main.h”文件中。

```cpp
bool ReadBlockFromDisk(CBlock& block, const CDiskBlockPos& pos, const Consensus::Params& consensusParams);
bool ReadBlockFromDisk(CBlock& block, const CBlockIndex* pindex, const Consensus::Params& consensusParams); // 转调上面重载的函数
```

实现在“main.cpp”文件中。

```cpp
bool ReadBlockFromDisk(CBlock& block, const CDiskBlockPos& pos, const Consensus::Params& consensusParams)
{
    block.SetNull();

    // Open history file to read // 打开并读历史文件
    CAutoFile filein(OpenBlockFile(pos, true), SER_DISK, CLIENT_VERSION);
    if (filein.IsNull()) // 检查读取状态
        return error("ReadBlockFromDisk: OpenBlockFile failed for %s", pos.ToString());

    // Read block
    try {
        filein >> block; // 导入区块数据
    }
    catch (const std::exception& e) {
        return error("%s: Deserialize or I/O error - %s at %s", __func__, e.what(), pos.ToString());
    }

    // Check the header // 检查区块头
    if (!CheckProofOfWork(block.GetHash(), block.nBits, consensusParams)) // 通过区块哈希，区块难度和共识参数检查工作量证明
        return error("ReadBlockFromDisk: Errors in block header at %s", pos.ToString());

    return true;
}

bool ReadBlockFromDisk(CBlock& block, const CBlockIndex* pindex, const Consensus::Params& consensusParams)
{
    if (!ReadBlockFromDisk(block, pindex->GetBlockPos(), consensusParams)) // 调用重载函数读取区块信息到 block 对象
        return false;
    if (block.GetHash() != pindex->GetBlockHash()) // 验证读取的区块哈希
        return error("ReadBlockFromDisk(CBlock&, CBlockIndex*): GetHash() doesn't match index for %s at %s",
                pindex->ToString(), pindex->GetBlockPos().ToString());
    return true;
}
```

把数据读到内存中的 block 对象后需验证该区块的哈希是否为指定区块的哈希。
调用 block.GetHash() 函数获取区块哈希，该函数声明在“block.h”文件的 CBlockHeader 类中。

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

实现在“block.cpp”文件中。

```cpp
uint256 CBlockHeader::GetHash() const
{
    return SerializeHash(*this);
}
```

这里调用 SerializeHash(*this) 这个模板函数进行区块的哈希。

第七、八步，取决于指定的 verbose，默认为 true，走第八步。
先来看第七步，若 verbose 指定为 false，则序列化区块数据，转换为 16 进制并返回。
类 CDataStream 定义在“streams.h”文件中，重载了输出运算符 <<。

```cpp
/** Double ended buffer combining vector and stream-like interfaces.
 *
 * >> and << read and write unformatted data using the above serialization templates.
 * Fills with data in linear time; some stringstream implementations take N^2 time.
 */ // 结合向量和流式接口的双端缓冲区。使用上述序列化模板 >> 和 << 来读写未格式化的数据。以线性时间填充数据；一些 stringstream 实现需要 N^2 的时间。
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
}；
```

调用模板函数 HexStr(ssBlock.begin(), ssBlock.end()) 把流化的数据转换为 16 进制。
该模板实现在“utilstrencodings.h”文件中。

```cpp
template<typename T>
std::string HexStr(const T itbegin, const T itend, bool fSpaces=false)
{
    std::string rv;
    static const char hexmap[16] = { '0', '1', '2', '3', '4', '5', '6', '7',
                                     '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };
    rv.reserve((itend-itbegin)*3); // 3 倍的原因：一个字节 8 位，对应 16 进制的 2 位，再加上中间的空格
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
还可以在每个 16 进制字符中间加入空格，这里使用了默认不加。

第八步，指定了 verbose 为 true 或未指定采用默认。
把获取到的区块数据调用 blockToJSON(block, pblockindex) 函数打包为 JSON 格式并返回。
该函数实现在“rpcblockchain.cpp”文件中。

```cpp
UniValue blockToJSON(const CBlock& block, const CBlockIndex* blockindex, bool txDetails = false)
{
    UniValue result(UniValue::VOBJ); // 创建对象类型的返回结果
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
    return result; // 返回结果
}
```

函数 chainActive.Contains(blockindex) 和 chainActive.Next(blockindex) 均声明在“chain.h”文件的 CChain 类中。

```cpp
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中用于区块索引的链
    ...
    /** Returns the index entry at a particular height in this chain, or NULL if no such height exists. */
    CBlockIndex *operator[](int nHeight) const { // 返回该链指定高度的索引条目，或若该高度不存在则为空
        if (nHeight < 0 || nHeight >= (int)vChain.size())
            return NULL;
        return vChain[nHeight];
    }
    ...
    /** Efficiently check whether a block is present in this chain. */
    bool Contains(const CBlockIndex *pindex) const { // 有效检测该链中是否存在某个块
        return (*this)[pindex->nHeight] == pindex;
    }
    
    /** Find the successor of a block in this chain, or NULL if the given index is not found or is the tip. */
    CBlockIndex *Next(const CBlockIndex *pindex) const { // 在该链找到某个区块的后继者，或若给定区块未找到或是链尖则为空
        if (Contains(pindex))
            return (*this)[pindex->nHeight + 1];
        else
            return NULL;
    }
    ...
};
```

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblock){:target="_blank"}
