---
layout: post
title:  "比特币 RPC 命令剖析 \"prioritisetransaction\""
date:   2018-05-28 09:25:05 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin bitcoin-cli commands
excerpt: $ bitcoin-cli prioritisetransaction <txid> <priority delta> <fee delta>
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
prioritisetransaction <txid> <priority delta> <fee delta> # 改变交易内存池中一笔交易的优先级
{% endhighlight %}

**该优先级用于接收交易进入被挖的区块。**

参数：<br>
1. `txid` （字符串，必备）交易索引（16 进制形式）。<br>
2. `priority delta` （数字，浮点型，必备）增加或减少优先级。交易选择算法认为指定交易 `tx` 会有更高优先级。（交易优先级计算：coinage * value_in_satoshis / txsize）<br>
3. `fee delta` （数字，整型，必备）增加（或减少，若为负值）该费用（单位：satoshis）。该费用实际上没有花费，仅仅是选择交易进入一个区块的算法把该交易作为其将支付更高（或更低）的费用。

结果：（布尔型）返回 true。

## 用法示例

### 比特币核心客户端

{% highlight shell %}
$ bitcoin-cli getrawmempool
[
  "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67"
]
$ bitcoin-cli prioritisetransaction fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67
true
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "prioritisetransaction", "params": ["fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67", 0.0, 10000] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":true,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`prioritisetransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue prioritisetransaction(const UniValue& params, bool fHelp); // 设置交易的优先级
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
// NOTE: Unlike wallet RPC (which use BTC values), mining RPCs follow GBT (BIP 22) in using satoshi amounts
UniValue prioritisetransaction(const UniValue& params, bool fHelp) // 注：与钱包 RPC （使用 BTC）不同，挖矿 RPC 使用 satoshi 作为单位
{
    if (fHelp || params.size() != 3) // 必须为 3 个参数
        throw runtime_error( // 命令帮助反馈
            "prioritisetransaction <txid> <priority delta> <fee delta>\n"
            "Accepts the transaction into mined blocks at a higher (or lower) priority\n"
            "\nArguments:\n"
            "1. \"txid\"       (string, required) The transaction id.\n"
            "2. priority delta (numeric, required) The priority to add or subtract.\n"
            "                  The transaction selection algorithm considers the tx as it would have a higher priority.\n"
            "                  (priority of a transaction is calculated: coinage * value_in_satoshis / txsize) \n"
            "3. fee delta      (numeric, required) The fee value (in satoshis) to add (or subtract, if negative).\n"
            "                  The fee is not actually paid, only the algorithm for selecting transactions into a block\n"
            "                  considers the transaction as it would have paid a higher (or lower) fee.\n"
            "\nResult\n"
            "true              (boolean) Returns true\n"
            "\nExamples:\n"
            + HelpExampleCli("prioritisetransaction", "\"txid\" 0.0 10000")
            + HelpExampleRpc("prioritisetransaction", "\"txid\", 0.0, 10000")
        );

    LOCK(cs_main);

    uint256 hash = ParseHashStr(params[0].get_str(), "txid"); // 获取指定的交易哈希并创建 uint256 对象
    CAmount nAmount = params[2].get_int64(); // 获取交易金额

    mempool.PrioritiseTransaction(hash, params[0].get_str(), params[1].get_real(), nAmount); // 调整指定交易优先级
    return true;
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取交易索引和指定交易费，创建相应对象。<br>
4.改变交易内存池中交易的优先级。

第四步，函数 mempool.PrioritiseTransaction(hash, params[0].get_str(), params[1].get_real(), nAmount) 声明在“txmempool.h”文件的 CTxMemPool 类中。

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
    /** Affect CreateNewBlock prioritisation of transactions */ // 调整 CreateNewBlock 时交易的优先级
    void PrioritiseTransaction(const uint256 hash, const std::string strHash, double dPriorityDelta, const CAmount& nFeeDelta);
    ...
};
{% endhighlight %}

实现在“txmempool.cpp”文件中。

{% highlight C++ %}
void CTxMemPool::PrioritiseTransaction(const uint256 hash, const string strHash, double dPriorityDelta, const CAmount& nFeeDelta)
{
    {
        LOCK(cs); // 上锁
        std::pair<double, CAmount> &deltas = mapDeltas[hash]; // 获取指定交易哈希对应优先级和交易费
        deltas.first += dPriorityDelta; // 增加优先级
        deltas.second += nFeeDelta; // 增加交易费
        txiter it = mapTx.find(hash);
        if (it != mapTx.end()) { // 若在交易映射中找到该交易
            mapTx.modify(it, update_fee_delta(deltas.second)); // 更新该交易的费用
            // Now update all ancestors' modified fees with descendants
            setEntries setAncestors; // 更新该交易所有的祖先交易的费用
            uint64_t nNoLimit = std::numeric_limits<uint64_t>::max();
            std::string dummy;
            CalculateMemPoolAncestors(*it, setAncestors, nNoLimit, nNoLimit, nNoLimit, nNoLimit, dummy, false); // 计算交易内存池中该交易的祖先
            BOOST_FOREACH(txiter ancestorIt, setAncestors) { // 遍历祖先交易
                mapTx.modify(ancestorIt, update_descendant_state(0, nFeeDelta, 0)); // 更新交易费用
            }
        }
    }
    LogPrintf("PrioritiseTransaction: %s priority += %f, fee += %d\n", strHash, dPriorityDelta, FormatMoney(nFeeDelta));
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#prioritisetransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
