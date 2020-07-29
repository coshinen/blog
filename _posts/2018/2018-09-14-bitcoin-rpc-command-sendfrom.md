---
layout: post
title:  "比特币 RPC 命令剖析 \"sendfrom\""
date:   2018-09-14 15:59:43 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" )
---
## 提示说明

```shell
sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" ) # （已过时）从一个账户发送金额到一个比特币地址
```

**使用 [sendtoaddress](/blog/2018/09/bitcoin-rpc-command-sendtoaddress.html) 替代该命令。<br>
使用该命令前需要调用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) 解锁钱包。**

参数：
1. fromaccount（字符串，必备）从该账户发送资金。默认账户使用 ""。
2. tobitcoinaddress（字符串，必备）发送资金到的比特币地址。
3. amount（数字或字符串，必备）以 BTC 为单位的金额（交易费加在上面）。
4. minconf（数字，可选，默认为 1）只使用至少 minconf 次确认的资金。
5. comment（字符串，可选）用于存储交易的备注。这不是交易的一部分，只保存在你的钱包中。
6. comment-to（字符串，可选）存储你要发送交易的个人或组织名的备注。这不是交易的一部分，只保存在你的钱包中。

结果：（字符串）返回交易索引。

## 用法示例

### 比特币核心客户端

**使用该命令前，先调用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) 解锁钱包，<br>
使用该命令后，再调用 [walletlock](/blog/2018/09/bitcoin-rpc-command-walletlock.html) 锁定钱包。**

用法一：从默认账户发送 0.01 BTC 到指定地址，资金必须至少 1 次确认。

```shell
$ bitcoin-cli sendfrom "" 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.01
5ef2e350852ac84977fa2bff1a980bb7095046066d17b3a383f3ccd6c091cf1b
```

用法二：从账户 tabby 发送 0.01 BTC 到指定地址，资金必须至少 6 次确认，并增加备注。

```shell
$ bitcoin-cli sendfrom "tabby" 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.01 6 "donation" "seans outpost"
2165d605c35472ddb84fbacb51b6d7c39d412b58493ef7209503003ad6b79be7
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendfrom", "params": ["tabby", "1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd", 0.01, 6, "donation", "seans outpost"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"2165d605c35472ddb84fbacb51b6d7c39d412b58493ef7209503003ad6b79be7","error":null,"id":"curltest"}
```

## 源码剖析

sendfrom 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue sendfrom(const UniValue& params, bool fHelp); // 从指定账户发送金额
```

实现在“wallet/rpcwallet.cpp”文件中。

```cpp
UniValue sendfrom(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 3 || params.size() > 6) // 参数至少为 3 个，至多为 6 个
        throw runtime_error( // 命令帮助反馈
            "sendfrom \"fromaccount\" \"tobitcoinaddress\" amount ( minconf \"comment\" \"comment-to\" )\n"
            "\nDEPRECATED (use sendtoaddress). Sent an amount from an account to a bitcoin address."
            + HelpRequiringPassphrase() + "\n"
            "\nArguments:\n"
            "1. \"fromaccount\"       (string, required) The name of the account to send funds from. May be the default account using \"\".\n"
            "2. \"tobitcoinaddress\"  (string, required) The bitcoin address to send funds to.\n"
            "3. amount                (numeric or string, required) The amount in " + CURRENCY_UNIT + " (transaction fee is added on top).\n"
            "4. minconf               (numeric, optional, default=1) Only use funds with at least this many confirmations.\n"
            "5. \"comment\"           (string, optional) A comment used to store what the transaction is for. \n"
            "                                     This is not part of the transaction, just kept in your wallet.\n"
            "6. \"comment-to\"        (string, optional) An optional comment to store the name of the person or organization \n"
            "                                     to which you're sending the transaction. This is not part of the transaction, \n"
            "                                     it is just kept in your wallet.\n"
            "\nResult:\n"
            "\"transactionid\"        (string) The transaction id.\n"
            "\nExamples:\n"
            "\nSend 0.01 " + CURRENCY_UNIT + " from the default account to the address, must have at least 1 confirmation\n"
            + HelpExampleCli("sendfrom", "\"\" \"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\" 0.01") +
            "\nSend 0.01 from the tabby account to the given address, funds must have at least 6 confirmations\n"
            + HelpExampleCli("sendfrom", "\"tabby\" \"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\" 0.01 6 \"donation\" \"seans outpost\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("sendfrom", "\"tabby\", \"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\", 0.01, 6, \"donation\", \"seans outpost\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strAccount = AccountFromValue(params[0]); // 获取指定账户
    CBitcoinAddress address(params[1].get_str()); // 获取目标比特币地址
    if (!address.IsValid()) // 验证地址是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");
    CAmount nAmount = AmountFromValue(params[2]); // 获取发送金额
    if (nAmount <= 0) // 该金额必须大于 0
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid amount for send");
    int nMinDepth = 1; // 最小深度（确认数）
    if (params.size() > 3)
        nMinDepth = params[3].get_int(); // 获取最小确认数

    CWalletTx wtx; // 创建钱包交易
    wtx.strFromAccount = strAccount; // 初始化发送账户
    if (params.size() > 4 && !params[4].isNull() && !params[4].get_str().empty())
        wtx.mapValue["comment"] = params[4].get_str(); // 交易备注
    if (params.size() > 5 && !params[5].isNull() && !params[5].get_str().empty())
        wtx.mapValue["to"]      = params[5].get_str(); // 交易人或组织备注

    EnsureWalletIsUnlocked(); // 确保当前钱包处于为解密状态

    // Check funds // 检查资金
    CAmount nBalance = GetAccountBalance(strAccount, nMinDepth, ISMINE_SPENDABLE); // 获取指定账户余额
    if (nAmount > nBalance) // 发送金额不能大于该账户余额
        throw JSONRPCError(RPC_WALLET_INSUFFICIENT_FUNDS, "Account has insufficient funds");

    SendMoney(address.Get(), nAmount, false, wtx); // 发送金额

    return wtx.GetHash().GetHex(); // 获取交易哈希，转换为 16 进制并返回
}
```

基本流程：
1. 确保钱包当前可用（已初始化完成）。
2. 处理命令帮助和参数个数。
3. 钱包上锁。
4. 获取相关参数：指定账户，目标地址，发送金额，最小确认数和交易备注。
5. 创建钱包交易并初始化发送账户和交易备注。
6. 确保当前钱包处于为解密状态。
7. 检查余额是否充足。
8. 发送金额到指定的地址。
9. 获取交易哈希，转化为 16 进制并返回。

第八步，调用 SendMoney(address.Get(), nAmount, false, wtx) 发送交易，
见 [比特币 RPC 命令剖析 sendtoaddress](/blog/2018/09/bitcoin-rpc-command-sendtoaddress.html)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
