---
layout: post
title:  "比特币 RPC 命令剖析 \"listaddressgroupings\""
date:   2018-09-03 21:32:59 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listaddressgroupings
---
## 1. 帮助内容

```shell
$ bitcoin-cli help listaddressgroupings
listaddressgroupings

列出一组地址，它们的共同所有权作为输入或在过去的交易中作为找零而被公开

结果：
[
  [
    [
      "bitcoinaddress",（字符串）比特币地址
      amount,          （数字）以 BTC 为单位的金额
      "account"        （字符串，可选）账户（已过时）
    ]
    ,...
  ]
  ,...
]

例子：
> bitcoin-cli listaddressgroupings
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listaddressgroupings", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listaddressgroupings` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listaddressgroupings(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue listaddressgroupings(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp)
        throw runtime_error(
            "listaddressgroupings\n"
            "\nLists groups of addresses which have had their common ownership\n"
            "made public by common use as inputs or as the resulting change\n"
            "in past transactions\n"
            "\nResult:\n"
            "[\n"
            "  [\n"
            "    [\n"
            "      \"bitcoinaddress\",     (string) The bitcoin address\n"
            "      amount,                 (numeric) The amount in " + CURRENCY_UNIT + "\n"
            "      \"account\"             (string, optional) The account (DEPRECATED)\n"
            "    ]\n"
            "    ,...\n"
            "  ]\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            + HelpExampleCli("listaddressgroupings", "")
            + HelpExampleRpc("listaddressgroupings", "")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    UniValue jsonGroupings(UniValue::VARR); // 3. 获取地址集合
    map<CTxDestination, CAmount> balances = pwalletMain->GetAddressBalances(); // 获取地址余额映射列表
    BOOST_FOREACH(set<CTxDestination> grouping, pwalletMain->GetAddressGroupings()) // 获取并遍历地址分组集合
    {
        UniValue jsonGrouping(UniValue::VARR); // 地址分组对象
        BOOST_FOREACH(CTxDestination address, grouping) // 遍历一个地址分组
        {
            UniValue addressInfo(UniValue::VARR); // 一个地址信息（地址、余额、账户）
            addressInfo.push_back(CBitcoinAddress(address).ToString()); // 获取地址
            addressInfo.push_back(ValueFromAmount(balances[address])); // 获取地址余额
            {
                if (pwalletMain->mapAddressBook.find(CBitcoinAddress(address).Get()) != pwalletMain->mapAddressBook.end()) // 若地址簿中有该地址
                    addressInfo.push_back(pwalletMain->mapAddressBook.find(CBitcoinAddress(address).Get())->second.name); // 把该地址关联的账户名加入地址信息
            }
            jsonGrouping.push_back(addressInfo); // 加入地址分组
        }
        jsonGroupings.push_back(jsonGrouping); // 加入地址分组集合
    }
    return jsonGroupings;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 获取地址集合

获取地址余额函数 `pwalletMain->GetAddressBalances()` 定义在文件 `wallet.cpp` 中。

```cpp
std::map<CTxDestination, CAmount> CWallet::GetAddressBalances()
{
    map<CTxDestination, CAmount> balances; // 地址余额映射列表

    {
        LOCK(cs_wallet); // 钱包上锁
        BOOST_FOREACH(PAIRTYPE(uint256, CWalletTx) walletEntry, mapWallet) // 遍历钱包交易映射列表
        { // 获取一个钱包条目（交易索引，钱包交易）
            CWalletTx *pcoin = &walletEntry.second; // 获取钱包交易

            if (!CheckFinalTx(*pcoin) || !pcoin->IsTrusted()) // 为最终交易 且 交易可信
                continue; // 跳过

            if (pcoin->IsCoinBase() && pcoin->GetBlocksToMaturity() > 0) // 若为创币交易 且 未成熟
                continue; // 跳过

            int nDepth = pcoin->GetDepthInMainChain(); // 获取该交易所在区块的主链深度
            if (nDepth < (pcoin->IsFromMe(ISMINE_ALL) ? 0 : 1))
                continue;

            for (unsigned int i = 0; i < pcoin->vout.size(); i++) // 遍历该交易的输出列表
            {
                CTxDestination addr;
                if (!IsMine(pcoin->vout[i])) // 若交易输出不是我的
                    continue; // 跳过
                if(!ExtractDestination(pcoin->vout[i].scriptPubKey, addr)) // 从交易输出中抽取交易地址
                    continue;

                CAmount n = IsSpent(walletEntry.first, i) ? 0 : pcoin->vout[i].nValue; // 若该交易未花费，获取其输出点的值

                if (!balances.count(addr)) // 结果集中不含该地址
                    balances[addr] = 0; // 初始化
                balances[addr] += n; // 累加地址余额（未花费的输出点）
            }
        }
    }

    return balances; // 返回地址余额映射列表
}
```

通过遍历钱包交易映射列表，获取每笔钱包交易的输入和输出列表对应的交易地址。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
