---
layout: post
title:  "比特币 RPC 命令剖析 \"getchaintips\""
date:   2018-05-22 17:30:08 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getchaintips
---
## 提示说明

{% highlight shell %}
getchaintips # 获取关于区块树上全部已知的尖部的信息，包括主链和孤儿分支
{% endhighlight %}

结果：<br>
{% highlight shell %}
[
  {
    "height": xxxx,         （数字）链尖高度
    "hash": "xxxx",         （字符串）链尖区块哈希
    "branchlen": 0          （数字）主链为 0
    "status": "active"      （字符串）主链为 "active"
  },
  {
    "height": xxxx,
    "hash": "xxxx",
    "branchlen": 1          （数字）连接链尖到主链的分叉长度
    "status": "xxxx"        （字符串）链状态 (active, valid-fork, valid-headers, headers-only, invalid)
  }
]
{% endhighlight %}

可能的状态取值：<br>
1. invalid 该分支包含至少一块无效区块。<br>
2. headers-only 该分支上并非所有区块都有效，但区块头都有效。<br>
3. valid-headers 该分支上所有区块都有效，但它们没有完全验证。<br>
4. valid-fork 该分支不是激活区块链的一部分，但已完全验证。<br>
5. active 这是激活主链的尖部，确定有效。

## 用法示例

### 比特币核心客户端

获取当前区块链尖部信息。

