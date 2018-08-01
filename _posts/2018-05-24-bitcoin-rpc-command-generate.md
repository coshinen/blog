---
layout: post
title:  "比特币 RPC 命令剖析 \"generate\""
date:   2018-05-24 09:04:12 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin bitcoin-cli commands
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
generate numblocks # 立刻挖出区块（在 RPC 调用返回前）
{% endhighlight %}

**注：此功能仅限回归测试网 regtest 使用。**

参数：<br>
1. `numblocks` （数字，必备）立刻生成区块的数量。

结果：（数组）返回生成区块的哈希集。

## 用法示例

### 比特币核心客户端

在比特币核心服务回归测试模式下产生 2 个区块并上链。

{% highlight shell %}
$ bitcoin-cli -regtest generate 2
[
  "2d14c7f08a52e24913b4f36b486d0171faed26f978d02656d88efdc0acf2a5f5", 
  "4ad63ef738b9d5da85b21fe84853b1672209ffdfbe914896bb475b523efca628"
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "generate", "params": [2] }' -H 'content-type: text/plain;' http://127.0.0.1:18332/
{"result":["5f522cf0b746297737f3522e7830657e114f80b1f48504c11b2ebe942ffa8da0","4bcd4c044152135e7523a870ec198947d4d937bcba8857812c5ace77d725b517"],"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`generate` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue generate(const UniValue& params, bool fHelp); // 产生指定数目个区块（回归测试网用）
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue generate(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 1) // 1.参数只能为 1 个（要生成区块的个数）
        throw runtime_error( // 帮助信息反馈
            "generate numblocks\n"
            "\nMine blocks immediately (before the RPC call returns)\n"
            "\nNote: this function can only be used on the regtest network\n"
            "\nArguments:\n"
            "1. numblocks    (numeric, required) How many blocks are generated immediately.\n"
            "\nResult\n"
            "[ blockhashes ]     (array) hashes of blocks generated\n"
            "\nExamples:\n"
            "\nGenerate 11 blocks\n"
            + HelpExampleCli("generate", "11")
        );

    if (!Params().MineBlocksOnDemand()) // 2.检测网络，只有回归测试网返回 true
        throw JSONRPCError(RPC_METHOD_NOT_FOUND, "This method can only be used on regtest"); // 提示

    int nHeightStart = 0; // 产生块前的高度
    int nHeightEnd = 0; // 产生块后的高度
    int nHeight = 0; // 当前区块链高度
    int nGenerate = params[0].get_int(); // 3.获取要产生区块的数目

    boost::shared_ptr<CReserveScript> coinbaseScript; // 4.创建创币交易脚本
    GetMainSignals().ScriptForMining(coinbaseScript);

    // If the keypool is exhausted, no script is returned at all.  Catch this.
    if (!coinbaseScript) // 5.若密钥池耗尽，根本不会返回脚本。抓住它。
        throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");

    //throw an error if no script was provided
    if (coinbaseScript->reserveScript.empty()) // 6.如果脚本为空，未被提供，则抛出一个错误
        throw JSONRPCError(RPC_INTERNAL_ERROR, "No coinbase script available (mining requires a wallet)");

    {   // Don't keep cs_main locked
        LOCK(cs_main); // 缩小加锁的范围
        nHeightStart = chainActive.Height(); // 7.获取当前激活链高度
        nHeight = nHeightStart; // 记录当前高度
        nHeightEnd = nHeightStart+nGenerate; // 得到产生指定块数后的高度
    }
    unsigned int nExtraNonce = 0;
    UniValue blockHashes(UniValue::VARR); // 数组类型的区块哈希对象
    while (nHeight < nHeightEnd)
    { // 8.循环产生指定数目的区块
        auto_ptr<CBlockTemplate> pblocktemplate(CreateNewBlock(Params(), coinbaseScript->reserveScript)); // 8.1.创建区块模板
        if (!pblocktemplate.get()) // 8.2.验证是否创建成功
            throw JSONRPCError(RPC_INTERNAL_ERROR, "Couldn't create new block");
        CBlock *pblock = &pblocktemplate->block; // 获取区块指针
        {
            LOCK(cs_main);
            IncrementExtraNonce(pblock, chainActive.Tip(), nExtraNonce); // 8.3.增加额外的随机数
        }
        while (!CheckProofOfWork(pblock->GetHash(), pblock->nBits, Params().GetConsensus())) { // 8.4.检测区块是否满足工作量证明
            // Yes, there is a chance every nonce could fail to satisfy the -regtest
            // target -- 1 in 2^(2^32). That ain't gonna happen. // 每个随机数都有可能无法满足 -regtest 目标值 -- 2^(2^32) 分之 1。这不会发生的。
            ++pblock->nNonce; // 区块头内随机数加 1
        }
        CValidationState state;
        if (!ProcessNewBlock(state, Params(), NULL, pblock, true, NULL)) // 8.5.
            throw JSONRPCError(RPC_INTERNAL_ERROR, "ProcessNewBlock, block not accepted");
        ++nHeight; // 增加当前高度
        blockHashes.push_back(pblock->GetHash().GetHex()); // 8.6.追加区块哈希

        //mark script as important because it was used at least for one coinbase output
        coinbaseScript->KeepScript(); // 8.7.标记该脚本为重要，因为它至少用作一个创币输出
    }
    return blockHashes; // 9.返回产生所有区块的哈希
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.检测当前网络类型，是否为回归测试网。<br>
3.获取指定的要生成区块的数目。<br>
4.创建创币脚本，每个区块必有一笔交易（创币交易）。<br>
5.检测密钥池中密钥数量。<br>
6.检测产生的脚本是否为空。<br>
7.获取当前链高度并计算生成区块后的链高度，为生成区块做准备。<br>
8.循环生成指定数目的区块，并记录每个上链区块的哈希。<br>
9.返回打包好的区块哈希。

第二步，首先调用 Params().MineBlocksOnDemand() 函数获取挖矿需求标志。
该标志一般可以表示当前的网络，回归测试网下该标志为 true。<br>
函数 Params() 声明在“chainparams.h”文件中。

{% highlight C++ %}
/**
 * Return the currently selected parameters. This won't change after app
 * startup, except for unit tests.
 */ // 返回当前选择的链参数。除了单元测试，在应用程序启动后不会改变。
const CChainParams &Params();
{% endhighlight %}

实现在“chainparams.cpp”文件中，用于获取当前区块链的参数。

{% highlight C++ %}
static CChainParams *pCurrentParams = 0;

const CChainParams &Params() { // 获取链参数，在 3.5.SelectParams() 初始化后，才能调用
    assert(pCurrentParams);
    return *pCurrentParams;
}
{% endhighlight %}

然后调用 MineBlocksOnDemand() 函数返回挖矿需求标志。该函数声明在“chainparams.h”文件的 CChainParams 类中。

{% highlight C++ %}
/**
 * CChainParams defines various tweakable parameters of a given instance of the
 * Bitcoin system. There are three: the main network on which people trade goods
 * and services, the public test network which gets reset from time to time and
 * a regression test mode which is intended for private networks only. It has
 * minimal difficulty to ensure that blocks can be found instantly.
 */ // 类 CChainParams 定义了比特币系统给定实例的各种可调用参数。有三种：人们交易商品和服务的主网，不时重置的公共测试网和仅限私有网络的回归测试模式。它有确保立刻找到块的最小难度。
class CChainParams
{
public:
    ...
    bool MineBlocksOnDemand() const { return fMineBlocksOnDemand; } // 返回挖矿需求标志
    ...
    bool fMineBlocksOnDemand; // 挖矿需求标志，只有回归测试网中为 true
};
{% endhighlight %}

关于 fMineBlocksOnDemand 变量的初始化，详见[比特币核心服务启动过程]()。

第四步，通过 GetMainSignals().ScriptForMining(coinbaseScript) 信号处理函数获取创币交易的脚本。
函数 GetMainSignals() 声明在“validationinterface.h”文件中。

{% highlight C++ %}
CMainSignals& GetMainSignals();
{% endhighlight %}

实现在“validationinterface.cpp”文件中。

{% highlight C++ %}
static CMainSignals g_signals; // 静态全局信号对象

CMainSignals& GetMainSignals() // 获取主信号对象的引用
{
    return g_signals;
}
{% endhighlight %}

类 CMainSignals 定义在“validationinterface.h”文件中。

{% highlight C++ %}
struct CMainSignals { // 主信号类
    ...
    /** Notifies listeners that a key for mining is required (coinbase) */
    boost::signals2::signal<void (boost::shared_ptr<CReserveScript>&)> ScriptForMining;
    ...
};
{% endhighlight %}

信号 ScriptForMining 通过函数 RegisterValidationInterface(...) 进行注册。<br>
该函数声明在“validationinterface.h”文件中。

{% highlight C++ %}
/** Register a wallet to receive updates from core */
void RegisterValidationInterface(CValidationInterface* pwalletIn); // 注册一个用来接收内核升级的钱包
{% endhighlight %}

实现在“validationinterface.cpp”文件中。

{% highlight C++ %}
void RegisterValidationInterface(CValidationInterface* pwalletIn) {
    g_signals.UpdatedBlockTip.connect(boost::bind(&CValidationInterface::UpdatedBlockTip, pwalletIn, _1));
    g_signals.SyncTransaction.connect(boost::bind(&CValidationInterface::SyncTransaction, pwalletIn, _1, _2));
    g_signals.UpdatedTransaction.connect(boost::bind(&CValidationInterface::UpdatedTransaction, pwalletIn, _1));
    g_signals.SetBestChain.connect(boost::bind(&CValidationInterface::SetBestChain, pwalletIn, _1));
    g_signals.Inventory.connect(boost::bind(&CValidationInterface::Inventory, pwalletIn, _1));
    g_signals.Broadcast.connect(boost::bind(&CValidationInterface::ResendWalletTransactions, pwalletIn, _1));
    g_signals.BlockChecked.connect(boost::bind(&CValidationInterface::BlockChecked, pwalletIn, _1, _2));
    g_signals.ScriptForMining.connect(boost::bind(&CValidationInterface::GetScriptForMining, pwalletIn, _1)); // 这里进行的注册
    g_signals.BlockFound.connect(boost::bind(&CValidationInterface::ResetRequestCount, pwalletIn, _1));
}
{% endhighlight %}

该函数的调用是在“init.cpp”文件的 AppInit2(...) 函数的 Step 8 中。

{% highlight C++ %}
/** Initialize bitcoin.
 *  @pre Parameters should be parsed and config file should be read.
 */
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // [P]3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 8: load wallet // 若启用钱包功能，则加载钱包 
    ...
        RegisterValidationInterface(pwalletMain); // 注册一个钱包用于接收 bitcoin core 的升级
    ...
};
{% endhighlight %}

