---
layout: post
title:  "比特币 RPC 命令「verifychain」"
date:   2018-06-08 20:46:42 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help verifychain
verifychain ( checklevel numblocks )

验证区块链数据库。

参数：
1. checklevel（字符串，可选，0-4，默认为 3）区块验证有多彻底。
检查等级 0：从磁盘读区块数据到内存。
检查等级 1：验证区块有效性。
检查等级 2：验证撤销有效性。
检查等级 3：检查在内存中断开链尖区块连接的不一致性。
检查等级 4：尝试重连区块。
2. numblocks （字符串，可选，默认为 288，0 或负数表示全部）要检查的区块数。

结果：
"true|false" （布尔型）验证与否

例子：
> bitcoin-cli verifychain
> curl --user myusername:userpassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifychain", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`verifychain` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue verifychain(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue verifychain(const UniValue& params, bool fHelp)
{
    int nCheckLevel = GetArg("-checklevel", DEFAULT_CHECKLEVEL); // 检查等级，默认 3
    int nCheckDepth = GetArg("-checkblocks", DEFAULT_CHECKBLOCKS); // 检查块数，默认 288
    if (fHelp || params.size() > 2)
        throw runtime_error(
            "verifychain ( checklevel numblocks )\n"
            "\nVerifies blockchain database.\n"
            "\nArguments:\n"
            "1. checklevel   (numeric, optional, 0-4, default=" + strprintf("%d", nCheckLevel) + ") How thorough the block verification is.\n"
            "2. numblocks    (numeric, optional, default=" + strprintf("%d", nCheckDepth) + ", 0=all) The number of blocks to check.\n"
            "\nResult:\n"
            "true|false       (boolean) Verified or not\n"
            "\nExamples:\n"
            + HelpExampleCli("verifychain", "")
            + HelpExampleRpc("verifychain", "")
        ); // 1. 帮助内容

    LOCK(cs_main); // 上锁

    if (params.size() > 0)
        nCheckLevel = params[0].get_int(); // 获取指定的检查等级
    if (params.size() > 1)
        nCheckDepth = params[1].get_int(); // 获取指定得检查块数作为检查深度

    return CVerifyDB().VerifyDB(Params(), pcoinsTip, nCheckLevel, nCheckDepth); // 检查区块链数据库
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

基本流程：
1. 设置默认检查等级和默认检查块数。
2. 处理命令帮助和参数个数。
3. 上锁。
4. 获取用户指定的检查等级和检查块数（深度）。
5. 检查区块链数据库。

第五步，创建了一个临时对象然后调用 CVerifyDB().VerifyDB(Params(), pcoinsTip, nCheckLevel, nCheckDepth) 来验证区块链数据库。
该类定义在“main.h”文件中。

```cpp
/** RAII wrapper for VerifyDB: Verify consistency of the block and coin databases */
class CVerifyDB { // VerifyDB 的 RAII 包装器：验证区块和币数据库完整性
public:
    CVerifyDB();
    ~CVerifyDB();
    bool VerifyDB(const CChainParams& chainparams, CCoinsView *coinsview, int nCheckLevel, int nCheckDepth); // 验证数据库
};
```

验证函数实现在“main.cpp”文件中。

```cpp
bool CVerifyDB::VerifyDB(const CChainParams& chainparams, CCoinsView *coinsview, int nCheckLevel, int nCheckDepth)
{
    LOCK(cs_main); // 上锁
    if (chainActive.Tip() == NULL || chainActive.Tip()->pprev == NULL) // 激活的链尖非空 且 链尖的前一个区块哈希非空（即区块链高度至少为 1）
        return true;

    // Verify blocks in the best chain // 验证最佳链上的区块
    if (nCheckDepth <= 0) // 检查深度若为负数
        nCheckDepth = 1000000000; // suffices until the year 19000
    if (nCheckDepth > chainActive.Height()) // 检查深度若大于当前激活链高度
        nCheckDepth = chainActive.Height(); // 检查深度等于链高度
    nCheckLevel = std::max(0, std::min(4, nCheckLevel)); // 检查等级，最高 4 级
    LogPrintf("Verifying last %i blocks at level %i\n", nCheckDepth, nCheckLevel); // 记录检查信息
    CCoinsViewCache coins(coinsview);
    CBlockIndex* pindexState = chainActive.Tip(); // 获取链尖区块索引
    CBlockIndex* pindexFailure = NULL;
    int nGoodTransactions = 0; // 好的交易数
    CValidationState state; // 用于保存区块的验证状态
    for (CBlockIndex* pindex = chainActive.Tip(); pindex && pindex->pprev; pindex = pindex->pprev)
    { // 遍历区块链，从新到旧
        boost::this_thread::interruption_point();
        uiInterface.ShowProgress(_("Verifying blocks..."), std::max(1, std::min(99, (int)(((double)(chainActive.Height() - pindex->nHeight)) / (double)nCheckDepth * (nCheckLevel >= 4 ? 50 : 100)))));
        if (pindex->nHeight < chainActive.Height()-nCheckDepth) // 若当前验证的区块数大于检查深度
            break; // 跳出
        CBlock block;
        // check level 0: read from disk // 检查等级 0：从磁盘读
        if (!ReadBlockFromDisk(block, pindex, chainparams.GetConsensus())) // 根据区块索引从磁盘读区块数据到内存 block
            return error("VerifyDB(): *** ReadBlockFromDisk failed at %d, hash=%s", pindex->nHeight, pindex->GetBlockHash().ToString());
        // check level 1: verify block validity // 检查等级 1：验证区块有效性
        if (nCheckLevel >= 1 && !CheckBlock(block, state)) // 检查区块状态
            return error("VerifyDB(): *** found bad block at %d, hash=%s\n", pindex->nHeight, pindex->GetBlockHash().ToString());
        // check level 2: verify undo validity // 检查等级 2：验证撤销有效性
        if (nCheckLevel >= 2 && pindex) {
            CBlockUndo undo;
            CDiskBlockPos pos = pindex->GetUndoPos(); // 获取区块在磁盘上撤销的位置
            if (!pos.IsNull()) {
                if (!UndoReadFromDisk(undo, pos, pindex->pprev->GetBlockHash())) // 撤销从磁盘读，从历史文件读
                    return error("VerifyDB(): *** found bad undo data at %d, hash=%s\n", pindex->nHeight, pindex->GetBlockHash().ToString());
            }
        }
        // check level 3: check for inconsistencies during memory-only disconnect of tip blocks // 检查等级 3：检查在内存中断开链尖区块连接的不一致性
        if (nCheckLevel >= 3 && pindex == pindexState && (coins.DynamicMemoryUsage() + pcoinsTip->DynamicMemoryUsage()) <= nCoinCacheUsage) { // 币的动态内存用量不能大于 5000 * 300 （1M 多）
            bool fClean = true;
            if (!DisconnectBlock(block, state, pindex, coins, &fClean)) // 断开链尖区块
                return error("VerifyDB(): *** irrecoverable inconsistency in block data at %d, hash=%s", pindex->nHeight, pindex->GetBlockHash().ToString());
            pindexState = pindex->pprev; // 指向前一个区块（新的链尖区块）
            if (!fClean) {
                nGoodTransactions = 0;
                pindexFailure = pindex;
            } else
                nGoodTransactions += block.vtx.size(); // 记录好的交易数
        }
        if (ShutdownRequested()) // 这里如果比特币核心被请求断开连接
            return true; // 直接返回 true
    }
    if (pindexFailure) // 记录失败信息
        return error("VerifyDB(): *** coin database inconsistencies found (last %i blocks, %i good transactions before that)\n", chainActive.Height() - pindexFailure->nHeight + 1, nGoodTransactions);

    // check level 4: try reconnecting blocks // 检查等级 4：尝试重连区块
    if (nCheckLevel >= 4) { // 最高等级 4
        CBlockIndex *pindex = pindexState; // 获取当前区块索引
        while (pindex != chainActive.Tip()) {
            boost::this_thread::interruption_point();
            uiInterface.ShowProgress(_("Verifying blocks..."), std::max(1, std::min(99, 100 - (int)(((double)(chainActive.Height() - pindex->nHeight)) / (double)nCheckDepth * 50))));
            pindex = chainActive.Next(pindex); // 指向下一个区块索引
            CBlock block;
            if (!ReadBlockFromDisk(block, pindex, chainparams.GetConsensus())) // 从磁盘中读区块数据
                return error("VerifyDB(): *** ReadBlockFromDisk failed at %d, hash=%s", pindex->nHeight, pindex->GetBlockHash().ToString());
            if (!ConnectBlock(block, state, pindex, coins)) // 连接该区块
                return error("VerifyDB(): *** found unconnectable block at %d, hash=%s", pindex->nHeight, pindex->GetBlockHash().ToString());
        }
    }

    LogPrintf("No coin database inconsistencies in last %i blocks (%i transactions)\n", chainActive.Height() - pindexState->nHeight, nGoodTransactions); // 检验完成，没有不一致

    return true;
}
```

未完成。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
