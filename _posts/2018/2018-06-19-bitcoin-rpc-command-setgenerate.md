---
layout: post
title:  "比特币 RPC 命令剖析 \"setgenerate\""
date:   2018-06-19 20:19:21 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli setgenerate generate ( genproclimit )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help setgenerate
setgenerate generate ( genproclimit )

把 'generate' 设置为 true 或 false 用于打开或关闭挖矿。
挖矿受限于 'genproclimit' 处理器，-1 为无限制。
使用 getgenerate 查看当前设置。

参数：
1. generate    （布尔型，必备）设置为 true 以打开挖矿，false 用于关闭。
2. genproclimit（整型，可选）设置挖矿开启时的处理器限制。-1 为无限制。

例子：

在一个处理器的限制下设置挖矿

> bitcoin-cli setgenerate true 1

检查设置

> bitcoin-cli getgenerate

关闭挖矿

> bitcoin-cli setgenerate false

使用 json rpc

> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setgenerate", "params": [true, 1] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`setgenerate` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue setgenerate(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue setgenerate(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "setgenerate generate ( genproclimit )\n"
            "\nSet 'generate' true or false to turn generation on or off.\n"
            "Generation is limited to 'genproclimit' processors, -1 is unlimited.\n"
            "See the getgenerate call for the current setting.\n"
            "\nArguments:\n"
            "1. generate         (boolean, required) Set to true to turn on generation, off to turn off.\n"
            "2. genproclimit     (numeric, optional) Set the processor limit for when generation is on. Can be -1 for unlimited.\n"
            "\nExamples:\n"
            "\nSet the generation on with a limit of one processor\n"
            + HelpExampleCli("setgenerate", "true 1") +
            "\nCheck the setting\n"
            + HelpExampleCli("getgenerate", "") +
            "\nTurn off generation\n"
            + HelpExampleCli("setgenerate", "false") +
            "\nUsing json rpc\n"
            + HelpExampleRpc("setgenerate", "true, 1")
        ); // 1. 帮助内容

    if (Params().MineBlocksOnDemand()) // 若是回归测试网络，此方法不适用，使用 "generate" 代替
        throw JSONRPCError(RPC_METHOD_NOT_FOUND, "Use the generate method instead of setgenerate on this network");

    bool fGenerate = true; // 挖矿开关标志
    if (params.size() > 0)
        fGenerate = params[0].get_bool(); // 获取指定的挖矿状态

    int nGenProcLimit = GetArg("-genproclimit", DEFAULT_GENERATE_THREADS); // 初始化默认挖矿线程数
    if (params.size() > 1)
    {
        nGenProcLimit = params[1].get_int(); // 获取指定的挖矿线程数
        if (nGenProcLimit == 0) // 若指定线程数为 0
            fGenerate = false; // 关闭挖矿功能
    }

    mapArgs["-gen"] = (fGenerate ? "1" : "0"); // 改变挖矿选项的值
    mapArgs ["-genproclimit"] = itostr(nGenProcLimit); // 修改挖矿线程数
    GenerateBitcoins(fGenerate, nGenProcLimit, Params()); // 杀掉当前挖矿线程或创建指定数量的新挖矿线程

    return NullUniValue;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.检查网络类型。<br>
3.获取要改变的挖矿状态。<br>
4.初始化挖矿线程数，并获取指定的线程数。<br>
5.改变选项 "-gen" 和 "-genproclimit" 的值。<br>
6.杀掉当前挖矿线程或创建指定数目的新挖矿线程。

第六步，调用 GenerateBitcoins(fGenerate, nGenProcLimit, Params()) 函数创建指定数目的挖矿线程。
该函数声明在“miner.h”文件中。

```cpp
/** Run the miner threads */
void GenerateBitcoins(bool fGenerate, int nThreads, const CChainParams& chainparams); // 运行矿工线程
```

实现在“miner.cpp”文件中。

