---
layout: post
title:  "比特币 RPC 命令「sendmany」"
date:   2018-09-17 20:45:05 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help sendmany
sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )

多次发送。金额是双精度浮点数。
使用该命令前需要调用 walletpassphrase 解锁钱包。

参数：
1. "fromaccount"        （字符串，必备）已过时。从该账户发送资金。默认账户应为 ""
2. "amounts"            （字符串，必备）一个地址和金额的 json 对象
    {
      "address":amount  （数字或字符串）比特币地址是键，以 BTC 为单位的数字型（可以为字符串）金额是值
      ,...
    }
3. minconf              （数字，可选，默认 = 1）只使用至少这么多次确认的余额。
4. "comment"            （字符串，可选）一条备注
5. subtractfeefromamount（字符串，可选）一个地址的 json 数组。
                        该费用将从每个选中的地址的金额中均等扣除。
                        这些收款者将会收到比你在金额区域输入的少的比特币。
                        如果这里没有指定地址，则发送者支付交易费。
    [
      "address"         （字符串）从这个地址减去交易费
      ,...
    ]

结果：
"transactionid"（字符串）发送的交易索引。不管有多少地址，只创建一笔交易。

例子：

发送两笔金额到两个不同的地址：
> bitcoin-cli sendmany "" "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}"

发送两笔金额到两个不同的地址，并设置确认数和备注：
> bitcoin-cli sendmany "" "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}" 6 "testing"

