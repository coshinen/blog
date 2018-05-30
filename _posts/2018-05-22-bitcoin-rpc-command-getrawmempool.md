---
layout: post
title:  "比特币 RPC 命令剖析 \"getrawmempool\""
date:   2018-05-22 16:55:31 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getrawmempool ( verbose ) # 获取交易内存池中所有交易索引作为一个交易索引字符串的 json 数组
{% endhighlight %}

参数：<br>
1. `verbose` （布尔型，可选，默认为 false）true 返回 json 对象，false 返回交易索引的数组。

结果：（verbose 为 false）<br>
{% highlight shell %}
[                     (json array of string)
  "transactionid"     (string) The transaction id
  ,...
]
{% endhighlight %}

结果：（verbose 为 true）<br>
{% highlight shell %}
{                           (json object)
  "transactionid" : {       (json object)
    "size" : n,             (numeric) transaction size in bytes
    "fee" : n,              (numeric) transaction fee in BTC
    "modifiedfee" : n,      (numeric) transaction fee with fee deltas used for mining priority
    "time" : n,             (numeric) local time transaction entered pool in seconds since 1 Jan 1970 GMT
    "height" : n,           (numeric) block height when transaction entered pool
    "startingpriority" : n, (numeric) priority when transaction entered pool
    "currentpriority" : n,  (numeric) transaction priority now
    "descendantcount" : n,  (numeric) number of in-mempool descendant transactions (including this one)
    "descendantsize" : n,   (numeric) size of in-mempool descendants (including this one)
    "descendantfees" : n,   (numeric) modified fees (see above) of in-mempool descendants (including this one)
    "depends" : [           (array) unconfirmed transactions used as inputs for this transaction
        "transactionid",    (string) parent transaction id
       ... ]
  }, ...
}
{% endhighlight %}

## 用法示例

用法一：获取当前交易内存池中所有交易的索引。

{% highlight shell %}
$ bitcoin-cli getrawmempool
[
  "7dded7989a681fc4dd9e9639386f9a2c661ec810f797bf5714d2849b4982421c", 
  "27ca08a5fc8fb64f86f209b890197df4a54af6c1f82db41d208460aba3e78b3c"
]
{% endhighlight %}

用法二：同上。

{% highlight shell %}
$ bitcoin-cli getrawmempool false
[
  "7dded7989a681fc4dd9e9639386f9a2c661ec810f797bf5714d2849b4982421c", 
  "27ca08a5fc8fb64f86f209b890197df4a54af6c1f82db41d208460aba3e78b3c"
]
{% endhighlight %}

用法三：获取交易内存池中所有交易的详细信息。

{% highlight shell %}
$ bitcoin-cli getrawmempool true
{
  "7dded7989a681fc4dd9e9639386f9a2c661ec810f797bf5714d2849b4982421c": {
    "size": 225,
    "fee": 0.00000225,
    "modifiedfee": 0.00000225,
    "time": 1527661668,
    "height": 47021,
    "startingpriority": 238522855692.9231,
    "currentpriority": 238522855692.9231,
    "descendantcount": 1,
    "descendantsize": 225,
    "descendantfees": 225,
    "depends": [
    ]
  },
  "27ca08a5fc8fb64f86f209b890197df4a54af6c1f82db41d208460aba3e78b3c": {
    "size": 225,
    "fee": 0.00000225,
    "modifiedfee": 0.00000225,
    "time": 1527661666,
    "height": 47021,
    "startingpriority": 232559644302.4615,
    "currentpriority": 232559644302.4615,
    "descendantcount": 1,
    "descendantsize": 225,
    "descendantfees": 225,
    "depends": [
    ]
  }
}
{% endhighlight %}

## 源码剖析
`getrawmempool` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getrawmempool(const UniValue& params, bool fHelp); // 获取交易内存池元信息（交易索引）
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue getrawmempool(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 1) // 参数至多为 1 个
        throw runtime_error( // 命令帮助反馈
            "getrawmempool ( verbose )\n"
            "\nReturns all transaction ids in memory pool as a json array of string transaction ids.\n"
            "\nArguments:\n"
            "1. verbose           (boolean, optional, default=false) true for a json object, false for array of transaction ids\n"
            "\nResult: (for verbose = false):\n"
            "[                     (json array of string)\n"
            "  \"transactionid\"     (string) The transaction id\n"
            "  ,...\n"
            "]\n"
            "\nResult: (for verbose = true):\n"
            "{                           (json object)\n"
            "  \"transactionid\" : {       (json object)\n"
            "    \"size\" : n,             (numeric) transaction size in bytes\n"
            "    \"fee\" : n,              (numeric) transaction fee in " + CURRENCY_UNIT + "\n"
            "    \"modifiedfee\" : n,      (numeric) transaction fee with fee deltas used for mining priority\n"
            "    \"time\" : n,             (numeric) local time transaction entered pool in seconds since 1 Jan 1970 GMT\n"
            "    \"height\" : n,           (numeric) block height when transaction entered pool\n"
            "    \"startingpriority\" : n, (numeric) priority when transaction entered pool\n"
            "    \"currentpriority\" : n,  (numeric) transaction priority now\n"
            "    \"descendantcount\" : n,  (numeric) number of in-mempool descendant transactions (including this one)\n"
            "    \"descendantsize\" : n,   (numeric) size of in-mempool descendants (including this one)\n"
            "    \"descendantfees\" : n,   (numeric) modified fees (see above) of in-mempool descendants (including this one)\n"
            "    \"depends\" : [           (array) unconfirmed transactions used as inputs for this transaction\n"
            "        \"transactionid\",    (string) parent transaction id\n"
            "       ... ]\n"
            "  }, ...\n"
            "}\n"
            "\nExamples\n"
            + HelpExampleCli("getrawmempool", "true")
            + HelpExampleRpc("getrawmempool", "true")
        );

    LOCK(cs_main); // 上锁

    bool fVerbose = false; // 详细标志，默认为 false
    if (params.size() > 0)
        fVerbose = params[0].get_bool(); // 获取详细参数

    return mempoolToJSON(fVerbose); // 把内存池交易打包为 JSON 格式并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取指定的详细标志。<br>
