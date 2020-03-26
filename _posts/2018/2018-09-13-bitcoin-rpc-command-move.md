---
layout: post
title:  "比特币 RPC 命令剖析 \"move\""
date:   2018-09-13 10:03:06 +0800
author: mistydew
comments: true
categories: 区块链
tags: CLI bitcoin-cli Blockchain Bitcoin
excerpt: $ bitcoin-cli move "fromaccount" "toaccount" amount ( minconf "comment" )
---
## 提示说明

```shell
move "fromaccount" "toaccount" amount ( minconf "comment" ) # （已过时）从你钱包中一个账户转移指定金额到另一个账户
```

参数：
1. fromaccount（字符串，必备）从该账户转移资金。默认账户使用 ""。
2. toaccount（字符串，必备）转移资金到该账户。默认账户使用 ""。
3. amount（数字）在账户间转移 BTC 的数量，不能为负数。
4. minconf（数字，可选，默认为 1）只使用至少 minconf 次确认的资金。
5. comment（字符串，可选）一个可选的备注，只存储在钱包中。

结果：（布尔型）如果成功返回 true。

## 用法示例

### 比特币核心客户端

用法一：从默认账户 "" 转移 0.01 BTC 到账户 "tabby"。

```shell
$ bitcoin-cli listaccounts
{
  "": 1.00000000,
  "tabby": 0.00000000
}
$ bitcoin-cli move "" "tabby" 0.01
$ bitcoin-cli listaccounts
{
  "": 0.99000000,
  "tabby": 0.01000000
}
$ bitcoin-cli listtransactions
[
  ...
  {
    "account": "",
    "category": "move",
    "time": 1530234049,
    "amount": -0.01000000,
    "otheraccount": "tabby",
    "comment": ""
  }, 
  {
    "account": "tabby",
    "category": "move",
    "time": 1530234049,
    "amount": 0.01000000,
    "otheraccount": "",
    "comment": ""
  }
]
```

用法二：从默认账户 "" 转移至少 6 次确认的 0.01 BTC 到账户 tabby，并附加备注。

```shell
$ bitcoin-cli listaccounts
{
  "": 0.99000000,
  "tabby": 0.01000000
}
$ bitcoin-cli move "" "tabby" 0.01 6 "happy birthday!"
$ bitcoin-cli listaccounts
{
  "": 0.98000000,
  "tabby": 0.02000000
}
$ bitcoin-cli listtransactions
[
  ...
  {
    "account": "",
    "category": "move",
    "time": 1530234396,
    "amount": -0.01000000,
    "otheraccount": "tabby",
    "comment": "happy birthday!"
  }, 
  {
    "account": "tabby",
    "category": "move",
    "time": 1530234396,
    "amount": 0.01000000,
    "otheraccount": "",
    "comment": "happy birthday!"
  }
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "move", "params": ["", "tabby", 0.01, 6, "happy birthday!"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":true,"error":null,"id":"curltest"}
```

