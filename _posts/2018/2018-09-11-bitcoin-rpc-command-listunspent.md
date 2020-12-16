---
layout: post
title:  "比特币 RPC 命令剖析 \"listunspent\""
date:   2018-09-11 20:23:42 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listunspent ( minconf maxconf  ["address",...] )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help listunspent
listunspent ( minconf maxconf  ["address",...] )

返回在 minconf 和 maxconf（含）间的确认数的未花费交易输出的数组。
选择性过滤器只包含支付给指定地址的交易输出。
结果是一个对象数组，每个对象都有：
{交易索引，输出序号，脚本公钥，金额，确认数}

参数：
1. minconf  （数字，可选，默认为 1）待过滤的最小确认数
2. maxconf  （数字，可选，默认为 9999999）待过滤的最大确认数
3. addresses（字符串）一个待过滤的比特币地址的 json 数组
    [
      "address" （字符串）比特币地址
      ,...
    ]

结果：
[                         （json 对象的数组）
  {
    "txid" : "txid",       （字符串）交易索引
    "vout" : n,            （数字）输出序号
    "address" : "address", （字符串）比特币地址
    "account" : "account", （字符串）已过时。关联的账户，默认账户为 ""
    "scriptPubKey" : "key",（字符串）脚本公钥
    "amount" : x.xxx,      （数字）以 BTC 为单位的交易金额
    "confirmations" : n    （数字）确认数
  }
  ,...
]