注册的 CValidationInterface::GetScriptForMining 函数是一个虚函数，在“”文件的 CValidationInterface 类中。

{% highlight C++ %}
class CValidationInterface { // 验证接口
protected:
    ...
    virtual void GetScriptForMining(boost::shared_ptr<CReserveScript>&) {};
    ...
};
{% endhighlight %}

其具体实现在该类的派生类 CWallet 中，该函数声明在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    void GetScriptForMining(boost::shared_ptr<CReserveScript> &script);
    ...
};
{% endhighlight %}

具体实现在“wallet.cpp”文件中。

{% highlight C++ %}
void CWallet::GetScriptForMining(boost::shared_ptr<CReserveScript> &script)
{
    boost::shared_ptr<CReserveKey> rKey(new CReserveKey(this)); // 1.新建一个派生类对象
    CPubKey pubkey;
    if (!rKey->GetReservedKey(pubkey)) // 2.从密钥池中取一个公钥
        return;

    script = rKey; // 3.把派生类对象赋值给基类对象（派生类 -> 基类）
    script->reserveScript = CScript() << ToByteVector(pubkey) << OP_CHECKSIG; // 把公钥加入脚本
}
{% endhighlight %}

这里的流程：<br>
1.新建对象。<br>
2.通过该对象从密钥池获取一个公钥。<br>
3.获取脚本。

