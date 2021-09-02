---
layout: post
title:  "比特币 RPC 命令「listreceivedbyaccount」"
date:   2018-09-05 20:56:26 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help listreceivedbyaccount
listreceivedbyaccount ( minconf includeempty includeWatchonly )

已过时。列出账户余额。

参数：
1. minconf         （数字，可选，默认为 1）包含支付前的最小确认数
2. includeempty    （布尔型，可选，默认为 false）是否包含未收到任何付款的账户
3. includeWatchonly（布尔型，可选，默认为 false）是否包含 watchonly 地址（见 'importaddress'）

结果：
[
  {
    "involvesWatchonly" : true,（布尔型）如果导入的地址包含在交易中，则只返回该项
    "account" : "accountname", （字符串）接收账户的帐户名
    "amount" : x.xxx,          （数字）这个账户下地址接收的总金额
    "confirmations" : n,       （数字）包含最多最近交易的确认数
    "label" : "label"          （字符串）一条地址/交易的备注，如果存在
  }
  ,...
]

例子：
> bitcoin-cli listreceivedbyaccount
> bitcoin-cli listreceivedbyaccount 6 true
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listreceivedbyaccount", "params": [6, true, true] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`listreceivedbyaccount` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listreceivedbyaccount(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue listreceivedbyaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3)
        throw runtime_error(
            "listreceivedbyaccount ( minconf includeempty includeWatchonly)\n"
            "\nDEPRECATED. List balances by account.\n"
            "\nArguments:\n"
            "1. minconf      (numeric, optional, default=1) The minimum number of confirmations before payments are included.\n"
            "2. includeempty (boolean, optional, default=false) Whether to include accounts that haven't received any payments.\n"
            "3. includeWatchonly (bool, optional, default=false) Whether to include watchonly addresses (see 'importaddress').\n"

            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"involvesWatchonly\" : true,   (bool) Only returned if imported addresses were involved in transaction\n"
            "    \"account\" : \"accountname\",  (string) The account name of the receiving account\n"
            "    \"amount\" : x.xxx,             (numeric) The total amount received by addresses with this account\n"
            "    \"confirmations\" : n,          (numeric) The number of confirmations of the most recent transaction included\n"
            "    \"label\" : \"label\"           (string) A comment for the address/transaction, if any\n"
            "  }\n"
            "  ,...\n"
            "]\n"

            "\nExamples:\n"
            + HelpExampleCli("listreceivedbyaccount", "")
            + HelpExampleCli("listreceivedbyaccount", "6 true")
            + HelpExampleRpc("listreceivedbyaccount", "6, true, true")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    return ListReceived(params, true); // 3. 列出账户余额
}
```

### 1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#1-确保钱包可用)。

### 2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 3. 列出账户余额

函数 `ListReceived(params, true)` 定义在文件 `rpcwallet.cpp` 中。

```cpp
struct tallyitem // 账目类
{
    CAmount nAmount; // 金额，默认为 0
    int nConf; // 确认数，默认 int 的最大值
    vector<uint256> txids; // 交易索引列表
    bool fIsWatchonly; // 开启 watchonly 标志，默认关闭
    tallyitem() // 无参构造
    {
        nAmount = 0;
        nConf = std::numeric_limits<int>::max();
        fIsWatchonly = false;
    }
};

