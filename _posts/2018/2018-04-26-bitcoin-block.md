---
layout: post
title:  "比特币区块构造"
date:   2018-04-26 21:02:10 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin Block
---
交易数据永久记录在区块中，区块可以被当作账本中的单页。
区块按时间组成一条线性序列，又称为区块链。
矿工不断处理新的交易到新的区块，并将其添加到区块链的末端。
随着区块被埋入区块链越深，它们就变得越难以改变或移除，这就产生了比特币的不可逆交易。

## 源码剖析

区块头类 `CBlockHeader` 和其派生区块类 `CBlock` 都定义在源文件 `primitives/block.h` 中，具体如下。

```cpp
/** Nodes collect new transactions into a block, hash them into a hash tree,
 * and scan through nonce values to make the block's hash satisfy proof-of-work
 * requirements.  When they solve the proof-of-work, they broadcast the block
 * to everyone and the block is added to the block chain.  The first transaction
 * in the block is a special one that creates a new coin owned by the creator
 * of the block.
 */
class CBlockHeader
{
public:
    // header
    int32_t nVersion;
    uint256 hashPrevBlock;
    uint256 hashMerkleRoot;
    uint32_t nTime;
    uint32_t nBits;
    uint32_t nNonce;
    ...
};

class CBlock : public CBlockHeader
{
public:
    // network and disk
    std::vector<CTransaction> vtx;
    ...
};
```

节点把新交易收集到一个区块里，把它们散列至哈希树中，并扫描随机数值使区块哈希满足工作量证明要求。
当它们解决了工作量证明，它们将广播该区块到每个节点并把区块添加到区块链上。
区块里的首笔交易是特殊的（即创币交易 `coinbase`），它会创建一个属于该区块创建者的新币。
这个过程就是挖矿。

区块头共 80 个字节，由 6 个数据成员构成：
1. 版本号 `nVersion`，4 个字节 ，隨共识改变。
比如，当前区块大小提升过 2 次，从 250KB 到 750KB 再到 1000KB。
2. 前一个区块头的哈希 `nhashPrevBlock`，32 个字节，类似于单链表中节点的指针域。
3. 默克尔树根哈希 `nMerkleRoot`，32 个字节，用于校验交易数据，保证其一致性。
4. 创建时间 `nTime`，4 个字节，UNIX 时间戳，作为寻找区块的一个变量。
5. 难度对应值 `nBits`，4 个字节，从主网、测试网和回归测试网中的默认值可以看出，该值与难度呈反比。
6. 随机数 `nNonce`，4 个字节，通过递增来寻找满足要求的区块。
Nonce (Number used once / Number once)，在密码学中是一个只被使用一次的非重复随机数值。

区块体 `vtx` 由首笔创币交易和其余的 n 笔普通交易组成。

比特币区块类图：

![bitcoin-block](https://www.plantuml.com/plantuml/svg/NOxDIiHG34Rtzocobu4o_YpA8EFCHXUAwE1MucsWeRU996aLVzxTqfbDtPvp4hwj1reCVKcUiH1SL1LyS1Djyexb7Grxo0NTRoACtuQWkwpop5y4LKhxNT7StH8sPB3vMQtWI5AQRs3XlnESoGkPimhKCB34-Ver9jgYjuz6uroVrFhowcJkoRf2JwgnK7BWdfP_PCVX_z23IfupuIFxNOwRPutnEIKUJLsFb4DjipyOYcCELhcURhOapT2NFm00)

## 参考链接

* [Block - Bitcoin Wiki](https://en.bitcoin.it/wiki/Block){:target="_blank"}
* [DEFAULT_BLOCK_MAX_SIZE](https://github.com/bitcoin/bitcoin/search?q=DEFAULT_BLOCK_MAX_SIZE&type=Issues){:target="_blank"}
* [bitcoin/block.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/primitives/block.h){:target="_blank"}