1.创建一个从密钥池中分配的密钥 CReserveKey 对象，该类定义在“wallet.h”文件中。

{% highlight C++ %}
/** A key allocated from the key pool. */
class CReserveKey : public CReserveScript // 一个从密钥池分配的密钥
{
protected:
    CWallet* pwallet; // 钱包指针，指向主钱包
    int64_t nIndex; // 密钥池中密钥的索引，初始化为 -1
    CPubKey vchPubKey; // 对应公钥
public:
    CReserveKey(CWallet* pwalletIn)
    {
        nIndex = -1;
        pwallet = pwalletIn; // 主钱包
    }
    ...
    bool GetReservedKey(CPubKey &pubkey); // 从密钥池中获取一个公钥
    ...
};
{% endhighlight %}

2.调用 rKey->GetReservedKey(pubkey) 函数从密钥池中获取一个公钥，该函数实现在“wallet.cpp”文件中。

{% highlight C++ %}
bool CReserveKey::GetReservedKey(CPubKey& pubkey) // 从密钥池中取一个公钥
{
    if (nIndex == -1) // 初始化为 -1
    {
        CKeyPool keypool;
        pwallet->ReserveKeyFromKeyPool(nIndex, keypool);
        if (nIndex != -1)
            vchPubKey = keypool.vchPubKey;
        else {
            return false;
        }
    }
    assert(vchPubKey.IsValid()); // 检测公钥的有效性
    pubkey = vchPubKey;
    return true;
}
{% endhighlight %}

