---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxout\""
date:   2018-06-05 09:26:01 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli gettxout "txid" n ( includemempool )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help gettxout
gettxout "txid" n ( includemempool )

返回关于一笔未花费交易输出的细节。

参数：
1. txid          （字符串，必备）交易索引
2. n             （数字，必备）输出值
3. includemempool（布尔型，可选）是否在内存池中

结果：
{
  "bestblock" : "hash",    （字符串）区块哈希
  "confirmations" : n,     （数字）确认数
  "value" : x.xxx,         （数字）以 BTC 为单位的交易金额
  "scriptPubKey" : {       （json 对象）
     "asm" : "code",       （字符串）
     "hex" : "hex",        （字符串）
     "reqSigs" : n,        （数字）所需签名数
     "type" : "pubkeyhash",（字符串）类型，例 pubkeyhash
     "addresses" : [       （字符串数组）比特币地址数组
        "bitcoinaddress"   （字符串）比特币地址
        ,...
     ]
  },
  "version" : n,           （数字）版本
  "coinbase" : true|false  （布尔型）是创币交易或不是
}

例子：

获取未花费的交易
> bitcoin-cli listunspent

查看细节
> bitcoin-cli gettxout "txid" 1

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxout", "params": ["txid", 1] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`gettxout` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue gettxout(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue gettxout(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 3)
        throw runtime_error(
            "gettxout \"txid\" n ( includemempool )\n"
            "\nReturns details about an unspent transaction output.\n"
            "\nArguments:\n"
            "1. \"txid\"       (string, required) The transaction id\n"
            "2. n              (numeric, required) vout value\n"
            "3. includemempool  (boolean, optional) Whether to included the mem pool\n"
            "\nResult:\n"
            "{\n"
            "  \"bestblock\" : \"hash\",    (string) the block hash\n"
            "  \"confirmations\" : n,       (numeric) The number of confirmations\n"
            "  \"value\" : x.xxx,           (numeric) The transaction value in " + CURRENCY_UNIT + "\n"
            "  \"scriptPubKey\" : {         (json object)\n"
            "     \"asm\" : \"code\",       (string) \n"
            "     \"hex\" : \"hex\",        (string) \n"
            "     \"reqSigs\" : n,          (numeric) Number of required signatures\n"
            "     \"type\" : \"pubkeyhash\", (string) The type, eg pubkeyhash\n"
            "     \"addresses\" : [          (array of string) array of bitcoin addresses\n"
            "        \"bitcoinaddress\"     (string) bitcoin address\n"
            "        ,...\n"
            "     ]\n"
            "  },\n"
            "  \"version\" : n,            (numeric) The version\n"
            "  \"coinbase\" : true|false   (boolean) Coinbase or not\n"
            "}\n"

            "\nExamples:\n"
            "\nGet unspent transactions\n"
            + HelpExampleCli("listunspent", "") +
            "\nView the details\n"
            + HelpExampleCli("gettxout", "\"txid\" 1") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("gettxout", "\"txid\", 1")
        ); // 1. 帮助内容

    LOCK(cs_main);

    UniValue ret(UniValue::VOBJ);

    std::string strHash = params[0].get_str();
    uint256 hash(uint256S(strHash));
    int n = params[1].get_int();
    bool fMempool = true;
    if (params.size() > 2)
        fMempool = params[2].get_bool();

    CCoins coins;
    if (fMempool) {
        LOCK(mempool.cs);
        CCoinsViewMemPool view(pcoinsTip, mempool); // 创建查看内存池对象
        if (!view.GetCoins(hash, coins))
            return NullUniValue;
        mempool.pruneSpent(hash, coins); // TODO: this should be done by the CCoinsViewMemPool
    } else {
        if (!pcoinsTip->GetCoins(hash, coins)) // 获取缓存的币数据
            return NullUniValue;
    }
    if (n<0 || (unsigned int)n>=coins.vout.size() || coins.vout[n].IsNull()) // 输出索引范围检测，或该索引对应输出为空
        return NullUniValue;

    BlockMap::iterator it = mapBlockIndex.find(pcoinsTip->GetBestBlock()); // 获取最佳区块索引映射迭代器
    CBlockIndex *pindex = it->second; // 获取最佳区块索引
    ret.push_back(Pair("bestblock", pindex->GetBlockHash().GetHex())); // 最佳区块哈希
    if ((unsigned int)coins.nHeight == MEMPOOL_HEIGHT) // 若币的高度为 0x7FFFFFFF
        ret.push_back(Pair("confirmations", 0)); // 则未上链，确认数为 0
    else // 否则表示已上链
        ret.push_back(Pair("confirmations", pindex->nHeight - coins.nHeight + 1)); // 确认数
    ret.push_back(Pair("value", ValueFromAmount(coins.vout[n].nValue))); // 输出金额
    UniValue o(UniValue::VOBJ);
    ScriptPubKeyToJSON(coins.vout[n].scriptPubKey, o, true); // 公钥脚本转换为 JSON 格式
    ret.push_back(Pair("scriptPubKey", o)); // 公钥脚本
    ret.push_back(Pair("version", coins.nVersion)); // 版本号
    ret.push_back(Pair("coinbase", coins.fCoinBase)); // 创币交易标志

    return ret;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
