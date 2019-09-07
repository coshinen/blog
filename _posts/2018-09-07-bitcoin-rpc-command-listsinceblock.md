---
layout: post
title:  "比特币 RPC 命令剖析 \"listsinceblock\""
date:   2018-09-07 09:09:08 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli listsinceblock ( "blockhash" target-confirmations includeWatchonly )
---
## 提示说明

```shell
listsinceblock ( "blockhash" target-confirmations includeWatchonly ) # 获取从区块 blockhash 开始到最佳区块上的全部交易，如果该参数省略则获取全部区块交易
```

参数：
1. blockhash（字符串，可选）列出从该区块哈希开始的全部交易。
2. target-confirmations（数字型，可选）所需的确认数，必须大于等于 1。
3. includeWatchonly（布尔型，可选，默认为 false）包含到 watchonly 地址的交易（见 [importaddress](/blog/2018/08/bitcoin-rpc-command-importaddress.html)）。

结果：
```shell
{
  "transactions": [
    "account":"accountname",       （字符串，已过时）交易关联的帐户名。默认账户为 ""。
    "address":"bitcoinaddress",    （字符串）交易的比特币地址。对于 'move' 交易（类别为 'move'）不存在。
    "category":"send|receive",     （字符串）交易类别。'send' 是负值，'receive' 是正值。
    "amount": x.xxx,          （数字）以 BTC 为单位的金额。对于 'send' 类型为负值，且对于 'move' 类型为移出。
                                          对于 'receive' 类型为正值，且对于 'move' 类型为移入资金。
    "vout" : n,               （数字）输出序号
    "fee": x.xxx,             （数字）以 BTC 为单位的交易费。只对于 'send' 类型交易是负值。
    "confirmations": n,       （数字）交易的确认数。适用于 'send' 和 'receive' 类型的交易。
    "blockhash": "hashvalue",     （字符串）包含该交易的区块哈希。适用于 'send' 和 'receive' 类型的交易。
    "blockindex": n,          （数字）包含该交易的区块索引。适用于 'send' 和 'receive' 类型的交易。
    "blocktime": xxx,         （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间。
    "txid": "transactionid",  （字符串）交易索引。适用于 'send' 和 'receive' 类型的交易。
    "time": xxx,              （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易时间。
    "timereceived": xxx,      （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易接收时间。
    "comment": "...",       （字符串）交易相关的备注。
    "label" : "label"       （字符串）地址/交易的备注，如果有的话
    "to": "...",            （字符串）交易目的地相关的备注。
  ],
  "lastblock": "lastblockhash"     （字符串）最新的区块哈希
}
```

## 用法示例

### 比特币核心客户端

用法一：列出全部区块的交易。

```shell
$ bitcoin-cli listsinceblock
{
  "transactions": [
    ...
    {
      "account": "",
      "address": "1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb",
      "category": "generate",
      "amount": 50.00000000,
      "vout": 0,
      "confirmations": 7049,
      "generated": true,
      "blockhash": "0000008bfc52e5e1b4ba7790ee64fca1d3b2aecec0e422b6b66ba42cb136a318",
      "blockindex": 0,
      "blocktime": 1529993986,
      "txid": "64cccab86b0dc3ce37c7fffab2c30ab227add4542c19486aa85eca1a9e02d3ff",
      "walletconflicts": [
      ],
      "time": 1529993986,
      "timereceived": 1529993986,
      "bip125-replaceable": "no"
    }
  ],
  "lastblock": "00000071df37848cb6d23425da28d400d0c0b9cd0725b629a0891a14be272083"
}
```

用法二：列出从当前最佳区块开始的全部交易。

```shell
$ bitcoin-cli getblockcount
38565
$ bitcoin-cli getblockhash 38565
0000014c2436b10caba31a8ab61b78b91a3f877d1e00f9995f0c6f77a08d4516
$ bitcoin-cli listsinceblock 0000014c2436b10caba31a8ab61b78b91a3f877d1e00f9995f0c6f77a08d4516 6
{
  "transactions": [
    ...
    {
      "account": "",
      "address": "1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb",
      "category": "orphan",
      "amount": 50.00000000,
      "vout": 0,
      "confirmations": 0,
      "generated": true,
      "trusted": false,
      "txid": "18955cbce8c776fb6132c0c3a4770965bc5530d896a95c0128920630aa084dfa",
      "walletconflicts": [
      ],
      "time": 1529979442,
      "timereceived": 1529979442,
      "bip125-replaceable": "unknown"
    }
  ],
  "lastblock": "00000125b002c17dea5a3b2139f0277827a84809e17379c10a7c987282144012"
}
```

