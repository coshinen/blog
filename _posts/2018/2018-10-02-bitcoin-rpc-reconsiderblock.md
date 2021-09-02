---
layout: post
title:  "比特币 RPC 命令「reconsiderblock」"
date:   2018-10-02 20:29:12 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
reconsiderblock "hash"

移除一个区块及其后代的无效状态，重新考虑它们为活跃状态。

参数：
1. hash（字符串，必备）用于重新考虑的区块哈希

结果：

例子：
> bitcoin-cli reconsiderblock "blockhash"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "reconsiderblock", "params": ["blockhash"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`reconsiderblock` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue reconsiderblock(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue reconsiderblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "reconsiderblock \"hash\"\n"
            "\nRemoves invalidity status of a block and its descendants, reconsider them for activation.\n"
            "This can be used to undo the effects of invalidateblock.\n"
            "\nArguments:\n"
            "1. hash   (string, required) the hash of the block to reconsider\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("reconsiderblock", "\"blockhash\"")
            + HelpExampleRpc("reconsiderblock", "\"blockhash\"")
        ); // 1. 帮助内容

    std::string strHash = params[0].get_str();
    uint256 hash(uint256S(strHash));
    CValidationState state;

    { // 2. 检查指定区块是否存在
        LOCK(cs_main);
        if (mapBlockIndex.count(hash) == 0) // 若不存在
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found"); // 抛出区块未找到的错误信息

        CBlockIndex* pblockindex = mapBlockIndex[hash]; // 若存在
        ReconsiderBlock(state, pblockindex); // 重新考虑区块
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

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 检查指定区块是否存在

重新考虑区块函数 `ReconsiderBlock(state, pblockindex)` 声明在文件 `main.h` 中。

```cpp
/** Remove invalidity status from a block and its descendants. */
bool ReconsiderBlock(CValidationState& state, CBlockIndex *pindex); // 移除一个区块及其后辈的无效状态。
```

实现在文件 `main.cpp` 中。

```cpp
bool ReconsiderBlock(CValidationState& state, CBlockIndex *pindex) {
    AssertLockHeld(cs_main);

    int nHeight = pindex->nHeight; // 获取指定区块高度

    // Remove the invalidity flag from this block and all its descendants. // 移除该区块及其后辈的无效化标志
    BlockMap::iterator it = mapBlockIndex.begin();
    while (it != mapBlockIndex.end()) { // 遍历区块索引映射列表
        if (!it->second->IsValid() && it->second->GetAncestor(nHeight) == pindex) { // 若该索引无效
            it->second->nStatus &= ~BLOCK_FAILED_MASK; // 改变区块状态
            setDirtyBlockIndex.insert(it->second); // 插入无效区块索引集合
            if (it->second->IsValid(BLOCK_VALID_TRANSACTIONS) && it->second->nChainTx && setBlockIndexCandidates.value_comp()(chainActive.Tip(), it->second)) { // 若该区块交易有效
                setBlockIndexCandidates.insert(it->second); // 插入区块索引候选集
            }
            if (it->second == pindexBestInvalid) {
                // Reset invalid block marker if it was pointing to one of those. // 如果它指向其中一个，重置无效区块标记
                pindexBestInvalid = NULL;
            }
        }
        it++;
    }

    // Remove the invalidity flag from all ancestors too. // 一并移除全部祖先的无效化标志
    while (pindex != NULL) { // 区块索引指针非空
        if (pindex->nStatus & BLOCK_FAILED_MASK) {
            pindex->nStatus &= ~BLOCK_FAILED_MASK; // 0
            setDirtyBlockIndex.insert(pindex); // 插入无效区块索引集合
        }
        pindex = pindex->pprev; // 指向前一个区块
    }
    return true;
}
```

### 3. 验证链状态是否有效

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