## 源码剖析
move 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue movecmd(const UniValue& params, bool fHelp); // 账户间转移资金
```

实现在“wallet/rpcwallet.cpp”文件中。

```cpp
UniValue movecmd(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 3 || params.size() > 5) // 参数至少 3 个，至多 5 个
        throw runtime_error( // 命令帮助反馈
            "move \"fromaccount\" \"toaccount\" amount ( minconf \"comment\" )\n"
            "\nDEPRECATED. Move a specified amount from one account in your wallet to another.\n"
            "\nArguments:\n"
            "1. \"fromaccount\"   (string, required) The name of the account to move funds from. May be the default account using \"\".\n"
            "2. \"toaccount\"     (string, required) The name of the account to move funds to. May be the default account using \"\".\n"
            "3. amount            (numeric) Quantity of " + CURRENCY_UNIT + " to move between accounts.\n"
            "4. minconf           (numeric, optional, default=1) Only use funds with at least this many confirmations.\n"
            "5. \"comment\"       (string, optional) An optional comment, stored in the wallet only.\n"
            "\nResult:\n"
            "true|false           (boolean) true if successful.\n"
            "\nExamples:\n"
            "\nMove 0.01 " + CURRENCY_UNIT + " from the default account to the account named tabby\n"
            + HelpExampleCli("move", "\"\" \"tabby\" 0.01") +
            "\nMove 0.01 " + CURRENCY_UNIT + " timotei to akiko with a comment and funds have 6 confirmations\n"
            + HelpExampleCli("move", "\"timotei\" \"akiko\" 0.01 6 \"happy birthday!\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("move", "\"timotei\", \"akiko\", 0.01, 6, \"happy birthday!\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strFrom = AccountFromValue(params[0]); // 起始账户
    string strTo = AccountFromValue(params[1]); // 目标账户
    CAmount nAmount = AmountFromValue(params[2]); // 转账金额
    if (nAmount <= 0) // 转账金额不能小于 0
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid amount for send");
    if (params.size() > 3)
        // unused parameter, used to be nMinDepth, keep type-checking it though
        (void)params[3].get_int(); // 未使用的参数，曾经是最小深度，目前保持类型检查
    string strComment;
    if (params.size() > 4)
        strComment = params[4].get_str(); // 获取备注

    CWalletDB walletdb(pwalletMain->strWalletFile); // 创建钱包数据库对象
    if (!walletdb.TxnBegin()) // 数据库初始化检查
        throw JSONRPCError(RPC_DATABASE_ERROR, "database error");

    int64_t nNow = GetAdjustedTime(); // 获取当前时间

    // Debit // 借出
    CAccountingEntry debit; // 创建账户条目类（用于内部转账）借出对象
    debit.nOrderPos = pwalletMain->IncOrderPosNext(&walletdb); // 增加下一条交易的序号
    debit.strAccount = strFrom; // 借出账户
    debit.nCreditDebit = -nAmount; // 金额标记为负数，表示借出
    debit.nTime = nNow; // 记录借出时间
    debit.strOtherAccount = strTo; // 标记借出的目标账户
    debit.strComment = strComment; // 记录备注信息
    pwalletMain->AddAccountingEntry(debit, walletdb); // 把该账户条目加入钱包数据库

    // Credit // 贷入
    CAccountingEntry credit; //  创建账户条目类（用于内部转账）贷入对象
    credit.nOrderPos = pwalletMain->IncOrderPosNext(&walletdb); // 增加下一条交易的序号
    credit.strAccount = strTo; // 贷入账户
    credit.nCreditDebit = nAmount; // 金额标记为正数，表示贷入
    credit.nTime = nNow; // 记录到账时间
    credit.strOtherAccount = strFrom; // 标记贷入的起始账户
    credit.strComment = strComment; // 记录备注信息
    pwalletMain->AddAccountingEntry(credit, walletdb); // 把该账户条目加入钱包数据库

    if (!walletdb.TxnCommit()) // 钱包数据库交易提交
        throw JSONRPCError(RPC_DATABASE_ERROR, "database error");

    return true; // 成功返回 true
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取相关参数：2 个转账地址，转账金额，确认数（暂时无用），备注（只保存在钱包中）。<br>
5.创建钱包数据库对象，并检查是否初始化成功。<br>
6.创建账户条目（借出、贷入）对象，并初始化相关值。<br>
7.进行钱包数据交易提交，若成功，则返回 true。

第六步，调用 pwalletMain->IncOrderPosNext(&walletdb) 增加下一条交易的序号，并写入钱包数据库。
调用 pwalletMain->AddAccountingEntry(credit, walletdb) 把初始化的账户条目加入钱包。
它们声明在“wallet/wallet.h”文件的 CWallet 类中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    /** 
     * Increment the next transaction order id
     * @return next transaction order id
     */ // 增加下一条交易序号，返回下一个交易的序号
    int64_t IncOrderPosNext(CWalletDB *pwalletdb = NULL);
    ...
    bool AddAccountingEntry(const CAccountingEntry&, CWalletDB & pwalletdb); // 添加账户条目到钱包数据库
    ...
};
```

实现在“wallet/wallet.cpp”文件中。

```cpp
int64_t CWallet::IncOrderPosNext(CWalletDB *pwalletdb)
{
    AssertLockHeld(cs_wallet); // nOrderPosNext
    int64_t nRet = nOrderPosNext++; // 序号 +1
    if (pwalletdb) { // 若钱包数据库对象存在
        pwalletdb->WriteOrderPosNext(nOrderPosNext); // 写入数据库
    } else {
        CWalletDB(strWalletFile).WriteOrderPosNext(nOrderPosNext);
    }
    return nRet; // 返回增加后的下一条交易序号
}
...
bool CWallet::AddAccountingEntry(const CAccountingEntry& acentry, CWalletDB & pwalletdb)
{
    if (!pwalletdb.WriteAccountingEntry_Backend(acentry)) // 写入账户条目末端
        return false;

    laccentries.push_back(acentry); // 加入账户条目列表
    CAccountingEntry & entry = laccentries.back(); // 获取列表中的最后一个（该）条目
    wtxOrdered.insert(make_pair(entry.nOrderPos, TxPair((CWalletTx*)0, &entry))); // 插入有序交易映射列表

    return true;
}
```

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#move){:target="_blank"}