调用 pwallet->ReserveKeyFromKeyPool(nIndex, keypool) 函数真正实现从密钥池中取出一个密钥并获取其公钥。
其实现也在“wallet.cpp”文件中。

{% highlight C++ %}
void CWallet::ReserveKeyFromKeyPool(int64_t& nIndex, CKeyPool& keypool)
{
    nIndex = -1;
    keypool.vchPubKey = CPubKey();
    {
        LOCK(cs_wallet); // 钱包上锁

        if (!IsLocked()) // 若钱包未被加密
            TopUpKeyPool(); // 再次填充密钥池

        // Get the oldest key // 获取时间上最早的密钥
        if(setKeyPool.empty()) // 若密钥池集合为空
            return; // 直接返回

        CWalletDB walletdb(strWalletFile); // 根据钱包文件构造钱包数据库对象

        nIndex = *(setKeyPool.begin()); // 获取最先创建的密钥的索引，大于 0，最小为 1
        setKeyPool.erase(setKeyPool.begin()); // 从密钥池集合中擦除该密钥的索引
        if (!walletdb.ReadPool(nIndex, keypool)) // 根据密钥索引从钱包数据库中读取一个密钥池条目
            throw runtime_error("ReserveKeyFromKeyPool(): read failed");
        if (!HaveKey(keypool.vchPubKey.GetID())) // 通过获取的公钥 ID 检测对应的密钥是否存在
            throw runtime_error("ReserveKeyFromKeyPool(): unknown key in key pool");
        assert(keypool.vchPubKey.IsValid()); // 检查公钥是否有效
        LogPrintf("keypool reserve %d\n", nIndex);
    }
}
{% endhighlight %}

3.把公钥导入脚本。脚本类 CScript 定义在“script.h”文件中。

{% highlight C++ %}
typedef prevector<28, unsigned char> CScriptBase;

/** Serialized script, used inside transaction inputs and outputs */
class CScript : public CScriptBase
{
    ...
public:
    CScript() { }
    ...
    CScript& operator<<(opcodetype opcode)
    {
        if (opcode < 0 || opcode > 0xff)
            throw std::runtime_error("CScript::operator<<(): invalid opcode");
        insert(end(), (unsigned char)opcode);
        return *this;
    }
    ...
    CScript& operator<<(const std::vector<unsigned char>& b)
    {
        if (b.size() < OP_PUSHDATA1) // 4 中导入方式
        {
            insert(end(), (unsigned char)b.size());
        }
        else if (b.size() <= 0xff)
        {
            insert(end(), OP_PUSHDATA1);
            insert(end(), (unsigned char)b.size());
        }
        else if (b.size() <= 0xffff)
        {
            insert(end(), OP_PUSHDATA2);
            uint8_t data[2];
            WriteLE16(data, b.size());
            insert(end(), data, data + sizeof(data));
        }
        else
        {
            insert(end(), OP_PUSHDATA4);
            uint8_t data[4];
            WriteLE32(data, b.size());
            insert(end(), data, data + sizeof(data));
        }
        insert(end(), b.begin(), b.end());
        return *this;
    }
    ...
};
{% endhighlight %}

函数模板 ToByteVector(pubkey) 和 OP_CHECKSIG 均定义在“script.h”文件中。

{% highlight C++ %}
template <typename T>
std::vector<unsigned char> ToByteVector(const T& in)
{
    return std::vector<unsigned char>(in.begin(), in.end());
}

/** Script opcodes */
enum opcodetype
{
    ...
    // crypto
    ...
    OP_CHECKSIG = 0xac,
    ...
};
{% endhighlight %}

第六步，调用 coinbaseScript->reserveScript.empty() 函数判断脚本是否创建成功。<br>
该函数定义在“prevector.h”文件的 prevector 类模板中。