```cpp
void GenerateBitcoins(bool fGenerate, int nThreads, const CChainParams& chainparams)
{
    static boost::thread_group* minerThreads = NULL; // 矿工线程组指针对象

    if (nThreads < 0) // 若设置线程数小于 0
        nThreads = GetNumCores(); // 获取 CPU 核数作为挖矿线程数

    if (minerThreads != NULL) // 保证线程组指针为空，若当前已经有挖矿线程，则停止当前线程
    {
        minerThreads->interrupt_all(); // 中断线程组中的所有线程
        delete minerThreads; // 删除并置空
        minerThreads = NULL;
    }

    if (nThreads == 0 || !fGenerate) // 验证参数（线程数和挖矿标志）
        return;

    minerThreads = new boost::thread_group(); // 创建空的矿工线程组
    for (int i = 0; i < nThreads; i++) // 创建指定线程数 nThreads 个比特币矿工线程 BitcoinMiner
        minerThreads->create_thread(boost::bind(&BitcoinMiner, boost::cref(chainparams)));
}
```

该函数会先杀掉当前存在的比特币矿工线程，然后根据实参 fGenerate 决定直接返回还是创建新的比特币矿工线程。
比特币矿工线程函数 BitcoinMiner(...)。实现在“miner.h”文件中。<br>
在最新版的比特币源码中该函数已移除。

