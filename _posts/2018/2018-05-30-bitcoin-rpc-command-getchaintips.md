---
layout: post
title:  "比特币 RPC 命令剖析 \"getchaintips\""
date:   2018-05-30 21:30:08 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getchaintips
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getchaintips
getchaintips

返回有关区块树上所有已知尖端的信息，包括主链和孤儿分支。

结果：
[
  {
    "height": xxxx,   （数字）链尖的高度
    "hash": "xxxx",   （字符串）链尖区块的哈希
    "branchlen": 0    （数字）主链为 0
    "status": "active"（字符串）主链为 "active"
  },
  {
    "height": xxxx,
    "hash": "xxxx",
    "branchlen": 1    （数字）连接尖端到主链的分支长度
    "status": "xxxx"  （字符串）链的状态 (active, valid-fork, valid-headers, headers-only, invalid)
  }
]

状态的可能取值：
1. "invalid"          该分支至少包含一块无效区块
2. "headers-only"     该分支并非所有区块都有效，但区块头都有效
3. "valid-headers"    该分支所有区块都有效，但它们没有完全验证
4. "valid-fork"       该分支不是活跃链的一部分，但已完全验证
5. "active"           这是活跃主链的尖端，确定有效

例子：
> bitcoin-cli getchaintips
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getchaintips", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getchaintips` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getchaintips(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getchaintips(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);

    /* Build up a list of chain tips.  We start with the list of all
       known blocks, and successively remove blocks that appear as pprev
       of another block.  */
    std::set<const CBlockIndex*, CompareBlocksByHeight> setTips; // 2. 构建一个链尖列表。
    BOOST_FOREACH(const PAIRTYPE(const uint256, CBlockIndex*)& item, mapBlockIndex)
        setTips.insert(item.second);
    BOOST_FOREACH(const PAIRTYPE(const uint256, CBlockIndex*)& item, mapBlockIndex)
    { // 我们从所有已知区块的列表开始，依次移除作为另一个区块的 pprev 区块。
        const CBlockIndex* pprev = item.second->pprev;
        if (pprev)
            setTips.erase(pprev);
    }

    // Always report the currently active tip.
    setTips.insert(chainActive.Tip()); // 3. 始终报告当前活跃的链尖。

    /* Construct the output array.  */
    UniValue res(UniValue::VARR); // 4. 构建输出数组。
    BOOST_FOREACH(const CBlockIndex* block, setTips)
    { // 遍历链尖索引列表
        UniValue obj(UniValue::VOBJ);
        obj.push_back(Pair("height", block->nHeight));
        obj.push_back(Pair("hash", block->phashBlock->GetHex()));

        const int branchLen = block->nHeight - chainActive.FindFork(block)->nHeight; // 计算分支长度
        obj.push_back(Pair("branchlen", branchLen));

        string status;
        if (chainActive.Contains(block)) {
            // This block is part of the currently active chain.
            status = "active"; // 这个区块是当前活跃链的一部分。
        } else if (block->nStatus & BLOCK_FAILED_MASK) {
            // This block or one of its ancestors is invalid.
            status = "invalid"; // 这个区块或其祖先之一是无效的。
        } else if (block->nChainTx == 0) {
            // This block cannot be connected because full block data for it or one of its parents is missing.
            status = "headers-only"; // 无法连接这个区块，因为缺少该区块或其父块之一的完整区块数据。
        } else if (block->IsValid(BLOCK_VALID_SCRIPTS)) {
            // This block is fully validated, but no longer part of the active chain. It was probably the active block once, but was reorganized.
            status = "valid-fork"; // 这个区块已经完全验证，但不再是活跃链的一部分了。它可能曾经是活跃的区块，但已经被重新组织。
        } else if (block->IsValid(BLOCK_VALID_TREE)) {
            // The headers for this block are valid, but it has not been validated. It was probably never part of the most-work chain.
            status = "valid-headers"; // 这个区块头有效的，但它尚未被验证。这可能从来不是大部分工作链的一部分。
        } else {
            // No clue.
            status = "unknown"; // 没有线索。
        }
        obj.push_back(Pair("status", status));

        res.push_back(obj);
    }

    return res;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 构建一个链尖列表

函数对象比较器 `CompareBlocksByHeight` 定义在文件 `rpcblockchain.cpp` 中。

