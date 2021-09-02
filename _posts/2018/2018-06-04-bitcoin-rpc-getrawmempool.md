---
layout: post
title:  "比特币 RPC 命令「getrawmempool」"
date:   2018-06-04 20:55:31 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getrawmempool
getrawmempool ( verbose )

以一个字符串交易索引的 json 数组的形式返回内存池中所有交易索引。

参数：
1. verbose（布尔型，可选，默认为 false）true 为一个 json 对象，false 为交易索引的数组

结果（verbose 为 false）：
[                          （字符串的 json 数组）
  "transactionid"          （字符串）交易索引
  ,...
]

结果（verbose 为 true）：
{                          （json 对象）
  "transactionid" : {      （json 对象）
    "size" : n,            （数字）以字节为单位的交易大小
    "fee" : n,             （数字）以 BTC 为单位的交易费
    "modifiedfee" : n,     （数字）具有用于挖矿优先级的费用增量的交易费
    "time" : n,            （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易进入内存池的本地时间
    "height" : n,          （数字）交易进入内存池时的区块高度
    "startingpriority" : n,（数字）交易进入内存池时的优先级
    "currentpriority" : n, （数字）交易现在的优先级
    "descendantcount" : n, （数字）内存池中子交易的数量（含该交易）
    "descendantsize" : n,  （数字）内存池中子交易的大小（含该交易）
    "descendantfees" : n,  （数字）内存池中子交易的修改费（含该交易）
    "depends" : [          （数组）用作该交易输入的未确认的交易
        "transactionid",   （字符串）父交易索引
       ... ]
  }, ...
}

例子：
> bitcoin-cli getrawmempool true
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawmempool", "params": [true] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getrawmempool` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getrawmempool(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getrawmempool(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 1)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);

    bool fVerbose = false;
    if (params.size() > 0)
        fVerbose = params[0].get_bool();

    return mempoolToJSON(fVerbose); // 2. 把内存池的交易打包为 JSON 格式并返回
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 把内存池的交易打包为 JSON 格式并返回

函数 `mempoolToJSON(fVerbose)` 实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue mempoolToJSON(bool fVerbose = false)
{
    if (fVerbose)
    {
        LOCK(mempool.cs);
        UniValue o(UniValue::VOBJ);
        BOOST_FOREACH(const CTxMemPoolEntry& e, mempool.mapTx)
        { // 遍历内存池中的交易列表
            const uint256& hash = e.GetTx().GetHash();
            UniValue info(UniValue::VOBJ);
            info.push_back(Pair("size", (int)e.GetTxSize())); // 交易大小
            info.push_back(Pair("fee", ValueFromAmount(e.GetFee()))); // 交易费
            info.push_back(Pair("modifiedfee", ValueFromAmount(e.GetModifiedFee()))); // 修改的费用
            info.push_back(Pair("time", e.GetTime())); // 时间
            info.push_back(Pair("height", (int)e.GetHeight())); // 区块高度
            info.push_back(Pair("startingpriority", e.GetPriority(e.GetHeight()))); // 进入内存池时的优先级
            info.push_back(Pair("currentpriority", e.GetPriority(chainActive.Height()))); // 目前的优先级
            info.push_back(Pair("descendantcount", e.GetCountWithDescendants())); // 子交易的数量
            info.push_back(Pair("descendantsize", e.GetSizeWithDescendants())); // 子交易的大小
            info.push_back(Pair("descendantfees", e.GetModFeesWithDescendants())); // 子交易的修改费
            const CTransaction& tx = e.GetTx();
            set<string> setDepends; // 用作交易输入的为确认的交易输出
            BOOST_FOREACH(const CTxIn& txin, tx.vin)
            {
                if (mempool.exists(txin.prevout.hash))
                    setDepends.insert(txin.prevout.hash.ToString());
            }

            UniValue depends(UniValue::VARR);
            BOOST_FOREACH(const string& dep, setDepends)
            {
                depends.push_back(dep);
            }

            info.push_back(Pair("depends", depends));
            o.push_back(Pair(hash.ToString(), info));
        }
        return o;
    }
    else
    {
        vector<uint256> vtxid;
        mempool.queryHashes(vtxid); // 查询交易池中的交易哈希

        UniValue a(UniValue::VARR);
        BOOST_FOREACH(const uint256& hash, vtxid)
            a.push_back(hash.ToString());

        return a;
    }
}
```

交易内存池对象 `mempool` 定义在文件 `main.cpp` 中。

```cpp
/** Fees smaller than this (in satoshi) are considered zero fee (for relaying, mining and transaction creation) */
CFeeRate minRelayTxFee = CFeeRate(DEFAULT_MIN_RELAY_TX_FEE); // 小于该值的费用（以聪为单位）被认为是 0 费用（用于中继、挖矿和交易创建）

CTxMemPool mempool(::minRelayTxFee);
```

默认的最低中继交易费 `DEFAULT_MIN_RELAY_TX_FEE` 定义在文件 `main.h` 中，默认为 1000 聪。

```cpp
/** Default for -minrelaytxfee, minimum relay fee for transactions */
static const unsigned int DEFAULT_MIN_RELAY_TX_FEE = 1000; // 默认值为 -minrelaytxfee，最低的中继交易费
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