```cpp
void static BitcoinMiner(const CChainParams& chainparams)
{
    LogPrintf("BitcoinMiner started\n");
    SetThreadPriority(THREAD_PRIORITY_LOWEST); // 设置线程优先级，宏定义在 compat.h 中
    RenameThread("bitcoin-miner"); // 重命名线程为比特币矿工

    unsigned int nExtraNonce = 0; // Nonce: Number used once/Number once 表示该随机数只用一次

    boost::shared_ptr<CReserveScript> coinbaseScript;
    GetMainSignals().ScriptForMining(coinbaseScript); // 创币交易脚本

    try {
        // Throw an error if no script was provided.  This can happen
        // due to some internal error but also if the keypool is empty.
        // In the latter case, already the pointer is NULL.
        if (!coinbaseScript || coinbaseScript->reserveScript.empty()) // 需要创币脚本，且挖矿必须有一个钱包
            throw std::runtime_error("No coinbase script available (mining requires a wallet)");

        while (true) { // 循环挖矿
            if (chainparams.MiningRequiresPeers()) { // 区分主网、公测网和回归测试网（该网可以单机挖矿）
                // Busy-wait for the network to come online so we don't waste time mining
                // on an obsolete chain. In regtest mode we expect to fly solo.
                do {
                    bool fvNodesEmpty; // 节点列表为空的标志
                    {
                        LOCK(cs_vNodes);
                        fvNodesEmpty = vNodes.empty(); // 建立连接的节点列表是否为空
                    }
#if 1 // for debug
                    LogPrintf("fvNodesEmpty: %d\n", fvNodesEmpty);
                    LogPrintf("IsInitialBlockDownload(): %d\n", IsInitialBlockDownload());
#endif
                    if (!fvNodesEmpty && !IsInitialBlockDownload()) // 必须建立一条连接（即不能单机挖矿） 且 完成初始化块下载
                        break; // 主网和公测网必须从这里跳出才能开始挖矿
                    MilliSleep(1000); // 睡 1s
                } while (true);
            }

            //
            // Create new block
            //
            unsigned int nTransactionsUpdatedLast = mempool.GetTransactionsUpdated(); // 获取内存池中交易更新的数量
            CBlockIndex* pindexPrev = chainActive.Tip(); // 获取链尖区块（即最后一块）作为新建区块的父区块

            auto_ptr<CBlockTemplate> pblocktemplate(CreateNewBlock(chainparams, coinbaseScript->reserveScript)); // 新建区块
            if (!pblocktemplate.get())
            {
                LogPrintf("Error in BitcoinMiner: Keypool ran out, please call keypoolrefill before restarting the mining thread\n");
                return;
            }
            CBlock *pblock = &pblocktemplate->block;
            IncrementExtraNonce(pblock, pindexPrev, nExtraNonce); // 改变创币交易的输入脚本，并计算创世区块的默尔克数根哈希

            LogPrintf("Running BitcoinMiner with %u transactions in block (%u bytes)\n", pblock->vtx.size(),
                ::GetSerializeSize(*pblock, SER_NETWORK, PROTOCOL_VERSION));

            //
            // Search // 挖矿核心
            //
            int64_t nStart = GetTime(); // 记录开始挖矿的时间
            arith_uint256 hashTarget = arith_uint256().SetCompact(pblock->nBits); // 设置挖当前块的难度目标值
            uint256 hash; // 保存当前块的哈希
            uint32_t nNonce = 0; // 随机数初始化置 0
            while (true) { // 挖一个块
                // Check if something found
                if (ScanHash(pblock, nNonce, &hash)) // 挖矿，hash 最后 16 位为 0 则满足条件
                {
#if 1 // for debug
					LogPrintf("Search now\n");
#endif
                    if (UintToArith256(hash) <= hashTarget) // 转化为小端模式，与难度目标值比较，判断是否为合格的块
                    { // 满足条件（小于目标值）
                        // Found a solution
                        pblock->nNonce = nNonce; // 记录当前块的随机数
                        assert(hash == pblock->GetHash()); // 验证一下区块的哈希

                        SetThreadPriority(THREAD_PRIORITY_NORMAL); // 提高挖矿线程优先级
                        LogPrintf("BitcoinMiner:\n");
                        LogPrintf("proof-of-work found  \n  hash: %s  \ntarget: %s\n", hash.GetHex(), hashTarget.GetHex()); // 记录挖到矿的相关信息
                        ProcessBlockFound(pblock, chainparams); // pending
                        SetThreadPriority(THREAD_PRIORITY_LOWEST); // 重置挖矿线程优先级
                        coinbaseScript->KeepScript(); // pending

                        // In regression test mode, stop mining after a block is found.
                        if (chainparams.MineBlocksOnDemand()) // 回归测试网，挖到一个矿后线程便中断
                            throw boost::thread_interrupted();

                        break; // 跳出，继续挖下一个块
                    }
                } // 挖到的块不满足条件

                // Check for stop or if block needs to be rebuilt
                boost::this_thread::interruption_point(); // 设置中断点
                // Regtest mode doesn't require peers
                if (vNodes.empty() && chainparams.MiningRequiresPeers()) // 用于非回归测试网无连接时
                    break; // 跳出挖矿并睡觉
                if (nNonce >= 0xffff0000) // 挖矿次数超过 0xffff0000 次，则挖矿失败
                    break; // 跳出，重新建块（更新区块）挖矿
                if (mempool.GetTransactionsUpdated() != nTransactionsUpdatedLast && GetTime() - nStart > 60) // 当前内存池交易更新的数量不等于新建区块前内存池交易更新的数量 且 挖一个矿的时间超过 60s
                    break; // 跳出，更新区块再挖矿
                if (pindexPrev != chainActive.Tip()) // 当前区块链尖改变，即有人挖到块并广播验证加入区块链
                    break; // 跳出，更新区块再挖矿

                // Update nTime every few seconds
                if (UpdateTime(pblock, chainparams.GetConsensus(), pindexPrev) < 0) // 更新区块时间，并返回更新的时间差（测试网中会更改 nBits）
                    break; // Recreate the block if the clock has run backwards, // 如果时钟不准（落后），会跳出并重建区块
                           // so that we can use the correct time.
                if (chainparams.GetConsensus().fPowAllowMinDifficultyBlocks) // 在测试网中会重设难度目标值
                {
                    // Changing pblock->nTime can change work required on testnet:
                    hashTarget.SetCompact(pblock->nBits);
                }
            }
        }
    }
    catch (const boost::thread_interrupted&)
    {
        LogPrintf("BitcoinMiner terminated\n");
        throw;
    }
    catch (const std::runtime_error &e)
    {
        LogPrintf("BitcoinMiner runtime error: %s\n", e.what());
        return;
    }
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
* [bitcoin/miner.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/miner.h){:target="_blank"}
* [bitcoin/miner.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/miner.cpp){:target="_blank"}
