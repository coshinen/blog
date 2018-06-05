---
layout: post
title:  "比特币 RPC 命令剖析 \"listunspent\""
date:   2018-06-05 15:23:42 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
listunspent ( minconf maxconf  ["address",...] ) # 列出在（含） `minconf` 和 `maxconf` 之间确认数的未花费交易输出
{% endhighlight %}

可选择的过滤只包含支付给指定地址们的交易输出。<br>
结果是一个对象数组，每个对象都有：{交易索引，输出列表，公钥脚本，金额，确认数}

参数：<br>
1. `minconf` （数字型，可选，默认为 1）要过滤的最小确认数。<br>
2. `maxconf` （数字型，可选，默认为 9999999）要过滤的最大确认数。<br>
3. `addresses` （字符串）要过滤的比特币地址的 json 数组。
{% highlight shell %}
    [
      "address" （字符串）比特币地址
      ,...
    ]
{% endhighlight %}

结果：<br>
{% highlight shell %}
[                   (array of json object)
  {
    "txid" : "txid",        (string) the transaction id 
    "vout" : n,               (numeric) the vout value
    "address" : "address",  (string) the bitcoin address
    "account" : "account",  (string) DEPRECATED. The associated account, or "" for the default account
    "scriptPubKey" : "key", (string) the script key
    "amount" : x.xxx,         (numeric) the transaction amount in BTC
    "confirmations" : n       (numeric) The number of confirmations
  }
  ,...
]
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli listunspent
[
  {
    "txid": "cf9f8c8bac02b3012ab99864a2294b88cc6105fdefcd16bbe8f7d1531fc895fe",
    "vout": 0,
    "address": "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk",
    "account": "",
    "scriptPubKey": "76a914a4d938a6461a0d6f24946b9bfcda0862a1db6f7488ac",
    "amount": 0.10000000,
    "confirmations": 34533,
    "ps_rounds": -2,
    "spendable": true,
    "solvable": true
  }, 
  {
    "txid": "5d306125b2fbfc5855b1b7729ceac1b3010e0ddaa7b03f7abeb225f7b13677ff",
    "vout": 0,
    "address": "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk",
    "account": "",
    "scriptPubKey": "76a914a4d938a6461a0d6f24946b9bfcda0862a1db6f7488ac",
    "amount": 0.10000000,
    "confirmations": 34529,
    "ps_rounds": -2,
    "spendable": true,
    "solvable": true
  },
  ...
]
{% endhighlight %}

## 源码剖析
`listunspent` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue listunspent(const UniValue& params, bool fHelp); // 列出未花费的交易输出
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue listunspent(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3) // 参数最多 3 个
        throw runtime_error( // 命令帮助反馈
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
        );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)(UniValue::VNUM)(UniValue::VARR)); // 检查参数类型

    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 0)
        nMinDepth = params[0].get_int(); // 获取最小深度

    int nMaxDepth = 9999999; // 最大深度，默认为 9999999
    if (params.size() > 1)
        nMaxDepth = params[1].get_int(); // 获取最大深度

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
        } // 多余？

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

    return results; // 返回结果集
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.检查参数类型。<br>
4.获取指定的参数：最大/小确认数（深度）、地址集合。<br>
5.检查钱包可用，钱包上锁。<br>
6.获取可花费的输出列表。<br>
7.遍历该列表获取所需信息并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listunspent)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