{% highlight shell %}
$ bitcoin-cli getchaintips
[
  {
    "height": 23940,
    "hash": "0000023628d2d9d302f82e672381f40da80abe735cd24aa7784e5ac327f22446",
    "branchlen": 0,
    "status": "active"
  }
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getchaintips", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[{"height":25160,"hash":"0000008475f1530ec67b79ea60e6c1808b55189ed6e7a78d89487b4191cca2ac","branchlen":0,"status":"active"}],"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getchaintips 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getchaintips(const UniValue& params, bool fHelp); // 获取链尖信息
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue getchaintips(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "getchaintips\n"
            "Return information about all known tips in the block tree,"
            " including the main chain as well as orphaned branches.\n"
            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"height\": xxxx,         (numeric) height of the chain tip\n"
            "    \"hash\": \"xxxx\",         (string) block hash of the tip\n"
            "    \"branchlen\": 0          (numeric) zero for main chain\n"
            "    \"status\": \"active\"      (string) \"active\" for the main chain\n"
            "  },\n"
            "  {\n"
            "    \"height\": xxxx,\n"
            "    \"hash\": \"xxxx\",\n"
            "    \"branchlen\": 1          (numeric) length of branch connecting the tip to the main chain\n"
            "    \"status\": \"xxxx\"        (string) status of the chain (active, valid-fork, valid-headers, headers-only, invalid)\n"
            "  }\n"
            "]\n"
            "Possible values for status:\n"
            "1.  \"invalid\"               This branch contains at least one invalid block\n"
            "2.  \"headers-only\"          Not all blocks for this branch are available, but the headers are valid\n"
            "3.  \"valid-headers\"         All blocks are available for this branch, but they were never fully validated\n"
            "4.  \"valid-fork\"            This branch is not part of the active chain, but is fully validated\n"
            "5.  \"active\"                This is the tip of the active main chain, which is certainly valid\n"
            "\nExamples:\n"
            + HelpExampleCli("getchaintips", "")
            + HelpExampleRpc("getchaintips", "")
        );

    LOCK(cs_main); // 上锁

    /* Build up a list of chain tips.  We start with the list of all // 构建链尖列表。
       known blocks, and successively remove blocks that appear as pprev
       of another block.  */ // 我们从已知块的列表开始，并连续移除另一个区块的 pprev 区块，以获取链尖区块索引。
    std::set<const CBlockIndex*, CompareBlocksByHeight> setTips; // 链尖区块索引集合
    BOOST_FOREACH(const PAIRTYPE(const uint256, CBlockIndex*)& item, mapBlockIndex) // 遍历区块索引映射
        setTips.insert(item.second); // 插入链尖索引集合
    BOOST_FOREACH(const PAIRTYPE(const uint256, CBlockIndex*)& item, mapBlockIndex) // 遍历区块索引映射
    {
        const CBlockIndex* pprev = item.second->pprev;
        if (pprev)
            setTips.erase(pprev); // 移除区块的前一个区块
    }

    // Always report the currently active tip. // 总是报告当前激活的链尖
    setTips.insert(chainActive.Tip()); // 插入当前激活链尖区块索引

    /* Construct the output array.  */ // 构建输出数组
    UniValue res(UniValue::VARR); // 创建数组类型的结果对象
    BOOST_FOREACH(const CBlockIndex* block, setTips) // 遍历链尖区块索引集合
    {
        UniValue obj(UniValue::VOBJ);
        obj.push_back(Pair("height", block->nHeight)); // 链高度（区块索引）
        obj.push_back(Pair("hash", block->phashBlock->GetHex())); // 区块哈希

        const int branchLen = block->nHeight - chainActive.FindFork(block)->nHeight; // 计算分支长度
        obj.push_back(Pair("branchlen", branchLen));

        string status; // 链状态
        if (chainActive.Contains(block)) { // 检查当前激活链上是否存在该区块
            // This block is part of the currently active chain. // 该区块是当前激活链的一部分
            status = "active"; // 状态标记为激活
        } else if (block->nStatus & BLOCK_FAILED_MASK) { // 该块或其祖先之一的区块无效
            // This block or one of its ancestors is invalid.
            status = "invalid"; // 状态标记为无效
        } else if (block->nChainTx == 0) { // 该块无法连接，因为该块或其父块之一的完整区块数据丢失
            // This block cannot be connected because full block data for it or one of its parents is missing.
            status = "headers-only"; // 状态表记为仅区块头
        } else if (block->IsValid(BLOCK_VALID_SCRIPTS)) { // 该区块已完全验证，但不再是激活链的一部分
            // This block is fully validated, but no longer part of the active chain. It was probably the active block once, but was reorganized. // 可能曾是激活的区块，但被重组
            status = "valid-fork"; // 状态标记为验证分叉
        } else if (block->IsValid(BLOCK_VALID_TREE)) { // 该区块头有效，但它没有被验证。
            // The headers for this block are valid, but it has not been validated. It was probably never part of the most-work chain. // 可能从来不是有效链的一部分。
            status = "valid-headers"; // 状态标记为验证头部
        } else {
            // No clue.
            status = "unknown";
        }
        obj.push_back(Pair("status", status));

        res.push_back(obj);
    }

    return res; // 返回结果数组
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.创建链尖区块索引集合，遍历区块索引映射，把所有区块索引加入该集合。<br>
4.遍历区块索引映射，把所有区块的前一个区块索引从该集合中擦除。<br>
5.把当前激活链的链尖区块索引插入该集合。<br>
6.遍历链尖区块索引集合，获取相应信息并加入输出数组。<br>
7.返回该数组对象。

第三步，创建链尖区块索引集合对象 setTips 使用了函数对象比较器 CompareBlocksByHeight。<br>
该函数对象定义在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
/** Comparison function for sorting the getchaintips heads.  */ // 用于 getchaintips 函数排序区块头的比较器
struct CompareBlocksByHeight // 函数对象，通过高度比较区块
{
    bool operator()(const CBlockIndex* a, const CBlockIndex* b) const
    {
        /* Make sure that unequal blocks with the same height do not compare // 确保相同高度不同的块比较后不等
           equal. Use the pointers themselves to make a distinction. */ // 使用指针区分。

        if (a->nHeight != b->nHeight)
          return (a->nHeight > b->nHeight);

        return a < b;
    }
};
{% endhighlight %}

第六步，计算分支长度使，调用 chainActive.FindFork(block) 函数得到分支交点区块索引。<br>
该函数声明在“chain.h”文件的 CChain 类中。

{% highlight C++ %}
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中用于区块索引的链
private:
    ...
    /** Find the last common block between this chain and a block index entry. */
    const CBlockIndex *FindFork(const CBlockIndex *pindex) const; // 在该链和一个区块索引条目间找最近的一个公共区块
};
{% endhighlight %}

