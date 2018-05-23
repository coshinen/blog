---
layout: post
title:  "比特币 RPC 命令剖析 \"getbestblockhash\""
date:   2018-05-22 10:02:28 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 用法示例
获取当前最佳块（即最新上链的一个区块，或称链尖区块）的哈希。

{% highlight shell %}
$ bitcoin-cli getbestblockhash
0000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
{% endhighlight %}

## 源码剖析
`getbestblockhash` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getbestblockhash(const UniValue& params, bool fHelp); // 获取当前最佳块的哈希
{% endhighlight %}

实现在“rpcserver.cpp”文件中。

{% highlight C++ %}
UniValue getbestblockhash(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 该命令没有参数
        throw runtime_error( // 命令帮助反馈
            "getbestblockhash\n"
            "\nReturns the hash of the best (tip) block in the longest block chain.\n"
            "\nResult\n"
            "\"hex\"      (string) the block hash hex encoded\n"
            "\nExamples\n"
            + HelpExampleCli("getbestblockhash", "")
            + HelpExampleRpc("getbestblockhash", "")
        );

    LOCK(cs_main);
    return chainActive.Tip()->GetBlockHash().GetHex(); // 返回激活链尖区块哈希的 16 进制
}
{% endhighlight %}

对象 chainActive 的引用在“main.h”文件中。

{% highlight C++ %}
/** The currently-connected chain of blocks (protected by cs_main). */
extern CChain chainActive; // 当前连接的区块链（激活的链）
{% endhighlight %}

定义在“main.h”文件中。

{% highlight C++ %}
CChain chainActive; // 当前连接的区块链（激活的链）
{% endhighlight %}

类 CChain 定义在“chain.h”文件中。

{% highlight C++ %}
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中用于区块索引的链
private:
    std::vector<CBlockIndex*> vChain; // 内存中区块的索引列表

public:
    ...
    /** Returns the index entry for the tip of this chain, or NULL if none. */
    CBlockIndex *Tip() const { // 返回该链尖的索引条目，或如果没有则为空
        return vChain.size() > 0 ? vChain[vChain.size() - 1] : NULL; // 至少返回创世区块的索引
    }
    ...
};
{% endhighlight %}

类 CBlockIndex 也定义在“chain.h”文件中。

{% highlight C++ %}
/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */ // 区块链是一个始于以创世区块为根的树状结构，每个区块可有多个候选作为下一个区块。一个区块索引可能有多个 pprev 指向它，但最多只能有一个能成为当前激活分支的一部分。
class CBlockIndex // 区块索引
{
public:
    //! pointer to the hash of the block, if any. Memory is owned by this CBlockIndex
    const uint256* phashBlock; // 指向区块的哈希。内存属于该区块索引
    ...
    uint256 GetBlockHash() const // 获取区块哈希
    {
        return *phashBlock;
    }
    ...
};
{% endhighlight %}

最后把得到区块哈希调用 GetHex() 函数转换为 16 进制返回给客户端。

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getbestblockhash)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