```cpp
/** Comparison function for sorting the getchaintips heads.  */
struct CompareBlocksByHeight // 用于排序函数 getchaintips 区块头的比较函数。
{
    bool operator()(const CBlockIndex* a, const CBlockIndex* b) const
    {
        /* Make sure that unequal blocks with the same height do not compare
           equal. Use the pointers themselves to make a distinction. */

        if (a->nHeight != b->nHeight)
          return (a->nHeight > b->nHeight);

        return a < b;
    }
};
```

确保高度相同的不同区块比较起来不想等。
使用指针自身来做区分。

### 2.3. 始终报告当前活跃的链尖

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.2. 返回活跃的链尖区块哈希](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#22-返回活跃的链尖区块哈希)。

### 2.4. 构建输出数组并返回

计算分支长度，寻找分叉函数 `chainActive.FindFork(block)` 声明在文件 `chain.h` 的链类 `CChain` 中。

```cpp
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中已索引的区块链。
private:
    ...
    /** Find the last common block between this chain and a block index entry. */
    const CBlockIndex *FindFork(const CBlockIndex *pindex) const; // 查找该链和一个区块索引项之间的最后一个公共区块。
};
```

实现在文件 `chain.cpp` 中。

```cpp
const CBlockIndex *CChain::FindFork(const CBlockIndex *pindex) const {
    if (pindex == NULL) {
        return NULL;
    }
    if (pindex->nHeight > Height()) // 若指定区块高度大于当前活跃的链高度
        pindex = pindex->GetAncestor(Height()); // 获取活跃的链上祖先区块索引
    while (pindex && !Contains(pindex)) // 向前查找该分支的交点
        pindex = pindex->pprev;
    return pindex;
}
```

获取祖先函数 `pindex->GetAncestor(Height())` 声明在文件 `chain.h` 的区块索引类 `CBlockIndex` 中。

```cpp
/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */
class CBlockIndex
{
    ...
    //! Efficiently find an ancestor of this block.
    CBlockIndex* GetAncestor(int height); //! 有效地找到这个区块的祖先。
    const CBlockIndex* GetAncestor(int height) const;
};
```

实现在文件 `chain.cpp` 中。

```cpp
/** Turn the lowest '1' bit in the binary representation of a number into a '0'. */
int static inline InvertLowestOne(int n) { return n & (n - 1); } // 把一个数的二进制表示中的最低位的 '1' 转换为 '0'。

/** Compute what height to jump back to with the CBlockIndex::pskip pointer. */
int static inline GetSkipHeight(int height) { // 使用 CBlockIndex::pskip 指针计算跳回的高度。
    if (height < 2)
        return 0;

    // Determine which height to jump back to. Any number strictly lower than height is acceptable,
    // but the following expression seems to perform well in simulations (max 110 steps to go back
    // up to 2**18 blocks). // 确定跳回的高度。任何严格低于高度均可接受，但下面的表达式似乎在模拟中表现得很好（最多 110 步回到 2**18 个区块）。
    return (height & 1) ? InvertLowestOne(InvertLowestOne(height - 1)) + 1 : InvertLowestOne(height); // height 奇前偶后
}

CBlockIndex* CBlockIndex::GetAncestor(int height)
{
    if (height > nHeight || height < 0)
        return NULL;

    CBlockIndex* pindexWalk = this;
    int heightWalk = nHeight;
    while (heightWalk > height) {
        int heightSkip = GetSkipHeight(heightWalk);
        int heightSkipPrev = GetSkipHeight(heightWalk - 1);
        if (pindexWalk->pskip != NULL &&
            (heightSkip == height ||
             (heightSkip > height && !(heightSkipPrev < heightSkip - 2 &&
                                       heightSkipPrev >= height)))) {
            // Only follow pskip if pprev->pskip isn't better than pskip->pprev.
            pindexWalk = pindexWalk->pskip; // 只有当 pprev->pskip 不优于 pskip->pprev 时才遵循 pskip。
            heightWalk = heightSkip;
        } else {
            pindexWalk = pindexWalk->pprev;
            heightWalk--;
        }
    }
    return pindexWalk;
}

const CBlockIndex* CBlockIndex::GetAncestor(int height) const
{
    return const_cast<CBlockIndex*>(this)->GetAncestor(height); // 转调上面的重载函数
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/chain.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.h){:target="_blank"}
* [bitcoin/chain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.cpp){:target="_blank"}
