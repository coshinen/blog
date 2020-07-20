---
layout: post
title:  "比特币源码剖析—区块"
date:   2018-04-26 21:02:10 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin Block
---
交易数据永久记录在区块中。
它们可以被当作城市记录器记录簿中的单个页面（记录房地产所有权的变更）或股票交易的分类账。
区块按时间组成一条线性序列（也称为区块链）。
矿工不断地处理新交易到新的区块，并将其添加到区块链末端。
随着区块被埋入区块链越来越深，它们变得越来越难以改变或移除，这就产生了比特币的不可逆交易。

## 源码剖析

区块头和区块的数据结构定义在“primitives/block.h”文件中，分别为类 CBlockHeader 和 CBlock，CBlock 是 CBlockHeader 的派生类，如下：

```cpp
/** Nodes collect new transactions into a block, hash them into a hash tree,
 * and scan through nonce values to make the block's hash satisfy proof-of-work
 * requirements.  When they solve the proof-of-work, they broadcast the block
 * to everyone and the block is added to the block chain.  The first transaction
 * in the block is a special one that creates a new coin owned by the creator
 * of the block.
 */ // 节点收集新交易到一个区块，把它们散列至哈希树中，并扫描 nonce 来满足所需的工作量证明要求。
class CBlockHeader // 区块头部分（包含区块版本、前一个区块的哈希、默尔克树根哈希、创建区块的时间、难度对应值和随机数）
{
public:
    // header // 区块头（80 Bytes）
    int32_t nVersion; // 区块版本号（4 Bytes）
    uint256 hashPrevBlock; // 前一个区块的哈希值（32 Bytes）
    uint256 hashMerkleRoot; // 默克尔树根哈希值（32 Bytes）
    uint32_t nTime; // 区块创建时间（4 Bytes）
    uint32_t nBits; // 难度对应值，与难度呈反比（4 Bytes）
    uint32_t nNonce; // 随机数（4 Bytes, Number used once/Number once）
    ...
};

class CBlock : public CBlockHeader
{
public:
    // network and disk
    std::vector<CTransaction> vtx; // 区块体部分（交易列表，至少有一笔交易，即第一笔创币交易 coinbase）
    ...
};
```

区块头固定 80 个字节，共由 6 个数据成员构成：
1. 区块的版本号（nVersion），一般隨共识改变，比如目前历史上提升过 2 次区块大小，从 250KB 到 750KB 再到 1000KB。
2. 前一个区块头的哈希值（nhashPrevBlock），类似于单链表的指针。
3. 默克尔树根哈希值（nMerkleRoot），用于校验交易数据的一致性。
4. 区块创建时间（nTime），UNIX 时间戳，作为一个影响区块寻找的变量。
5. 难度对应值（nBits），可通过此值推算出网络挖矿难度，从主网、测试网和回归测试网参数可以看出，此值越小难度越大。
6. 随机数（nNonce），通过不断的变化来寻找满足要求的区块（挖矿）。

## 参考链接

* [Block - Bitcoin Wiki](https://en.bitcoin.it/wiki/Block){:target="_blank"}
* [DEFAULT_BLOCK_MAX_SIZE](https://github.com/bitcoin/bitcoin/search?q=DEFAULT_BLOCK_MAX_SIZE&type=Issues){:target="_blank"}
* [bitcoin/block.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/primitives/block.h){:target="_blank"}