4.打包交易内存池交易信息为 JSON 格式并返回。

第四步，调用  函数打包交易内存池内交易数据至 JSON 格式，该函数实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue mempoolToJSON(bool fVerbose = false)
{
    if (fVerbose)
    { // 打包交易详细信息
        LOCK(mempool.cs);
        UniValue o(UniValue::VOBJ);
        BOOST_FOREACH(const CTxMemPoolEntry& e, mempool.mapTx)
        { // 遍历获取交易池中的交易条目
            const uint256& hash = e.GetTx().GetHash();
            UniValue info(UniValue::VOBJ);
            info.push_back(Pair("size", (int)e.GetTxSize())); // 交易大小
            info.push_back(Pair("fee", ValueFromAmount(e.GetFee()))); // 交易费
            info.push_back(Pair("modifiedfee", ValueFromAmount(e.GetModifiedFee()))); // 修改的交易费
            info.push_back(Pair("time", e.GetTime())); // 当前时间
            info.push_back(Pair("height", (int)e.GetHeight())); // 当前区块高度
            info.push_back(Pair("startingpriority", e.GetPriority(e.GetHeight()))); // 起始优先级（通过链高度）
            info.push_back(Pair("currentpriority", e.GetPriority(chainActive.Height()))); // 当前优先级
            info.push_back(Pair("descendantcount", e.GetCountWithDescendants())); // 后裔数量
            info.push_back(Pair("descendantsize", e.GetSizeWithDescendants())); // 后裔大小
            info.push_back(Pair("descendantfees", e.GetModFeesWithDescendants())); // 后裔费用
            const CTransaction& tx = e.GetTx();
            set<string> setDepends; // 交易输入的依赖
            BOOST_FOREACH(const CTxIn& txin, tx.vin)
            {
                if (mempool.exists(txin.prevout.hash)) // 查询交易输入的输出哈希在内存池中是否存在
                    setDepends.insert(txin.prevout.hash.ToString()); // 加入依赖集合
            }

            UniValue depends(UniValue::VARR);
            BOOST_FOREACH(const string& dep, setDepends) // 构建依赖目标对象
            {
                depends.push_back(dep);
            }

            info.push_back(Pair("depends", depends)); // 加入交易依赖
            o.push_back(Pair(hash.ToString(), info)); // 交易索引 与 交易信息 配对
        }
        return o;
    }
    else
    { // 打包交易索引（哈希）
        vector<uint256> vtxid;
        mempool.queryHashes(vtxid); // 填充交易池中的交易哈希到 vtxid

        UniValue a(UniValue::VARR);
        BOOST_FOREACH(const uint256& hash, vtxid)
            a.push_back(hash.ToString());

        return a;
    }
}
{% endhighlight %}

交易内存池对象 mempool 定义在“main.cpp”文件中。

{% highlight C++ %}
/** Fees smaller than this (in satoshi) are considered zero fee (for relaying, mining and transaction creation) */ // 小于词费用（单位为 satoshi）被当作 0 费用（用于中继，挖矿和创建交易）
CFeeRate minRelayTxFee = CFeeRate(DEFAULT_MIN_RELAY_TX_FEE); // 最小中继交易费

CTxMemPool mempool(::minRelayTxFee); // 交易内存池全局对象，通过最小中继交易费创建
{% endhighlight %}

DEFAULT_MIN_RELAY_TX_FEE 定义在“main.h”文件中，默认为 1000 satoshi。

{% highlight C++ %}
/** Default for -minrelaytxfee, minimum relay fee for transactions */
static const unsigned int DEFAULT_MIN_RELAY_TX_FEE = 1000; // 默认最小中继交易费，默认 1000 satoshi
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getrawmempool)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