{% highlight C++ %}
** Implements a drop-in replacement for std::vector<T> which stores up to N
 *  elements directly (without heap allocation). The types Size and Diff are
 *  used to store element counts, and can be any unsigned + signed type.
 *
 *  Storage layout is either:
 *  - Direct allocation:
 *    - Size _size: the number of used elements (between 0 and N)
 *    - T direct[N]: an array of N elements of type T
 *      (only the first _size are initialized).
 *  - Indirect allocation:
 *    - Size _size: the number of used elements plus N + 1
 *    - Size capacity: the number of allocated elements
 *    - T* indirect: a pointer to an array of capacity elements of type T
 *      (only the first _size are initialized).
 *
 *  The data type T must be movable by memmove/realloc(). Once we switch to C++,
 *  move constructors can be used instead.
 */
template<unsigned int N, typename T, typename Size = uint32_t, typename Diff = int32_t>
class prevector {
public:
    typedef Size size_type; // uint32_t
    ...
private:
    size_type _size; // 4 bytes
    ...
    bool is_direct() const { return _size <= N; } // N 为 28
    ...
    size_type size() const {
        return is_direct() ? _size : _size - N - 1;
    }

    bool empty() const { // _size == 29 为空
        return size() == 0;
    }
    ...
};
{% endhighlight %}

第八步，终于进入正题，开始生成区块了。<br>
8.1.通过调用 CreateNewBlock(Params(), coinbaseScript->reserveScript) 函数把创建的创币脚本传入生成一个区块模板。
该函数声明在“miner.h”文件中。

{% highlight C++ %}
struct CBlockTemplate // 区块模板类
{
    CBlock block; // 区块对象
    std::vector<CAmount> vTxFees; // 交易手续费
    std::vector<int64_t> vTxSigOps; // 交易签名操作
};
...
/** Generate a new block, without valid proof-of-work */
CBlockTemplate* CreateNewBlock(const CChainParams& chainparams, const CScript& scriptPubKeyIn);
{% endhighlight %}

实现在“miner.cpp”文件中。