实现在“chain.cpp”文件中。

{% highlight C++ %}
const CBlockIndex *CChain::FindFork(const CBlockIndex *pindex) const {
    if (pindex == NULL) {
        return NULL;
    }
    if (pindex->nHeight > Height()) // 若指定区块高度大于当前激活链高度
        pindex = pindex->GetAncestor(Height()); // 获取其祖先区块索引
    while (pindex && !Contains(pindex)) // 当该区块包含在激活链上时，找到该分支的交点
        pindex = pindex->pprev;
    return pindex;
}
{% endhighlight %}

当指定区块的高度大于当前链高度时，调用 pindex->GetAncestor(Height()) 函数获取祖先区块的索引。
该函数声明在“chain.h”文件的 CBlockIndex 类中。

{% highlight C++ %}
/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */ // 区块链是一个始于以创世区块为根的树状结构，每个区块可有多个候选作为下一个区块。一个区块索引可能有多个 pprev 指向它，但最多只能有一个能成为当前激活分支的一部分。
class CBlockIndex // 区块索引类
{
    ...
    //! Efficiently find an ancestor of this block.
    CBlockIndex* GetAncestor(int height); // 有效找到该块的祖先
    const CBlockIndex* GetAncestor(int height) const;
};
{% endhighlight %}

实现在“chain.cpp”文件中。

{% highlight C++ %}
/** Turn the lowest '1' bit in the binary representation of a number into a '0'. */
int static inline InvertLowestOne(int n) { return n & (n - 1); } // 把一个数二进制最低位的 '1' 转换为 '0'

/** Compute what height to jump back to with the CBlockIndex::pskip pointer. */
int static inline GetSkipHeight(int height) {
    if (height < 2)
        return 0;

    // Determine which height to jump back to. Any number strictly lower than height is acceptable, // 确定要跳回的高度。任何严格低于高度的数均可接受，
    // but the following expression seems to perform well in simulations (max 110 steps to go back // 但下面的表达式似乎在模拟中表现得很好。（最大 110 步返回到 2**18 块）
    // up to 2**18 blocks).
    return (height & 1) ? InvertLowestOne(InvertLowestOne(height - 1)) + 1 : InvertLowestOne(height); // height 奇前偶后
}

CBlockIndex* CBlockIndex::GetAncestor(int height) // 当前激活链高度
{
    if (height > nHeight || height < 0) // 高度验证
        return NULL;

    CBlockIndex* pindexWalk = this;
    int heightWalk = nHeight; // 指定区块的高度
    while (heightWalk > height) { // 当指定区块的高度大于当前激活链高度
        int heightSkip = GetSkipHeight(heightWalk); // 获取要跳回的高度
        int heightSkipPrev = GetSkipHeight(heightWalk - 1); // 获取要跳回的前一个高度
        if (pindexWalk->pskip != NULL &&
            (heightSkip == height ||
             (heightSkip > height && !(heightSkipPrev < heightSkip - 2 &&
                                       heightSkipPrev >= height)))) {
            // Only follow pskip if pprev->pskip isn't better than pskip->pprev.
            pindexWalk = pindexWalk->pskip;
            heightWalk = heightSkip;
        } else {
            pindexWalk = pindexWalk->pprev;
            heightWalk--; // 高度减 1
        }
    }
    return pindexWalk;
}

const CBlockIndex* CBlockIndex::GetAncestor(int height) const
{
    return const_cast<CBlockIndex*>(this)->GetAncestor(height); // 转调重载的获取区块祖先函数
}
{% endhighlight %}

未完成。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getchaintips)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
