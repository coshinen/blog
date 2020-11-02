---
layout: post
title:  "比特币 RPC 命令剖析 \"invalidateblock\""
date:   2018-10-01 19:25:28 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli invalidateblock "hash"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help invalidateblock
invalidateblock "hash"

永久标记一个区块无效，就像其违反了共识规则。

参数：
1. hash（字符串，必备）待标记为无效的区块哈希

结果：

例子：
> bitcoin-cli invalidateblock "blockhash"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "invalidateblock", "params": ["blockhash"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`invalidateblock` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue invalidateblock(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue invalidateblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "invalidateblock \"hash\"\n"
            "\nPermanently marks a block as invalid, as if it violated a consensus rule.\n"
            "\nArguments:\n"
            "1. hash   (string, required) the hash of the block to mark as invalid\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("invalidateblock", "\"blockhash\"")
            + HelpExampleRpc("invalidateblock", "\"blockhash\"")
        ); // 1. 帮助内容

    std::string strHash = params[0].get_str();
    uint256 hash(uint256S(strHash));
    CValidationState state;

    { // 2. 检查指定区块是否存在
        LOCK(cs_main);
        if (mapBlockIndex.count(hash) == 0) // 若不存在
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found"); // 抛出区块未找到的错误信息

        CBlockIndex* pblockindex = mapBlockIndex[hash]; // 若存在
        InvalidateBlock(state, Params().GetConsensus(), pblockindex); // 使该区块无效化
    }

    if (state.IsValid()) { // 3. 验证链状态是否有效
        ActivateBestChain(state, Params()); // 激活最佳链
    }

    if (!state.IsValid()) { // 再次验证链状态
        throw JSONRPCError(RPC_DATABASE_ERROR, state.GetRejectReason());
    }

    return NullUniValue;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 检查指定区块是否存在

无效化区块函数 `InvalidateBlock(state, Params().GetConsensus(), pblockindex)` 声明在文件 `main.h` 中。

```cpp
/** Mark a block as invalid. */
bool InvalidateBlock(CValidationState& state, const Consensus::Params& consensusParams, CBlockIndex *pindex); // 标记一个区块为无效。
```

实现在文件 `main.cpp` 中。