{% highlight C++ %}
CBlockTemplate* CreateNewBlock(const CChainParams& chainparams, const CScript& scriptPubKeyIn)
{
    // Create new block
    auto_ptr<CBlockTemplate> pblocktemplate(new CBlockTemplate()); // 创建一个新的区块模板（包含交易手续费和交易签名操作）
    if(!pblocktemplate.get())
        return NULL;
    CBlock *pblock = &pblocktemplate->block; // pointer for convenience

    // Create coinbase tx
    CMutableTransaction txNew; // 创建创币交易对象
    txNew.vin.resize(1);
    txNew.vin[0].prevout.SetNull(); // 输入为空
    txNew.vout.resize(1);
    txNew.vout[0].scriptPubKey = scriptPubKeyIn; // 输出公钥脚本

    // Add dummy coinbase tx as first transaction
    pblock->vtx.push_back(CTransaction()); // 添加假的创币交易作为第一笔交易到交易列表中
    pblocktemplate->vTxFees.push_back(-1); // updated at end // 无交易手续费
    pblocktemplate->vTxSigOps.push_back(-1); // updated at end // 无交易签名操作

    // Largest block you're willing to create:
    unsigned int nBlockMaxSize = GetArg("-blockmaxsize", DEFAULT_BLOCK_MAX_SIZE); // 你希望创建的最大区块大小，默认 750,000（不到 1M）
    // Limit to between 1K and MAX_BLOCK_SIZE-1K for sanity:
    nBlockMaxSize = std::max((unsigned int)1000, std::min((unsigned int)(MAX_BLOCK_SIZE-1000), nBlockMaxSize)); // 获取真正区块大小的最大限制

    // How much of the block should be dedicated to high-priority transactions,
    // included regardless of the fees they pay
    unsigned int nBlockPrioritySize = GetArg("-blockprioritysize", DEFAULT_BLOCK_PRIORITY_SIZE); // 默认区块优先级大小，默认为 0
    nBlockPrioritySize = std::min(nBlockMaxSize, nBlockPrioritySize); // 用于包含高优先级的交易

    // Minimum block size you want to create; block will be filled with free transactions
    // until there are no more or the block reaches this size:
    unsigned int nBlockMinSize = GetArg("-blockminsize", DEFAULT_BLOCK_MIN_SIZE); // 默认区块大小最小限制，默认为 0
    nBlockMinSize = std::min(nBlockMaxSize, nBlockMinSize);

    // Collect memory pool transactions into the block
    CTxMemPool::setEntries inBlock;
    CTxMemPool::setEntries waitSet;

    // This vector will be sorted into a priority queue:
    vector<TxCoinAgePriority> vecPriority;
    TxCoinAgePriorityCompare pricomparer;
    std::map<CTxMemPool::txiter, double, CTxMemPool::CompareIteratorByHash> waitPriMap;
    typedef std::map<CTxMemPool::txiter, double, CTxMemPool::CompareIteratorByHash>::iterator waitPriIter;
    double actualPriority = -1;

    std::priority_queue<CTxMemPool::txiter, std::vector<CTxMemPool::txiter>, ScoreCompare> clearedTxs;
    bool fPrintPriority = GetBoolArg("-printpriority", DEFAULT_PRINTPRIORITY); // 打印优先级标志，默认关闭
    uint64_t nBlockSize = 1000;
    uint64_t nBlockTx = 0;
    unsigned int nBlockSigOps = 100;
    int lastFewTxs = 0;
    CAmount nFees = 0;

    {
        LOCK2(cs_main, mempool.cs);
        CBlockIndex* pindexPrev = chainActive.Tip();
        const int nHeight = pindexPrev->nHeight + 1;
        pblock->nTime = GetAdjustedTime();
        const int64_t nMedianTimePast = pindexPrev->GetMedianTimePast();

        pblock->nVersion = ComputeBlockVersion(pindexPrev, chainparams.GetConsensus());
        // -regtest only: allow overriding block.nVersion with
        // -blockversion=N to test forking scenarios
        if (chainparams.MineBlocksOnDemand())
            pblock->nVersion = GetArg("-blockversion", pblock->nVersion);

        int64_t nLockTimeCutoff = (STANDARD_LOCKTIME_VERIFY_FLAGS & LOCKTIME_MEDIAN_TIME_PAST)
                                ? nMedianTimePast
                                : pblock->GetBlockTime();

        bool fPriorityBlock = nBlockPrioritySize > 0;
        if (fPriorityBlock) {
            vecPriority.reserve(mempool.mapTx.size());
            for (CTxMemPool::indexed_transaction_set::iterator mi = mempool.mapTx.begin();
                 mi != mempool.mapTx.end(); ++mi)
            {
                double dPriority = mi->GetPriority(nHeight);
                CAmount dummy;
                mempool.ApplyDeltas(mi->GetTx().GetHash(), dPriority, dummy);
                vecPriority.push_back(TxCoinAgePriority(dPriority, mi));
            }
            std::make_heap(vecPriority.begin(), vecPriority.end(), pricomparer);
        }

        CTxMemPool::indexed_transaction_set::nth_index<3>::type::iterator mi = mempool.mapTx.get<3>().begin();
        CTxMemPool::txiter iter;

        while (mi != mempool.mapTx.get<3>().end() || !clearedTxs.empty())
        {
            bool priorityTx = false;
            if (fPriorityBlock && !vecPriority.empty()) { // add a tx from priority queue to fill the blockprioritysize
                priorityTx = true;
                iter = vecPriority.front().second;
                actualPriority = vecPriority.front().first;
                std::pop_heap(vecPriority.begin(), vecPriority.end(), pricomparer);
                vecPriority.pop_back();
            }
            else if (clearedTxs.empty()) { // add tx with next highest score
                iter = mempool.mapTx.project<0>(mi);
                mi++;
            }
            else {  // try to add a previously postponed child tx
                iter = clearedTxs.top();
                clearedTxs.pop();
            }

            if (inBlock.count(iter))
                continue; // could have been added to the priorityBlock

            const CTransaction& tx = iter->GetTx();

            bool fOrphan = false;
            BOOST_FOREACH(CTxMemPool::txiter parent, mempool.GetMemPoolParents(iter))
            {
                if (!inBlock.count(parent)) {
                    fOrphan = true;
                    break;
                }
            }
            if (fOrphan) {
                if (priorityTx)
                    waitPriMap.insert(std::make_pair(iter,actualPriority));
                else
                    waitSet.insert(iter);
                continue;
            }

            unsigned int nTxSize = iter->GetTxSize();
            if (fPriorityBlock &&
                (nBlockSize + nTxSize >= nBlockPrioritySize || !AllowFree(actualPriority))) {
                fPriorityBlock = false;
                waitPriMap.clear();
            }
            if (!priorityTx &&
                (iter->GetModifiedFee() < ::minRelayTxFee.GetFee(nTxSize) && nBlockSize >= nBlockMinSize)) {
                break;
            }
            if (nBlockSize + nTxSize >= nBlockMaxSize) {
                if (nBlockSize >  nBlockMaxSize - 100 || lastFewTxs > 50) {
                    break;
                }
                // Once we're within 1000 bytes of a full block, only look at 50 more txs
                // to try to fill the remaining space.
                if (nBlockSize > nBlockMaxSize - 1000) {
                    lastFewTxs++;
                }
                continue;
            }

            if (!IsFinalTx(tx, nHeight, nLockTimeCutoff))
                continue;

            unsigned int nTxSigOps = iter->GetSigOpCount();
            if (nBlockSigOps + nTxSigOps >= MAX_BLOCK_SIGOPS) {
                if (nBlockSigOps > MAX_BLOCK_SIGOPS - 2) {
                    break;
                }
                continue;
            }

            CAmount nTxFees = iter->GetFee();
            // Added
            pblock->vtx.push_back(tx);
            pblocktemplate->vTxFees.push_back(nTxFees);
            pblocktemplate->vTxSigOps.push_back(nTxSigOps);
            nBlockSize += nTxSize;
            ++nBlockTx;
            nBlockSigOps += nTxSigOps;
            nFees += nTxFees;

            if (fPrintPriority) // 打印优先级
            {
                double dPriority = iter->GetPriority(nHeight);
                CAmount dummy;
                mempool.ApplyDeltas(tx.GetHash(), dPriority, dummy);
                LogPrintf("priority %.1f fee %s txid %s\n",
                          dPriority , CFeeRate(iter->GetModifiedFee(), nTxSize).ToString(), tx.GetHash().ToString());
            }

            inBlock.insert(iter);

            // Add transactions that depend on this one to the priority queue
            BOOST_FOREACH(CTxMemPool::txiter child, mempool.GetMemPoolChildren(iter))
            {
                if (fPriorityBlock) {
                    waitPriIter wpiter = waitPriMap.find(child);
                    if (wpiter != waitPriMap.end()) {
                        vecPriority.push_back(TxCoinAgePriority(wpiter->second,child));
                        std::push_heap(vecPriority.begin(), vecPriority.end(), pricomparer);
                        waitPriMap.erase(wpiter);
                    }
                }
                else {
                    if (waitSet.count(child)) {
                        clearedTxs.push(child);
                        waitSet.erase(child);
                    }
                }
            }
        }
        nLastBlockTx = nBlockTx;
        nLastBlockSize = nBlockSize;
        LogPrintf("CreateNewBlock(): total size %u txs: %u fees: %ld sigops %d\n", nBlockSize, nBlockTx, nFees, nBlockSigOps);

        // Compute final coinbase transaction.
        txNew.vout[0].nValue = nFees + GetBlockSubsidy(nHeight, chainparams.GetConsensus()); // 计算创币交易输出值（区块奖励），通过当前区块高度和共识
        txNew.vin[0].scriptSig = CScript() << nHeight << OP_0; // 导入该交易输入的签名脚本，新区快的高度，OP_0 表示一个字节空串被推入栈
        pblock->vtx[0] = txNew; // 放入创币交易
        pblocktemplate->vTxFees[0] = -nFees; // 计算交易手续费，为 0

        // Fill in header
        pblock->hashPrevBlock  = pindexPrev->GetBlockHash(); // 获取父区块哈希
        UpdateTime(pblock, chainparams.GetConsensus(), pindexPrev); 
        pblock->nBits          = GetNextWorkRequired(pindexPrev, pblock, chainparams.GetConsensus()); // 获取难度对应值
        pblock->nNonce         = 0; // 随机数置 0，即从 0 开始找块
        pblocktemplate->vTxSigOps[0] = GetLegacySigOpCount(pblock->vtx[0]); // 获取创币交易签名操作数

        CValidationState state;
        if (!TestBlockValidity(state, chainparams, *pblock, pindexPrev, false, false)) {
            throw std::runtime_error(strprintf("%s: TestBlockValidity failed: %s", __func__, FormatStateMessage(state)));
        }
    }

    return pblocktemplate.release();
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#generate)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
