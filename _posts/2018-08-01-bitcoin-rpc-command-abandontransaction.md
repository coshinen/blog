---
layout: post
title:  "比特币 RPC 命令剖析 \"abandontransaction\""
date:   2018-08-01 08:52:41 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli abandontransaction "txid"
---
## 提示说明

{% highlight shell %}
abandontransaction "txid" # 标记钱包交易 <txid> 为已放弃
{% endhighlight %}

该操作将标记指定交易和其所有钱包后裔为已放弃，将允许它们的输入被重新花费。<br>
可用来代替“卡住”或被驱逐的交易。<br>
仅适用于未包含在区块中且当前不在交易内存池中的交易。<br>
对已发生冲突和已放弃的交易无影响。

参数：<br>
1. txid （字符串，必备）交易索引。

结果：无返回值。

## 用法示例

### 比特币核心客户端

{% highlight shell %}
$ bitcoin-cli abandontransaction <txid>
暂无。
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "abandontransaction", "params": ["txid"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
暂无。
{% endhighlight %}

## 源码剖析
abandontransaction 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue abandontransaction(const UniValue& params, bool fHelp); // 抛弃钱包内的交易
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue abandontransaction(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;

    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "abandontransaction \"txid\"\n"
            "\nMark in-wallet transaction <txid> as abandoned\n"
            "This will mark this transaction and all its in-wallet descendants as abandoned which will allow\n"
            "for their inputs to be respent.  It can be used to replace \"stuck\" or evicted transactions.\n"
            "It only works on transactions which are not included in a block and are not currently in the mempool.\n"
            "It has no effect on transactions which are already conflicted or abandoned.\n"
            "\nArguments:\n"
            "1. \"txid\"    (string, required) The transaction id\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("abandontransaction", "\"1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\"")
            + HelpExampleRpc("abandontransaction", "\"1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 上锁

    uint256 hash;
    hash.SetHex(params[0].get_str()); // 获取交易索引

    if (!pwalletMain->mapWallet.count(hash)) // 检查指定交易是否在钱包中
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid or non-wallet transaction id");
    if (!pwalletMain->AbandonTransaction(hash)) // 标记该钱包交易为已抛弃
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Transaction not eligible for abandonment");

    return NullUniValue; // 返回空
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定交易索引构建 uint256 对象。<br>
5.检查指定交易是否在钱包中。<br>
6.标记指定交易为已抛弃。

第一步，调用 EnsureWalletIsAvailable(fHelp) 函数检查当前钱包是否初始化完成。<br>
该函数实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
bool EnsureWalletIsAvailable(bool avoidException)
{
    if (!pwalletMain) // 若当前钱包未创建
    {
        if (!avoidException)
            throw JSONRPCError(RPC_METHOD_NOT_FOUND, "Method not found (disabled)");
        else
            return false;
    }
    return true; // 钱包创建了直接返回 true
}
{% endhighlight %}

第五步，钱包交易映射对象 pwalletMain->mapWallet 定义在“wallet.h”文件的 CWallet 类中。<br>
第六步，调用 pwalletMain->AbandonTransaction(hash) 函数标记该钱包交易为以抛弃，该函数声明在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    std::map<uint256, CWalletTx> mapWallet; // 钱包映射 <交易索引， 钱包交易>
    ...
    /* Mark a transaction (and it in-wallet descendants) as abandoned so its inputs may be respent. */
    bool AbandonTransaction(const uint256& hashTx); // 标记一笔交易（及其钱包后裔）为以抛弃，以至于它的输入被重新关注
};
{% endhighlight %}

实现在“wallet.cpp”文件中。

{% highlight C++ %}
bool CWallet::AbandonTransaction(const uint256& hashTx)
{
    LOCK2(cs_main, cs_wallet); // 上锁

    // Do not flush the wallet here for performance reasons
    CWalletDB walletdb(strWalletFile, "r+", false); // 因为性能原因不要在这里刷新钱包

    std::set<uint256> todo; // 待办列表
    std::set<uint256> done; // 已完成列表

    // Can't mark abandoned if confirmed or in mempool // 若已确认或在内存池中的交易则无法标记已抛弃
    assert(mapWallet.count(hashTx)); // 检查交易是否在钱包中
    CWalletTx& origtx = mapWallet[hashTx]; // 获取指定的钱包交易
    if (origtx.GetDepthInMainChain() > 0 || origtx.InMempool()) { // 交易所在区块深度大于 0 （该交易已上链）或该交易在内存池中
        return false;
    }

    todo.insert(hashTx); // 插入待办列表

    while (!todo.empty()) { // 待办列表非空
        uint256 now = *todo.begin(); // 取出待办列表的第一项
        todo.erase(now);
        done.insert(now); // 插入已完成列表
        assert(mapWallet.count(now));
        CWalletTx& wtx = mapWallet[now]; // 获取对应的钱包交易
        int currentconfirm = wtx.GetDepthInMainChain(); // 获取该交易所在区块在链上的深度作为确认数
        // If the orig tx was not in block, none of its spends can be
        assert(currentconfirm <= 0);
        // if (currentconfirm < 0) {Tx and spends are already conflicted, no need to abandon}
        if (currentconfirm == 0 && !wtx.isAbandoned()) { // 当前确认为 0 且钱包交易未标记已抛弃
            // If the orig tx was not in block/mempool, none of its spends can be in mempool // 它的所有花费都不在内存池中
            assert(!wtx.InMempool()); // 钱包交易不在内存池中
            wtx.nIndex = -1;
            wtx.setAbandoned(); // 把钱包交易标记为已抛弃
            wtx.MarkDirty(); // 标记该交易已变动
            wtx.WriteToDisk(&walletdb); // 写入钱包数据库
            NotifyTransactionChanged(this, wtx.GetHash(), CT_UPDATED);
            // Iterate over all its outputs, and mark transactions in the wallet that spend them abandoned too // 遍历它所有的输出，并标记钱包中的交易为已抛弃
            TxSpends::const_iterator iter = mapTxSpends.lower_bound(COutPoint(hashTx, 0));
            while (iter != mapTxSpends.end() && iter->first.hash == now) { // 遍历交易花费映射，且全部为该交易的输出
                if (!done.count(iter->second)) { // 对应交易若不在已完成列表
                    todo.insert(iter->second); // 把该交易加入待办列表
                }
                iter++;
            }
            // If a transaction changes 'conflicted' state, that changes the balance // 如果交易改变“冲突”状态，会改变其输出花费的可用余额。
            // available of the outputs it spends. So force those to be recomputed // 所以强制重新计算。
            BOOST_FOREACH(const CTxIn& txin, wtx.vin)
            {
                if (mapWallet.count(txin.prevout.hash)) // 若前一笔交易的在钱包中
                    mapWallet[txin.prevout.hash].MarkDirty(); // 把该交易索引对应的钱包交易标记为已改变
            }
        }
    }

    return true;
}
{% endhighlight %}

调用 origtx.GetDepthInMainChain() 和 origtx.InMempool() 函数，它们均实现在“wallet.cpp”文件中。

{% highlight C++ %}
bool CWalletTx::InMempool() const
{
    LOCK(mempool.cs);
    if (mempool.exists(GetHash())) {
        return true;
    }
    return false;
}
...
int CMerkleTx::GetDepthInMainChain(const CBlockIndex* &pindexRet) const
{
    if (hashUnset()) // 判断该区块的有效性
        return 0;

    AssertLockHeld(cs_main); // 验证锁状态

    // Find the block it claims to be in // 找到该交易声明在的区块
    BlockMap::iterator mi = mapBlockIndex.find(hashBlock); // 获取对应区块的迭代器
    if (mi == mapBlockIndex.end()) // 若没找到，则返回 0
        return 0;
    CBlockIndex* pindex = (*mi).second; // 获取区块索引
    if (!pindex || !chainActive.Contains(pindex)) // 检查该区块是否在激活主链上
        return 0;

    pindexRet = pindex;
    return ((nIndex == -1) ? (-1) : 1) * (chainActive.Height() - pindex->nHeight + 1); // 返回深度，链尖的深度为 1
}
{% endhighlight %}

函数 mempool.exists(GetHash()) 定义在“txmempool.h”文件的 CTxMemPool 类中。

{% highlight C++ %}
/**
 * CTxMemPool stores valid-according-to-the-current-best-chain
 * transactions that may be included in the next block.
 *
 * Transactions are added when they are seen on the network
 * (or created by the local node), but not all transactions seen
 * are added to the pool: if a new transaction double-spends
 * an input of a transaction in the pool, it is dropped,
 * as are non-standard transactions.
 *
 * CTxMemPool::mapTx, and CTxMemPoolEntry bookkeeping:
 *
 * mapTx is a boost::multi_index that sorts the mempool on 4 criteria:
 * - transaction hash
 * - feerate [we use max(feerate of tx, feerate of tx with all descendants)]
 * - time in mempool
 * - mining score (feerate modified by any fee deltas from PrioritiseTransaction)
 *
 * Note: the term "descendant" refers to in-mempool transactions that depend on
 * this one, while "ancestor" refers to in-mempool transactions that a given
 * transaction depends on.
 *
 * In order for the feerate sort to remain correct, we must update transactions
 * in the mempool when new descendants arrive.  To facilitate this, we track
 * the set of in-mempool direct parents and direct children in mapLinks.  Within
 * each CTxMemPoolEntry, we track the size and fees of all descendants.
 *
 * Usually when a new transaction is added to the mempool, it has no in-mempool
 * children (because any such children would be an orphan).  So in
 * addUnchecked(), we:
 * - update a new entry's setMemPoolParents to include all in-mempool parents
 * - update the new entry's direct parents to include the new tx as a child
 * - update all ancestors of the transaction to include the new tx's size/fee
 *
 * When a transaction is removed from the mempool, we must:
 * - update all in-mempool parents to not track the tx in setMemPoolChildren
 * - update all ancestors to not include the tx's size/fees in descendant state
 * - update all in-mempool children to not include it as a parent
 *
 * These happen in UpdateForRemoveFromMempool().  (Note that when removing a
 * transaction along with its descendants, we must calculate that set of
 * transactions to be removed before doing the removal, or else the mempool can
 * be in an inconsistent state where it's impossible to walk the ancestors of
 * a transaction.)
 *
 * In the event of a reorg, the assumption that a newly added tx has no
 * in-mempool children is false.  In particular, the mempool is in an
 * inconsistent state while new transactions are being added, because there may
 * be descendant transactions of a tx coming from a disconnected block that are
 * unreachable from just looking at transactions in the mempool (the linking
 * transactions may also be in the disconnected block, waiting to be added).
 * Because of this, there's not much benefit in trying to search for in-mempool
 * children in addUnchecked().  Instead, in the special case of transactions
 * being added from a disconnected block, we require the caller to clean up the
 * state, to account for in-mempool, out-of-block descendants for all the
 * in-block transactions by calling UpdateTransactionsFromBlock().  Note that
 * until this is called, the mempool state is not consistent, and in particular
 * mapLinks may not be correct (and therefore functions like
 * CalculateMemPoolAncestors() and CalculateDescendants() that rely
 * on them to walk the mempool are not generally safe to use).
 *
 * Computational limits:
 *
 * Updating all in-mempool ancestors of a newly added transaction can be slow,
 * if no bound exists on how many in-mempool ancestors there may be.
 * CalculateMemPoolAncestors() takes configurable limits that are designed to
 * prevent these calculations from being too CPU intensive.
 *
 * Adding transactions from a disconnected block can be very time consuming,
 * because we don't have a way to limit the number of in-mempool descendants.
 * To bound CPU processing, we limit the amount of work we're willing to do
 * to properly update the descendant information for a tx being added from
 * a disconnected block.  If we would exceed the limit, then we instead mark
 * the entry as "dirty", and set the feerate for sorting purposes to be equal
 * the feerate of the transaction without any descendants.
 *
 */ // CTxMemPool 存储可能包含在下一个区块的基于当前最佳链的有效交易。
class CTxMemPool
{
    ...
    bool exists(uint256 hash) const
    {
        LOCK(cs);
        return (mapTx.count(hash) != 0);
    }
    ...
};
{% endhighlight %}

下面是一些相关函数的定义，在“wallet.h”文件的 CMerkleTx 类中。

{% highlight C++ %}
/** A transaction with a merkle branch linking it to the block chain. */
class CMerkleTx : public CTransaction // 一个连接它到区块链的默克分支交易
{
    ...
    bool hashUnset() const { return (hashBlock.IsNull() || hashBlock == ABANDON_HASH); } // 哈希未设置（为空或已抛弃的哈希）
    bool isAbandoned() const { return (hashBlock == ABANDON_HASH); } // 该交易是否标记为已抛弃
    void setAbandoned() { hashBlock = ABANDON_HASH; } // 标记该交易为已抛弃
};
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#abandontransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