### cURL

```shell
{"result":{"transactions":[{"account":"","address":"1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb","category":"orphan","amount":50.00000000,"vout":0,"confirmations":0,"generated":true,"trusted":false,"txid":"18955cbce8c776fb6132c0c3a4770965bc5530d896a95c0128920630aa084dfa","walletconflicts":[],"time":1529979442,"timereceived":1529979442,"bip125-replaceable":"unknown"}],"lastblock":"000000796192bdbec7c9d6c540dbbc04a9d8cd24ea6d77c96723f9a093450a70"},"error":null,"id":"curltest"}
```

## 源码剖析
listsinceblock 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue listsinceblock(const UniValue& params, bool fHelp); // 列出指定区块开始区块上的全部交易
```

实现在“wallet/rpcwallet.cpp”文件中。

```cpp
UniValue listsinceblock(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp) // 只处理帮助信息
        throw runtime_error( // 命令帮助反馈
            "listsinceblock ( \"blockhash\" target-confirmations includeWatchonly)\n"
            "\nGet all transactions in blocks since block [blockhash], or all transactions if omitted\n"
            "\nArguments:\n"
            "1. \"blockhash\"   (string, optional) The block hash to list transactions since\n"
            "2. target-confirmations:    (numeric, optional) The confirmations required, must be 1 or more\n"
            "3. includeWatchonly:        (bool, optional, default=false) Include transactions to watchonly addresses (see 'importaddress')"
            "\nResult:\n"
            "{\n"
            "  \"transactions\": [\n"
            "    \"account\":\"accountname\",       (string) DEPRECATED. The account name associated with the transaction. Will be \"\" for the default account.\n"
            "    \"address\":\"bitcoinaddress\",    (string) The bitcoin address of the transaction. Not present for move transactions (category = move).\n"
            "    \"category\":\"send|receive\",     (string) The transaction category. 'send' has negative amounts, 'receive' has positive amounts.\n"
            "    \"amount\": x.xxx,          (numeric) The amount in " + CURRENCY_UNIT + ". This is negative for the 'send' category, and for the 'move' category for moves \n"
            "                                          outbound. It is positive for the 'receive' category, and for the 'move' category for inbound funds.\n"
            "    \"vout\" : n,               (numeric) the vout value\n"
            "    \"fee\": x.xxx,             (numeric) The amount of the fee in " + CURRENCY_UNIT + ". This is negative and only available for the 'send' category of transactions.\n"
            "    \"confirmations\": n,       (numeric) The number of confirmations for the transaction. Available for 'send' and 'receive' category of transactions.\n"
            "    \"blockhash\": \"hashvalue\",     (string) The block hash containing the transaction. Available for 'send' and 'receive' category of transactions.\n"
            "    \"blockindex\": n,          (numeric) The block index containing the transaction. Available for 'send' and 'receive' category of transactions.\n"
            "    \"blocktime\": xxx,         (numeric) The block time in seconds since epoch (1 Jan 1970 GMT).\n"
            "    \"txid\": \"transactionid\",  (string) The transaction id. Available for 'send' and 'receive' category of transactions.\n"
            "    \"time\": xxx,              (numeric) The transaction time in seconds since epoch (Jan 1 1970 GMT).\n"
            "    \"timereceived\": xxx,      (numeric) The time received in seconds since epoch (Jan 1 1970 GMT). Available for 'send' and 'receive' category of transactions.\n"
            "    \"comment\": \"...\",       (string) If a comment is associated with the transaction.\n"
            "    \"label\" : \"label\"       (string) A comment for the address/transaction, if any\n"
            "    \"to\": \"...\",            (string) If a comment to is associated with the transaction.\n"
             "  ],\n"
            "  \"lastblock\": \"lastblockhash\"     (string) The hash of the last block\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("listsinceblock", "")
            + HelpExampleCli("listsinceblock", "\"000000000000000bacf66f7497b7dc45ef753ee9a7d38571037cdb1a57f663ad\" 6")
            + HelpExampleRpc("listsinceblock", "\"000000000000000bacf66f7497b7dc45ef753ee9a7d38571037cdb1a57f663ad\", 6")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    CBlockIndex *pindex = NULL; // 从某个区块开始
    int target_confirms = 1; // 确认数，默认为 1
    isminefilter filter = ISMINE_SPENDABLE; // watchonly

    if (params.size() > 0) // 有 1 个以上的参数
    {
        uint256 blockId;

        blockId.SetHex(params[0].get_str()); // 获取区块索引
        BlockMap::iterator it = mapBlockIndex.find(blockId); // 在区块索引映射列表中查找该区块
        if (it != mapBlockIndex.end()) // 若找到
            pindex = it->second; // 获取该区块索引指针
    }

    if (params.size() > 1) // 若参数有 2 个以上
    {
        target_confirms = params[1].get_int(); // 获取确认数

        if (target_confirms < 1) // 确认数最小为 1
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter");
    }

    if(params.size() > 2) // 若参数有 3 个以上
        if(params[2].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 设置 watchonly

    int depth = pindex ? (1 + chainActive.Height() - pindex->nHeight) : -1; // 获取指定区块的深度

    UniValue transactions(UniValue::VARR); // 创建数组类型的交易信息集

    for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); it++) // 遍历钱包交易映射列表
    {
        CWalletTx tx = (*it).second; // 获取钱包交易

        if (depth == -1 || tx.GetDepthInMainChain() < depth) // 若未指定区块 或 该交易深度小于指定区块深度
            ListTransactions(tx, "*", 0, true, transactions, filter); // 以钱包交易为索引获取交易信息集
    }

    CBlockIndex *pblockLast = chainActive[chainActive.Height() + 1 - target_confirms]; // 若确认数为 1，获取最佳区块索引
    uint256 lastblock = pblockLast ? pblockLast->GetBlockHash() : uint256(); // 获取该区块哈希值

    UniValue ret(UniValue::VOBJ); // 对象类型的结果
    ret.push_back(Pair("transactions", transactions)); // 交易集
    ret.push_back(Pair("lastblock", lastblock.GetHex())); // 最佳区块哈希值

    return ret; // 返回结果对象
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助。<br>
3.钱包上锁。<br>
4.处理参数。<br>
5.获取指定区块深度。<br>
6.遍历钱包交易映射列表，获取每笔交易的相关信息并加入交易信息集。<br>
7.若确认数为 1，则获取最佳区块哈希，加入交易信息集并返回。