```cpp
/** Disconnect chainActive's tip. You probably want to call mempool.removeForReorg and manually re-limit mempool size after this, with cs_main held. */
bool static DisconnectTip(CValidationState& state, const Consensus::Params& consensusParams)
{ // 断开激活的链尖。你可能想要调用 mempool.removeForReorg 并在该操作后手动再次限制内存池大小，同时持有主锁。
    CBlockIndex *pindexDelete = chainActive.Tip(); // 获取链尖区块索引
    assert(pindexDelete);
    // Read block from disk. // 从磁盘读区块
    CBlock block;
    if (!ReadBlockFromDisk(block, pindexDelete, consensusParams)) // 根据区块索引从磁盘读取区块到内存 block
        return AbortNode(state, "Failed to read block");
    // Apply the block atomically to the chain state. // 原子方式应用区块到链状态
    int64_t nStart = GetTimeMicros(); // 获取当前时间
    {
        CCoinsViewCache view(pcoinsTip);
        if (!DisconnectBlock(block, state, pindexDelete, view)) // 断开区块
            return error("DisconnectTip(): DisconnectBlock %s failed", pindexDelete->GetBlockHash().ToString());
        assert(view.Flush());
    }
    LogPrint("bench", "- Disconnect block: %.2fms\n", (GetTimeMicros() - nStart) * 0.001);
    // Write the chain state to disk, if necessary. // 如果需要，把链状态写到磁盘
    if (!FlushStateToDisk(state, FLUSH_STATE_IF_NEEDED)) // 刷新链状态到磁盘
        return false;
    // Resurrect mempool transactions from the disconnected block. // 从断开链接的区块恢复交易到内存池
    std::vector<uint256> vHashUpdate; // 待升级的交易哈希列表
    BOOST_FOREACH(const CTransaction &tx, block.vtx) { // 遍历断开区块的交易列表
        // ignore validation errors in resurrected transactions // 在恢复的交易中沪铝验证错误
        list<CTransaction> removed;
        CValidationState stateDummy;
        if (tx.IsCoinBase() || !AcceptToMemoryPool(mempool, stateDummy, tx, false, NULL, true)) { // 若该交易为创币交易，则接受到内存池后
            mempool.remove(tx, removed, true); // 从内存池中移除该交易
        } else if (mempool.exists(tx.GetHash())) { // 否则若内存池中存在该交易
            vHashUpdate.push_back(tx.GetHash()); // 加入到待升级的交易列表
        }
    }
    // AcceptToMemoryPool/addUnchecked all assume that new mempool entries have
    // no in-mempool children, which is generally not true when adding
    // previously-confirmed transactions back to the mempool.
    // UpdateTransactionsFromBlock finds descendants of any transactions in this
    // block that were added back and cleans up the mempool state.
    mempool.UpdateTransactionsFromBlock(vHashUpdate); // 内存池更新来自区块的交易
    // Update chainActive and related variables. // 更新激活链和相关变量
    UpdateTip(pindexDelete->pprev); // 更新链尖为已删除链尖的前一个区块
    // Let wallets know transactions went from 1-confirmed to
    // 0-confirmed or conflicted:
    BOOST_FOREACH(const CTransaction &tx, block.vtx) { // 遍历已删除区块的交易列表
        SyncWithWallets(tx, NULL); // 同步到钱包
    }
    return true;
}
...
bool InvalidateBlock(CValidationState& state, const Consensus::Params& consensusParams, CBlockIndex *pindex)
{
    AssertLockHeld(cs_main); // 保持上锁状态

    // Mark the block itself as invalid. // 标记区块自身状态为无效
    pindex->nStatus |= BLOCK_FAILED_VALID; // 设置无效状态
    setDirtyBlockIndex.insert(pindex); // 加入无效区块索引集合
    setBlockIndexCandidates.erase(pindex); // 从区块索引候选集中擦除该索引

    while (chainActive.Contains(pindex)) { // 当激活的链中包含该区块索引
        CBlockIndex *pindexWalk = chainActive.Tip(); // 获取激活的链尖区块索引
        pindexWalk->nStatus |= BLOCK_FAILED_CHILD; // 设置该区块状态为无效区块后代
        setDirtyBlockIndex.insert(pindexWalk); // 加入无效区块索引集合
        setBlockIndexCandidates.erase(pindexWalk); // 从区块索引候选集中擦除该索引
        // ActivateBestChain considers blocks already in chainActive // ActivateBestChain 认为已经在激活链上的区块
        // unconditionally valid already, so force disconnect away from it. // 已经无条件有效，强制断开它于链的链接
        if (!DisconnectTip(state, consensusParams)) { // 断开链尖链接
            mempool.removeForReorg(pcoinsTip, chainActive.Tip()->nHeight + 1, STANDARD_LOCKTIME_VERIFY_FLAGS);
            return false;
        }
    }

    LimitMempoolSize(mempool, GetArg("-maxmempool", DEFAULT_MAX_MEMPOOL_SIZE) * 1000000, GetArg("-mempoolexpiry", DEFAULT_MEMPOOL_EXPIRY) * 60 * 60); // 限制内存池大小

    // The resulting new best tip may not be in setBlockIndexCandidates anymore, so
    // add it again. // 结果新的最佳链尖可能不在区块索引候选集中，所以再次添加它。
    BlockMap::iterator it = mapBlockIndex.begin(); // 获取区块索引映射列表首迭代器
    while (it != mapBlockIndex.end()) { // 遍历区块索引映射列表
        if (it->second->IsValid(BLOCK_VALID_TRANSACTIONS) && it->second->nChainTx && !setBlockIndexCandidates.value_comp()(it->second, chainActive.Tip())) { // 若区块索引有效 且 该区块所有交易依赖的交易可用 且 该区块索引是最佳链尖
            setBlockIndexCandidates.insert(it->second); // 插入区块索引候选集
        }
        it++;
    }

    InvalidChainFound(pindex); // 查找无效的链
    mempool.removeForReorg(pcoinsTip, chainActive.Tip()->nHeight + 1, STANDARD_LOCKTIME_VERIFY_FLAGS);
    return true;
}
```

### 2.3. 验证链状态是否有效

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