发送两笔金额到两个不同的地址，从金额中扣除交易费：
> bitcoin-cli sendmany "" "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}" 1 "" "[\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\",\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\"]"

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendmany", "params": ["", "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}", 6, "testing"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`sendmany` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue sendmany(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue sendmany(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 2 || params.size() > 5)
        throw runtime_error(
            "sendmany \"fromaccount\" {\"address\":amount,...} ( minconf \"comment\" [\"address\",...] )\n"
            "\nSend multiple times. Amounts are double-precision floating point numbers."
            + HelpRequiringPassphrase() + "\n"
            "\nArguments:\n"
            "1. \"fromaccount\"         (string, required) DEPRECATED. The account to send the funds from. Should be \"\" for the default account\n"
            "2. \"amounts\"             (string, required) A json object with addresses and amounts\n"
            "    {\n"
            "      \"address\":amount   (numeric or string) The bitcoin address is the key, the numeric amount (can be string) in " + CURRENCY_UNIT + " is the value\n"
            "      ,...\n"
            "    }\n"
            "3. minconf                 (numeric, optional, default=1) Only use the balance confirmed at least this many times.\n"
            "4. \"comment\"             (string, optional) A comment\n"
            "5. subtractfeefromamount   (string, optional) A json array with addresses.\n"
            "                           The fee will be equally deducted from the amount of each selected address.\n"
            "                           Those recipients will receive less bitcoins than you enter in their corresponding amount field.\n"
            "                           If no addresses are specified here, the sender pays the fee.\n"
            "    [\n"
            "      \"address\"            (string) Subtract fee from this address\n"
            "      ,...\n"
            "    ]\n"
            "\nResult:\n"
            "\"transactionid\"          (string) The transaction id for the send. Only 1 transaction is created regardless of \n"
            "                                    the number of addresses.\n"
            "\nExamples:\n"
            "\nSend two amounts to two different addresses:\n"
            + HelpExampleCli("sendmany", "\"\" \"{\\\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\\\":0.01,\\\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\\\":0.02}\"") +
            "\nSend two amounts to two different addresses setting the confirmation and comment:\n"
            + HelpExampleCli("sendmany", "\"\" \"{\\\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\\\":0.01,\\\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\\\":0.02}\" 6 \"testing\"") +
            "\nSend two amounts to two different addresses, subtract fee from amount:\n"
            + HelpExampleCli("sendmany", "\"\" \"{\\\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\\\":0.01,\\\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\\\":0.02}\" 1 \"\" \"[\\\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\\\",\\\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\\\"]\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("sendmany", "\"\", \"{\\\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\\\":0.01,\\\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\\\":0.02}\", 6, \"testing\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    string strAccount = AccountFromValue(params[0]);
    UniValue sendTo = params[1].get_obj();
    int nMinDepth = 1;
    if (params.size() > 2)
        nMinDepth = params[2].get_int();

    CWalletTx wtx;
    wtx.strFromAccount = strAccount; // 初始化发送账户
    if (params.size() > 3 && !params[3].isNull() && !params[3].get_str().empty())
        wtx.mapValue["comment"] = params[3].get_str();

    UniValue subtractFeeFromAmount(UniValue::VARR);
    if (params.size() > 4)
        subtractFeeFromAmount = params[4].get_array();

    set<CBitcoinAddress> setAddress; // 比特币地址集
    vector<CRecipient> vecSend; // 发送列表

    CAmount totalAmount = 0; // 要发送的总金额
    vector<string> keys = sendTo.getKeys(); // 获取目的地址列表
    BOOST_FOREACH(const string& name_, keys) // 遍历地址列表
    {
        CBitcoinAddress address(name_); // 比特币地址对象
        if (!address.IsValid()) // 验证地址是否有效
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, string("Invalid Bitcoin address: ")+name_);

        if (setAddress.count(address)) // 地址集中不应该存在当前地址，保证发送到的地址不重复
            throw JSONRPCError(RPC_INVALID_PARAMETER, string("Invalid parameter, duplicated address: ")+name_);
        setAddress.insert(address); // 插入地址集

        CScript scriptPubKey = GetScriptForDestination(address.Get()); // 从地址获取公钥脚本
        CAmount nAmount = AmountFromValue(sendTo[name_]); // 获取该地址对应的金额
        if (nAmount <= 0) // 金额必须大于 0
            throw JSONRPCError(RPC_TYPE_ERROR, "Invalid amount for send");
        totalAmount += nAmount; // 累加金额

        bool fSubtractFeeFromAmount = false; // 是否从金额中减去交易费标志，初始化为 false
        for (unsigned int idx = 0; idx < subtractFeeFromAmount.size(); idx++) { // 遍历该对象
            const UniValue& addr = subtractFeeFromAmount[idx]; // 获取地址
            if (addr.get_str() == name_) // 若为指定的目的地址
                fSubtractFeeFromAmount = true; // 标志置为 true
        }

        CRecipient recipient = {scriptPubKey, nAmount, fSubtractFeeFromAmount}; // 初始化一个接收对象
        vecSend.push_back(recipient); // 加入发送列表
    }

    EnsureWalletIsUnlocked(); // 3. 确保钱包已解锁

    // Check funds // 4. 检查资金
    CAmount nBalance = GetAccountBalance(strAccount, nMinDepth, ISMINE_SPENDABLE); // 获取指定账户余额
    if (totalAmount > nBalance) // 发送总金额不能大于账户余额
        throw JSONRPCError(RPC_WALLET_INSUFFICIENT_FUNDS, "Account has insufficient funds");

    // Send // 5. 发送
    CReserveKey keyChange(pwalletMain); // 创建一个密钥池中的密钥条目
    CAmount nFeeRequired = 0; // 所需交易费
    int nChangePosRet = -1;
    string strFailReason; // 保存错误信息
    bool fCreated = pwalletMain->CreateTransaction(vecSend, wtx, keyChange, nFeeRequired, nChangePosRet, strFailReason); // 创建一笔交易
    if (!fCreated) // 检查交易状态
        throw JSONRPCError(RPC_WALLET_INSUFFICIENT_FUNDS, strFailReason);
    if (!pwalletMain->CommitTransaction(wtx, keyChange)) // 提交交易
        throw JSONRPCError(RPC_WALLET_ERROR, "Transaction commit failed");

    return wtx.GetHash().GetHex(); // 获取交易哈希，转换为 16 进制并返回
}
```

### 1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#1-确保钱包可用)。

### 2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 5. 发送

参考[比特币 RPC 命令「sendtoaddress」源码剖析](/blog/2018/09/bitcoin-rpc-sendtoaddress.html#源码剖析)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