第六步，调用 ListTransactions(tx, "*", 0, true, transactions, filter) 函数获取一笔交易的相关信息，
该函数定义在“wallet/rpcwallet.cpp”文件中。

```cpp
void ListTransactions(const CWalletTx& wtx, const string& strAccount, int nMinDepth, bool fLong, UniValue& ret, const isminefilter& filter)
{
    CAmount nFee; // 交易费
    string strSentAccount; // 发送账户
    list<COutputEntry> listReceived; // 接收输出条目列表
    list<COutputEntry> listSent; // 发送输出条目列表

    wtx.GetAmounts(listReceived, listSent, nFee, strSentAccount, filter); // 获取相应金额

    bool fAllAccounts = (strAccount == string("*")); // 全部账户标志
    bool involvesWatchonly = wtx.IsFromMe(ISMINE_WATCH_ONLY); // watchonly 标志

    // Sent
    if ((!listSent.empty() || nFee != 0) && (fAllAccounts || strAccount == strSentAccount))
    { // 发送列表非空 或 交易费非 0 且 全部账户 或 发送账户为指定账户（这里是 "*" 表示全部账户）
        BOOST_FOREACH(const COutputEntry& s, listSent) // 遍历发送列表
        {
            UniValue entry(UniValue::VOBJ);
            if(involvesWatchonly || (::IsMine(*pwalletMain, s.destination) & ISMINE_WATCH_ONLY))
                entry.push_back(Pair("involvesWatchonly", true));
            entry.push_back(Pair("account", strSentAccount)); // 发送账户
            MaybePushAddress(entry, s.destination); // 发送地址
            entry.push_back(Pair("category", "send")); // 交易类别为发送
            entry.push_back(Pair("amount", ValueFromAmount(-s.amount))); // 交易金额，符号表示发送
            if (pwalletMain->mapAddressBook.count(s.destination))
                entry.push_back(Pair("label", pwalletMain->mapAddressBook[s.destination].name)); // 标签为帐户名
            entry.push_back(Pair("vout", s.vout)); // 输出索引
            entry.push_back(Pair("fee", ValueFromAmount(-nFee))); // 交易费
            if (fLong) // true
                WalletTxToJSON(wtx, entry); // 钱包交易信息转化为 JSON 格式
            entry.push_back(Pair("abandoned", wtx.isAbandoned())); // 是否被抛弃
            ret.push_back(entry); // 加入交易信息集
        }
    }

    // Received
    if (listReceived.size() > 0 && wtx.GetDepthInMainChain() >= nMinDepth)
    { // 接收列表非空 且 该交易深度大于等于最小深度（确认数）
        BOOST_FOREACH(const COutputEntry& r, listReceived) // 遍历接收列表
        {
            string account;
            if (pwalletMain->mapAddressBook.count(r.destination)) // 若该地址存在于地址簿
                account = pwalletMain->mapAddressBook[r.destination].name; // 获取地址对应账户名
            if (fAllAccounts || (account == strAccount)) // 全部账户 或 该账户为指定账户（"*"）
            {
                UniValue entry(UniValue::VOBJ);
                if(involvesWatchonly || (::IsMine(*pwalletMain, r.destination) & ISMINE_WATCH_ONLY))
                    entry.push_back(Pair("involvesWatchonly", true));
                entry.push_back(Pair("account", account)); // 账户名
                MaybePushAddress(entry, r.destination); // 接收地址
                if (wtx.IsCoinBase()) // 该交易为创币交易
                {
                    if (wtx.GetDepthInMainChain() < 1) // 该交易在主链上的深度为 0
                        entry.push_back(Pair("category", "orphan")); // 孤儿链
                    else if (wtx.GetBlocksToMaturity() > 0) // 成熟所需区块数大于 0
                        entry.push_back(Pair("category", "immature")); // 未成熟
                    else
                        entry.push_back(Pair("category", "generate")); // regtest 生成
                }
                else
                { // 普通交易（非创币交易）
                    entry.push_back(Pair("category", "receive")); // 交易类别为接收
                }
                entry.push_back(Pair("amount", ValueFromAmount(r.amount))); // 交易金额
                if (pwalletMain->mapAddressBook.count(r.destination)) // 若该地址存在于地址簿
                    entry.push_back(Pair("label", account)); // 标签为该地址对应的帐户名
                entry.push_back(Pair("vout", r.vout)); // 输出索引
                if (fLong)
                    WalletTxToJSON(wtx, entry); // 钱包交易信息转化为 JSON
                ret.push_back(entry); // 加入交易信息集
            }
        }
    }
}
```