例子：
> bitcoin-cli listunspent
> bitcoin-cli listunspent 6 9999999 "[\"1PGFqEzfmQch1gKD3ra4k18PNj3tTUUSqg\",\"1LtvqCaApEdUGFkpKMM4MstjcaL4dKg8SP\"]"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listunspent", "params": [6, 9999999, "[\"1PGFqEzfmQch1gKD3ra4k18PNj3tTUUSqg\",\"1LtvqCaApEdUGFkpKMM4MstjcaL4dKg8SP\"]"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listunspent` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listunspent(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue listunspent(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3)
        throw runtime_error(
            "listunspent ( minconf maxconf  [\"address\",...] )\n"
            "\nReturns array of unspent transaction outputs\n"
            "with between minconf and maxconf (inclusive) confirmations.\n"
            "Optionally filter to only include txouts paid to specified addresses.\n"
            "Results are an array of Objects, each of which has:\n"
            "{txid, vout, scriptPubKey, amount, confirmations}\n"
            "\nArguments:\n"
            "1. minconf          (numeric, optional, default=1) The minimum confirmations to filter\n"
            "2. maxconf          (numeric, optional, default=9999999) The maximum confirmations to filter\n"
            "3. \"addresses\"    (string) A json array of bitcoin addresses to filter\n"
            "    [\n"
            "      \"address\"   (string) bitcoin address\n"
            "      ,...\n"
            "    ]\n"
            "\nResult\n"
            "[                   (array of json object)\n"
            "  {\n"
            "    \"txid\" : \"txid\",        (string) the transaction id \n"
            "    \"vout\" : n,               (numeric) the vout value\n"
            "    \"address\" : \"address\",  (string) the bitcoin address\n"
            "    \"account\" : \"account\",  (string) DEPRECATED. The associated account, or \"\" for the default account\n"
            "    \"scriptPubKey\" : \"key\", (string) the script key\n"
            "    \"amount\" : x.xxx,         (numeric) the transaction amount in " + CURRENCY_UNIT + "\n"
            "    \"confirmations\" : n       (numeric) The number of confirmations\n"
            "  }\n"
            "  ,...\n"
            "]\n"

            "\nExamples\n"
            + HelpExampleCli("listunspent", "")
            + HelpExampleCli("listunspent", "6 9999999 \"[\\\"1PGFqEzfmQch1gKD3ra4k18PNj3tTUUSqg\\\",\\\"1LtvqCaApEdUGFkpKMM4MstjcaL4dKg8SP\\\"]\"")
            + HelpExampleRpc("listunspent", "6, 9999999 \"[\\\"1PGFqEzfmQch1gKD3ra4k18PNj3tTUUSqg\\\",\\\"1LtvqCaApEdUGFkpKMM4MstjcaL4dKg8SP\\\"]\"")
        ); // 2. 帮助内容

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)(UniValue::VNUM)(UniValue::VARR)); // 检查参数类型

    int nMinDepth = 1;
    if (params.size() > 0)
        nMinDepth = params[0].get_int();

    int nMaxDepth = 9999999;
    if (params.size() > 1)
        nMaxDepth = params[1].get_int();

    set<CBitcoinAddress> setAddress; // 比特币地址集合
    if (params.size() > 2) { // 若指定了地址集
        UniValue inputs = params[2].get_array(); // 获取地址集
        for (unsigned int idx = 0; idx < inputs.size(); idx++) { // 遍历地址集
            const UniValue& input = inputs[idx]; // 获取一个地址
            CBitcoinAddress address(input.get_str()); // 转换为字符串并包装为比特币地址对象
            if (!address.IsValid()) // 检查该地址有效性
                throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, string("Invalid Bitcoin address: ")+input.get_str());
            if (setAddress.count(address)) // 保证集合里没有该地址
                throw JSONRPCError(RPC_INVALID_PARAMETER, string("Invalid parameter, duplicated address: ")+input.get_str());
           setAddress.insert(address); // 插入地址集合
        }
    }

    UniValue results(UniValue::VARR); // 创建数组类型的结果集
    vector<COutput> vecOutputs; // 输出列表
    assert(pwalletMain != NULL); // 钱包可用
    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁
    pwalletMain->AvailableCoins(vecOutputs, false, NULL, true); // 获取可花费的输出列表
    BOOST_FOREACH(const COutput& out, vecOutputs) { // 遍历该列表
        if (out.nDepth < nMinDepth || out.nDepth > nMaxDepth) // 深度（确认数）在指定范围内
            continue;

        if (setAddress.size()) { // 若地址集大小大于 0
            CTxDestination address;
            if (!ExtractDestination(out.tx->vout[out.i].scriptPubKey, address)) // 根据输出脚本提取地址
                continue;

            if (!setAddress.count(address)) // 查看地址集中是否含此地址
                continue;
        }

        CAmount nValue = out.tx->vout[out.i].nValue; // 获取输出金额
        const CScript& pk = out.tx->vout[out.i].scriptPubKey; // 获取公钥脚本
        UniValue entry(UniValue::VOBJ);
        entry.push_back(Pair("txid", out.tx->GetHash().GetHex())); // 交易索引（16 进制形式）
        entry.push_back(Pair("vout", out.i)); // 交易输出索引
        CTxDestination address;
        if (ExtractDestination(out.tx->vout[out.i].scriptPubKey, address)) { // 根据交易输出脚本获取交易地址
            entry.push_back(Pair("address", CBitcoinAddress(address).ToString())); // 交易输出的公钥地址
            if (pwalletMain->mapAddressBook.count(address)) // 若在地址簿中查到该地址
                entry.push_back(Pair("account", pwalletMain->mapAddressBook[address].name)); // 获取帐户名
        }
        entry.push_back(Pair("scriptPubKey", HexStr(pk.begin(), pk.end()))); // 公钥脚本
        if (pk.IsPayToScriptHash()) { // 是否支付到脚本哈希
            CTxDestination address;
            if (ExtractDestination(pk, address)) {
                const CScriptID& hash = boost::get<CScriptID>(address); // 通过地址获取脚本索引
                CScript redeemScript;
                if (pwalletMain->GetCScript(hash, redeemScript)) // 通过索引获取赎回脚本
                    entry.push_back(Pair("redeemScript", HexStr(redeemScript.begin(), redeemScript.end())));
            }
        }
        entry.push_back(Pair("amount",ValueFromAmount(nValue))); // 可用余额
        entry.push_back(Pair("confirmations",out.nDepth)); // 确认数（深度）
        entry.push_back(Pair("spendable", out.fSpendable)); // 是否可花费
        results.push_back(entry); // 加入结果集
    }

    return results;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
