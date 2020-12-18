---
layout: post
title:  "比特币 RPC 命令剖析 \"move\""
date:   2018-09-13 20:03:06 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli move "fromaccount" "toaccount" amount ( minconf "comment" )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help move
move "fromaccount" "toaccount" amount ( minconf "comment" )

已过时。从你钱包中的一个账户移动一笔指定的金额到另一个账户。

参数：
1. "fromaccount"（字符串，必备）从该账户转移资金。可能使用默认账户 ""。
2. "toaccount"  （字符串，必备）转移资金到该账户。可能使用默认账户 ""。
3. amount       （数字）在账户间转移 BTC 的数量。
4. minconf      （数字，可选，默认为 1）只使用至少这么多次确认的资金。
5. "comment"    （字符串，可选）一个可选的备注，只存储在钱包中。

结果：
true|false（布尔型）若成功则为 true。

例子：

转移 0.01 BTC 从默认账户到名为 tabby 的账户
> bitcoin-cli move "" "tabby" 0.01

转移至少 6 次确认的 0.01 BTC 从 timotei 到 akiko，并附加一条备注
> bitcoin-cli move "timotei" "akiko" 0.01 6 "happy birthday!"

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "move", "params": ["timotei", "akiko", 0.01, 6, "happy birthday!"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`move` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue movecmd(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue movecmd(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 3 || params.size() > 5)
        throw runtime_error(
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
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    string strFrom = AccountFromValue(params[0]);
    string strTo = AccountFromValue(params[1]);
    CAmount nAmount = AmountFromValue(params[2]);
    if (nAmount <= 0)
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid amount for send");
    if (params.size() > 3)
        // unused parameter, used to be nMinDepth, keep type-checking it though
        (void)params[3].get_int(); // 未使用的参数，曾作为最小深度，目前保持类型检查
    string strComment;
    if (params.size() > 4)
        strComment = params[4].get_str();

    CWalletDB walletdb(pwalletMain->strWalletFile);
    if (!walletdb.TxnBegin())
        throw JSONRPCError(RPC_DATABASE_ERROR, "database error");

    int64_t nNow = GetAdjustedTime();

    // Debit
    CAccountingEntry debit; // 3. 借出
    debit.nOrderPos = pwalletMain->IncOrderPosNext(&walletdb); // 增加下一条交易的序号
    debit.strAccount = strFrom; // 借出账户
    debit.nCreditDebit = -nAmount; // 金额标记为负数，表示借出
    debit.nTime = nNow; // 记录借出时间
    debit.strOtherAccount = strTo; // 标记借出的目标账户
    debit.strComment = strComment; // 记录备注信息
    pwalletMain->AddAccountingEntry(debit, walletdb); // 把该账户条目加入钱包数据库

    // Credit
    CAccountingEntry credit; // 4. 贷入
    credit.nOrderPos = pwalletMain->IncOrderPosNext(&walletdb); // 增加下一条交易的序号
    credit.strAccount = strTo; // 贷入账户
    credit.nCreditDebit = nAmount; // 金额标记为正数，表示贷入
    credit.nTime = nNow; // 记录到账时间
    credit.strOtherAccount = strFrom; // 标记贷入的起始账户
    credit.strComment = strComment; // 记录备注信息
    pwalletMain->AddAccountingEntry(credit, walletdb); // 把该账户条目加入钱包数据库

    if (!walletdb.TxnCommit()) // 钱包数据库交易提交
        throw JSONRPCError(RPC_DATABASE_ERROR, "database error");

    return true;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 借出

增加下一条交易的序号函数 `pwalletMain->IncOrderPosNext(&walletdb)` 和增加账户条目函数 `pwalletMain->AddAccountingEntry(credit, walletdb)` 声明在文件 `wallet/wallet.h` 的钱包类 `CWallet` 中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    /** 
     * Increment the next transaction order id
     * @return next transaction order id
     */
    int64_t IncOrderPosNext(CWalletDB *pwalletdb = NULL); // 增加下一条交易序号，返回下一个交易的序号
    ...
    bool AddAccountingEntry(const CAccountingEntry&, CWalletDB & pwalletdb); // 添加账户条目到钱包数据库
    ...
};
```

实现在文件 `wallet/wallet.cpp` 中。

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
    return nRet;
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

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