调用 WalletTxToJSON(wtx, entry) 函数把相应钱包信息转化为 JSON 格式，该函数定义在“wallet/rpcwallet.cpp”文件中。

```cpp
void WalletTxToJSON(const CWalletTx& wtx, UniValue& entry)
{
    int confirms = wtx.GetDepthInMainChain();
    entry.push_back(Pair("confirmations", confirms)); // 确认数
    if (wtx.IsCoinBase())
        entry.push_back(Pair("generated", true)); // 为创币交易
    if (confirms > 0) // 已上链
    {
        entry.push_back(Pair("blockhash", wtx.hashBlock.GetHex())); // 区块哈希
        entry.push_back(Pair("blockindex", wtx.nIndex)); // 交易索引
        entry.push_back(Pair("blocktime", mapBlockIndex[wtx.hashBlock]->GetBlockTime())); // 区块创建时间
    } else { // 还在内存池中（未上链）
        entry.push_back(Pair("trusted", wtx.IsTrusted())); // 该交易可信
    }
    uint256 hash = wtx.GetHash();
    entry.push_back(Pair("txid", hash.GetHex())); // 交易索引
    UniValue conflicts(UniValue::VARR);
    BOOST_FOREACH(const uint256& conflict, wtx.GetConflicts())
        conflicts.push_back(conflict.GetHex());
    entry.push_back(Pair("walletconflicts", conflicts)); // 钱包冲突
    entry.push_back(Pair("time", wtx.GetTxTime())); // 交易发起时间
    entry.push_back(Pair("timereceived", (int64_t)wtx.nTimeReceived)); // 交易接收时间

    // Add opt-in RBF status // 添加选择性的 RBF 状态
    std::string rbfStatus = "no";
    if (confirms <= 0) {
        LOCK(mempool.cs);
        if (!mempool.exists(hash)) {
            if (SignalsOptInRBF(wtx)) {
                rbfStatus = "yes";
            } else {
                rbfStatus = "unknown";
            }
        } else if (IsRBFOptIn(*mempool.mapTx.find(hash), mempool)) {
            rbfStatus = "yes";
        }
    }
    entry.push_back(Pair("bip125-replaceable", rbfStatus));

    BOOST_FOREACH(const PAIRTYPE(string,string)& item, wtx.mapValue)
        entry.push_back(Pair(item.first, item.second));
}
```

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listsinceblock){:target="_blank"}
