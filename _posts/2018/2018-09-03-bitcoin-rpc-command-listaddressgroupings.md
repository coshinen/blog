---
layout: post
title:  "比特币 RPC 命令剖析 \"listaddressgroupings\""
date:   2018-09-03 11:32:59 +0800
author: mistydew
comments: true
categories: 区块链
tags: CLI bitcoin-cli Blockchain Bitcoin
excerpt: $ bitcoin-cli listaddressgroupings
---
## 提示说明

```shell
listaddressgroupings # 列出作为输入公开使用的公共所有权或过去交易导致找零的地址分组
```

结果：<br>
```shell
[
  [
    [
      "bitcoinaddress",     （字符串）比特币地址
      amount,                 （数字）以 BTC 为单位的金额
      "account"             （字符串，可选，已过时）账户
    ]
    ,...
  ]
  ,...
]
```

## 用法示例

### 比特币核心客户端

获取核心服务器上钱包中地址分组（地址，余额，账户），包含找零地址。

```shell
$ bitcoin-cli listaddressgroupings
[
  [
    [
      "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk", 
      300.00000000, 
      ""
    ]
  ]
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listaddressgroupings", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[[["1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk", 300.00000000, ""]]],"error":null,"id":"curltest"}
```

## 源码剖析
listaddressgroupings 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue listaddressgroupings(const UniValue& params, bool fHelp); // 列出地址分组
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue listaddressgroupings(const UniValue& params, bool fHelp) // 列出地址分组信息（地址、余额、账户）
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1.确保当前钱包可用
        return NullUniValue;
    
    if (fHelp) // 2.没有参数
        throw runtime_error( // 命令帮助反馈
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
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 3.钱包上锁

    UniValue jsonGroupings(UniValue::VARR); // 4.地址分组集合对象
    map<CTxDestination, CAmount> balances = pwalletMain->GetAddressBalances(); // 4.1.获取地址余额映射列表
    BOOST_FOREACH(set<CTxDestination> grouping, pwalletMain->GetAddressGroupings()) // 4.2.获取并遍历地址分组集合
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
    return jsonGroupings; // 返回地址分组集合
}
```

基本流程：<br>
1.确保钱包当前可用。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.遍历地址分组集合，获取每个地址，把相关信息加入结果集并返回。<br>
4.1.获取地址余额映射列表。<br>
4.2.获取并遍历地址分组集合，把每个地址的相关信息加入结果集。<br>

函数 pwalletMain->GetAddressBalances() 获取地址余额映射列表，定义在“wallet.cpp”文件中。

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

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listaddressgroupings){:target="_blank"}
