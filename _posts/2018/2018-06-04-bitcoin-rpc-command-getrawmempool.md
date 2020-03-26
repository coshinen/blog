---
layout: post
title:  "比特币 RPC 命令剖析 \"getrawmempool\""
date:   2018-06-04 16:55:31 +0800
author: mistydew
comments: true
categories: 区块链
tags: CLI bitcoin-cli Blockchain Bitcoin
excerpt: $ bitcoin-cli getrawmempool ( verbose )
---
## 提示说明

```shell
getrawmempool ( verbose ) # 获取内存池中所有交易索引作为一个交易索引字符串的 json 数组
```

参数：<br>
1.verbose（布尔型，可选，默认为 false）true 返回 json 对象，false 返回交易索引的数组。

结果：（verbose 为 false）<br>
```shell
[                     （字符串 json 数组）
  "transactionid"     （字符串）交易索引
  ,...
]
```

结果：（verbose 为 true）<br>
```shell
{                           （json 对象）
  "transactionid" : {       （json 对象）
    "size" : n,             （数字）以字节为单位的交易大小
    "fee" : n,              （数字）以 BTC 为单位的交易费
    "modifiedfee" : n,      （数字）用于挖矿优先级的交易费增量
    "time" : n,             （数字）交易进入内存池的本地时间（从格林尼治时间 1970-01-01 00:00:00 开始）
    "height" : n,           （数字）交易进入内存池时的区块高度
    "startingpriority" : n, （数字）交易进入内存池时的优先级
    "currentpriority" : n,  （数字）现在的交易优先级
    "descendantcount" : n,  （数字）内存池中该交易后代的数量（包含该交易）
    "descendantsize" : n,   （数字）内存池中该交易后代的大小（包含该交易）
    "descendantfees" : n,   （数字）内存池中该交易后代修改的交易费（见上，包含该交易）
    "depends" : [           （数组）用作该交易输入的未确认的交易
        "transactionid",    （字符串）父交易索引
       ... ]
  }, ...
}
```

## 用法示例

### 比特币核心客户端

用法一：获取当前交易内存池中所有交易索引。

```shell
$ bitcoin-cli getrawmempool
[
  "b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f", 
  "fb61a61c6cc7b37cd0afd2152a77fa894d82629971c77e11d00e9aed1cd03dfc"
]
```

用法二：设置 verbose 为 false，获取当前交易内存池中所有交易索引。

```shell
$ bitcoin-cli getrawmempool false
... # 结果同上
```

用法三：设置 verbose 为 true，获取交易内存池中所有交易的详细信息。

```shell
$ bitcoin-cli getrawmempool true
{
  "b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f": {
    "size": 191,
    "fee": 0.00003840,
    "modifiedfee": 0.00003840,
    "time": 1529912960,
    "height": 24386,
    "startingpriority": 300384615384.6154,
    "currentpriority": 301858974358.9743,
    "descendantcount": 1,
    "descendantsize": 191,
    "descendantfees": 3840,
    "depends": [
    ]
  },
  "fb61a61c6cc7b37cd0afd2152a77fa894d82629971c77e11d00e9aed1cd03dfc": {
    "size": 191,
    "fee": 0.00003840,
    "modifiedfee": 0.00003840,
    "time": 1529912966,
    "height": 24386,
    "startingpriority": 300448717948.718,
    "currentpriority": 301923076923.0769,
    "descendantcount": 1,
    "descendantsize": 191,
    "descendantfees": 3840,
    "depends": [
    ]
  }
}
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawmempool", "params": [false] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f", "fb61a61c6cc7b37cd0afd2152a77fa894d82629971c77e11d00e9aed1cd03dfc"},"error":null,"id":"curltest"}
```

## 源码剖析
getrawmempool 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getrawmempool(const UniValue& params, bool fHelp); // 获取交易内存池元信息（交易索引）
```

实现在“rpcblockchain.cpp”文件中。

```cpp
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
```

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取指定的详细标志。<br>
4.打包交易内存池交易信息为 JSON 格式并返回。

第四步，调用  函数打包交易内存池内交易数据至 JSON 格式，该函数实现在“rpcblockchain.cpp”文件中。

```cpp
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
```

交易内存池对象 mempool 定义在“main.cpp”文件中。

```cpp
/** Fees smaller than this (in satoshi) are considered zero fee (for relaying, mining and transaction creation) */ // 小于词费用（单位为 satoshi）被当作 0 费用（用于中继，挖矿和创建交易）
CFeeRate minRelayTxFee = CFeeRate(DEFAULT_MIN_RELAY_TX_FEE); // 最小中继交易费

CTxMemPool mempool(::minRelayTxFee); // 交易内存池全局对象，通过最小中继交易费创建
```

DEFAULT_MIN_RELAY_TX_FEE 定义在“main.h”文件中，默认为 1000 satoshi。

```cpp
/** Default for -minrelaytxfee, minimum relay fee for transactions */
static const unsigned int DEFAULT_MIN_RELAY_TX_FEE = 1000; // 默认最小中继交易费，默认 1000 satoshi
```

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getrawmempool){:target="_blank"}