UniValue ListReceived(const UniValue& params, bool fByAccounts) // fByAccounts = true
{
    // Minimum confirmations // 最低确认数
    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 0)
        nMinDepth = params[0].get_int(); // 获取最小深度

    // Whether to include empty accounts
    bool fIncludeEmpty = false; // 包含空余额的账户标志，默认为 false
    if (params.size() > 1)
        fIncludeEmpty = params[1].get_bool(); // 获取是否包含空余额的账户标志

    isminefilter filter = ISMINE_SPENDABLE; // 可花费
    if(params.size() > 2)
        if(params[2].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 设置挖矿 watchonly

    // Tally // 记账
    map<CBitcoinAddress, tallyitem> mapTally; // 地址账目映射列表
    for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); ++it)
    { // 遍历钱包交易映射列表
        const CWalletTx& wtx = (*it).second; // 获取钱包交易

        if (wtx.IsCoinBase() || !CheckFinalTx(wtx)) // 非创币交易 且 为最终交易
            continue;

        int nDepth = wtx.GetDepthInMainChain(); // 获取该交易的链深度
        if (nDepth < nMinDepth) // 深度不能小于最小深度（最低确认数）
            continue;

        BOOST_FOREACH(const CTxOut& txout, wtx.vout)
        { // 遍历交易输出列表
            CTxDestination address;
            if (!ExtractDestination(txout.scriptPubKey, address)) // 通过交易输出公钥脚本获取公钥地址
                continue;

            isminefilter mine = IsMine(*pwalletMain, address);
            if(!(mine & filter))
                continue;

            tallyitem& item = mapTally[address]; // 获取地址对应的账目
            item.nAmount += txout.nValue; // 累加交易输出金额
            item.nConf = min(item.nConf, nDepth); // 获取交易深度
            item.txids.push_back(wtx.GetHash()); // 加入交易索引列表
            if (mine & ISMINE_WATCH_ONLY)
                item.fIsWatchonly = true;
        }
    }

    // Reply
    UniValue ret(UniValue::VARR); // 创建数组类型的结果对象
    map<string, tallyitem> mapAccountTally; // 账户账目映射列表
    BOOST_FOREACH(const PAIRTYPE(CBitcoinAddress, CAddressBookData)& item, pwalletMain->mapAddressBook) // 遍历地址簿映射列表
    {
        const CBitcoinAddress& address = item.first; // 获取地址
        const string& strAccount = item.second.name; // 获取帐户名
        map<CBitcoinAddress, tallyitem>::iterator it = mapTally.find(address); // 获取地址对应的账目
        if (it == mapTally.end() && !fIncludeEmpty) // 未找到 且 包含空余额账户标志为 false
            continue; // 跳过

        CAmount nAmount = 0; // 金额
        int nConf = std::numeric_limits<int>::max(); // 确认数，默认最大值
        bool fIsWatchonly = false; // watchonly 标志，默认为 false
        if (it != mapTally.end()) // 找到
        { // 地址对应账目
            nAmount = (*it).second.nAmount; // 获取地址金额
            nConf = (*it).second.nConf; // 获取地址确认数
            fIsWatchonly = (*it).second.fIsWatchonly; // 获取地址 watchonly 标志
        }

        if (fByAccounts) // true
        {
            tallyitem& item = mapAccountTally[strAccount]; // 获取账户名对应的账目
            item.nAmount += nAmount; // 累加金额
            item.nConf = min(item.nConf, nConf); // 获取最小确认数
            item.fIsWatchonly = fIsWatchonly; // 获取 watchonly 标志
        }
        else
        {
            UniValue obj(UniValue::VOBJ);
            if(fIsWatchonly)
                obj.push_back(Pair("involvesWatchonly", true));
            obj.push_back(Pair("address",       address.ToString()));
            obj.push_back(Pair("account",       strAccount));
            obj.push_back(Pair("amount",        ValueFromAmount(nAmount)));
            obj.push_back(Pair("confirmations", (nConf == std::numeric_limits<int>::max() ? 0 : nConf)));
            if (!fByAccounts)
                obj.push_back(Pair("label", strAccount));
            UniValue transactions(UniValue::VARR);
            if (it != mapTally.end())
            {
                BOOST_FOREACH(const uint256& item, (*it).second.txids)
                {
                    transactions.push_back(item.GetHex());
                }
            }
            obj.push_back(Pair("txids", transactions));
            ret.push_back(obj);
        }
    }

    if (fByAccounts) // true
    {
        for (map<string, tallyitem>::iterator it = mapAccountTally.begin(); it != mapAccountTally.end(); ++it)
        { // 遍历账户账目映射列表
            CAmount nAmount = (*it).second.nAmount; // 获取余额
            int nConf = (*it).second.nConf; // 获取确认数
            UniValue obj(UniValue::VOBJ); 
            if((*it).second.fIsWatchonly)
                obj.push_back(Pair("involvesWatchonly", true)); // watchonly 标志
            obj.push_back(Pair("account",       (*it).first)); // 帐户名
            obj.push_back(Pair("amount",        ValueFromAmount(nAmount))); // 余额
            obj.push_back(Pair("confirmations", (nConf == std::numeric_limits<int>::max() ? 0 : nConf))); // 确认数
            ret.push_back(obj); // 加入结果集
        }
    }

    return ret;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
