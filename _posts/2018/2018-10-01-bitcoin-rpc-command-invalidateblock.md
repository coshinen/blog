---
layout: post
title:  "比特币 RPC 命令剖析 \"invalidateblock\""
date:   2018-10-01 09:25:28 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli invalidateblock "hash"
---
## 提示说明

```shell
invalidateblock "hash" # 永久标记一个区块无效，就像该块违反了共识规则
```

参数：
1. hash（字符串，必备）用来标记为无效的区块哈希。

结果：无返回值。

## 用法示例

### 比特币核心服务程序

获取当前最佳区块哈希，记录该区块高度 32723 和当前区块数 32729 和连接数 1，无效化该区块后，再次查看...

```shell
$ bitcoin-cli getbestblockhash
000000ea5bb666e0ab8e837691bbb2a0605c4a82281eecd858ad3ffce917df96
$ bitocin-cli getblock 000000ea5bb666e0ab8e837691bbb2a0605c4a82281eecd858ad3ffce917df96 | grep height
  "height": 32723,
$ bitcoin-cli getblockcount
32729
$ bitcoin-cli getconnectioncount
1
$ bitcoin-cli invalidateblock 000000ea5bb666e0ab8e837691bbb2a0605c4a82281eecd858ad3ffce917df96
$ bitcoin-cli getblockcount
32722
$ bitcoin-cli getconnectioncount
0
```

此时区块数变为 32722，从高度 32723 开始的区块均被标记为无效，但不会影响与其相连的其他节点，之后全部连接也会自动断开。

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "invalidateblock", "params": ["000000ea5bb666e0ab8e837691bbb2a0605c4a82281eecd858ad3ffce917df96"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析

invalidateblock 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue invalidateblock(const UniValue& params, bool fHelp); // 无效化区块
```

实现在“rpcblockchain.cpp”文件中。

```cpp
UniValue invalidateblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "invalidateblock \"hash\"\n"
            "\nPermanently marks a block as invalid, as if it violated a consensus rule.\n"
            "\nArguments:\n"
            "1. hash   (string, required) the hash of the block to mark as invalid\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("invalidateblock", "\"blockhash\"")
            + HelpExampleRpc("invalidateblock", "\"blockhash\"")
        );

    std::string strHash = params[0].get_str(); // 获取指定的区块哈希
    uint256 hash(uint256S(strHash)); // 转换为 uint256 对象
    CValidationState state;

    {
        LOCK(cs_main); // 上锁
        if (mapBlockIndex.count(hash) == 0) // 若指定哈希再区块索引映射列表中不存在
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found");

        CBlockIndex* pblockindex = mapBlockIndex[hash]; // 获取指定哈希对应的区块索引
        InvalidateBlock(state, Params().GetConsensus(), pblockindex); // 使该区块无效化
    }

    if (state.IsValid()) { // 若验证状态有效
        ActivateBestChain(state, Params()); // 激活最佳链
    }

    if (!state.IsValid()) { // 再次验证激活状态
        throw JSONRPCError(RPC_DATABASE_ERROR, state.GetRejectReason());
    }

    return NullUniValue; // 返回空值
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 获取指定区块哈希，构造 uint256 对象。
3. 验证指定区块是否存在，若存在，使该区块无效化。
4. 检查验证状态，若有效，激活最佳链。
5. 再次检查激活验证状态，若有效，直接返回空值。

第三步，调用 InvalidateBlock(state, Params().GetConsensus(), pblockindex) 使指定区块及其后辈无效化，该函数定义在“main.cpp”文件中。

```cpp
/** Disconnect chainActive's tip. You probably want to call mempool.removeForReorg and manually re-limit mempool size after this, with cs_main held. */ // 断开激活的链尖。你可能想要调用 mempool.removeForReorg 并在该操作后手动再次限制内存池大小，同时持有主锁。
bool static DisconnectTip(CValidationState& state, const Consensus::Params& consensusParams)
{
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
    return true; // 返回 true
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

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
