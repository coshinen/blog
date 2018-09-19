---
layout: post
title:  "比特币源码剖析—区块"
date:   2018-06-21 21:02:10 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: 区块链 比特币 区块
---
## 概要
交易数据永久记录在区块中。
它们可以被当作城市记录器记录簿中的单个页面（记录房地产所有权的变更）或股票交易的分类账。
区块按时间组成一条线性序列（也称为区块链）。
矿工不断地处理新交易到新的区块，并将其添加到区块链末端。
随着区块被埋入区块链越来越深，它们变得越来越难以改变或移除，这就产生了比特币的不可逆交易。

## 源码剖析

区块头和区块的数据结构定义在“primitives/block.h”文件中，分别为 CBlockHeader 和 CBlock 类。
CBlock 是 CBlockHeader 的派生类，具体如下：

{% highlight C++ %}
/** Nodes collect new transactions into a block, hash them into a hash tree,
 * and scan through nonce values to make the block's hash satisfy proof-of-work
 * requirements.  When they solve the proof-of-work, they broadcast the block
 * to everyone and the block is added to the block chain.  The first transaction
 * in the block is a special one that creates a new coin owned by the creator
 * of the block.
 */ // 节点收集新交易到一个区块，把它们散列至哈希树中，并扫描 nonce 来满足所需的工作量证明要求。
class CBlockHeader // 区块头部分（包含区块版本、前一个区块的哈希、默尔克树根哈希、创建区块的时间、难度对应值和随机数）共 80 bytes
{
public:
    // header // Size: 80 Bytes
    int32_t nVersion; // 4 Bytes
    uint256 hashPrevBlock; // 32 Bytes
    uint256 hashMerkleRoot; // 32 Bytes
    uint32_t nTime; // 4 Bytes
    uint32_t nBits; // 4 Bytes
    uint32_t nNonce; // 4 Bytes, Number used once/Number once
    ...
};

class CBlock : public CBlockHeader
{
public:
    // network and disk
    std::vector<CTransaction> vtx; // 区块体部分（交易列表，至少有一笔创币交易）
    ...
};
{% endhighlight %}

类 CBlock 对象的内存布局（即一个区块的构成）如下：

{% highlight shell %}
+---+-------------------+ # 区块头，80bytes
|   | h | nVersion      |  # 区块版本号，4bytes
|   | e | hashPrevBlock |  # 前一个区块的哈希值，32bytes
|   | a | hashMerkleRoot|  # 默尔克树根哈希值，32bytes
| b | d | nTime         |  # 区块创建时间（从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位），4bytes
| l | e | nBits         |  # 难度对应值（与难度呈反比），4bytes
| o | r | nNonce        |  # 随机数，4bytes
| c +-------------------+ # 区块体，nbytes
| k | b | CTransaction  |  # 第一笔交易，coinbase 创币交易
|   | o |               |  # 第二笔，普通交易
|   | d | ...           |  # ...（普通交易）
|   | y |               |
+---+---+---------------+
{% endhighlight %}

区块头固定 80 个字节，共由 6 个数据成员构成：<br>
1.nVersion，区块的版本号，一般只有共识改变时，比如提升区块大小限制。
历史上提升过 2 次，从 250KB 到 750KB 再到 1000KB。
参照 [DEFAULT_BLOCK_MAX_SIZE](https://github.com/bitcoin/bitcoin/search?q=DEFAULT_BLOCK_MAX_SIZE&type=Issues)。<br>
2.nhashPrevBlock，前一个区块（头）的哈希值，类似于单链表的指针。<br>
3.nMerkleRoot，默尔克树根哈希值，用于校验交易数据的一致性。<br>
4.nTime，区块创建时间，Unix 时间戳，作为一个变量影响区块哈希的寻找。<br>
5.nBits，难度对应值，可通过此值推算出难度，从主网、测试网和回归测试网参数可以看出，此值越小难度越大。<br>
6.nNonce，随机数，通过不断的变化来寻找满足要求的区块（挖矿）。

完。
Thanks for your time.

## 参照
* [Block - Bitcoin Wiki](https://en.bitcoin.it/wiki/Block)
* [精通比特币（第二版）第九章 区块链 · 巴比特图书](http://book.8btc.com/books/6/masterbitcoin2cn/_book/ch09.html)
* [...](https://github.com/mistydew/blockchain)
