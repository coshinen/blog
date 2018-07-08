---
layout: post
title:  "比特币 RPC 命令剖析 \"sendmany\""
date:   2018-06-08 16:45:05 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] ) # 发送多次
{% endhighlight %}

**发送的金额是双精度浮点数。<br>
使用该命令前需要调用 [`walletpassphrase`](/2018/05/31/bitcoin-rpc-command-walletpassphrase) 解锁钱包。**

参数：<br>
1. `fromaccount` （字符串，必备，已过时）从该账户发送资金。应使用默认账户 `""`。<br>
2. `amounts` （字符串，必备）一个地址和金额的 json 对象。<br>
{% highlight shell %}
    {
      "address":amount   （数字或字符串）键是比特币地址，值是以 BTC 为单位的数字型（可以是字符串）金额
      ,...
    }
{% endhighlight %}
3.`minconf` （数字，可选，默认为 1）只使用至少 `minconf` 次确认的余额。<br>
4.`comment` （字符串，可选）一个备注。<br>
5.`subtractfeefromamount` （字符串，可选）一个存放地址的 json 数组。
费用将从每个选择的地址的金额中平均扣除。
这些接收者收到比你在金额区域输入的金额少的比特币。
如果这里没有指定地址，则发送者支付交易费。
{% highlight shell %}
    [
      "address"            （字符串）从该地址减去交易费
      ,...
    ]
{% endhighlight %}

结果：（字符串）返回发送的交易索引。不管有多少地址，只创建一笔交易。

## 用法示例

### 比特币核心客户端

**注：<br>
1. 不要删除 `\`，直接替换对应地址即可。<br>
2. 使用该命令前，先调用 [`walletpassphrase`](/2018/05/31/bitcoin-rpc-command-walletpassphrase) 解锁钱包。<br>
3. 使用该命令后，再调用 [`walletlock`](/2018/05/31/bitcoin-rpc-command-walletlock) 锁定钱包。**

用法一：发送两笔金额到两个不同的地址。

{% highlight shell %}
$ bitcoin-cli sendmany "" "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}"
973e6fa4495a76851a452d31c2287f0acd19f9e3d6078e34ca7d8e7dfadfa73e
$ bitcoin-cli gettransaction 973e6fa4495a76851a452d31c2287f0acd19f9e3d6078e34ca7d8e7dfadfa73e
{
  "amount": -0.03000000,
  "fee": -0.00000260,
  "confirmations": 8,
  "blockhash": "00001b7f5ac330c5cf2c52d723713a64a1096ca9a64df7dbbc3febea17bc3366",
  "blockindex": 1,
  "blocktime": 1528449625,
  "txid": "973e6fa4495a76851a452d31c2287f0acd19f9e3d6078e34ca7d8e7dfadfa73e",
  "walletconflicts": [
  ],
  "time": 1528449611,
  "timereceived": 1528449611,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ",
      "category": "send",
      "amount": -0.01000000,
      "vout": 0,
      "fee": -0.00000260,
      "abandoned": false
    }, 
    {
      "account": "",
      "address": "1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz",
      "category": "send",
      "amount": -0.02000000,
      "vout": 2,
      "fee": -0.00000260,
      "abandoned": false
    }
  ],
  "hex": "0100000001e79bb7d63a00039520f73e49582b419dc3d7b651cbba4fb8dd7254c305d66521010000006a4730440220330000ae15cd0bf12f948d758dfd05cdef9c77b2af2045d9464afcdff79b90d1022072b0f81796b010128e981fde406bc0bfa40a2756e50f47e365902cc44d872cd2012102c77e3d926275310ab12b91929d9707eb216aa14a5f30ae115dd969e7846fc33cfeffffff0340420f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88ac80841e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388ace83e4c00000000001976a9149fc2a2d085b22ef5eac19d787f6136aa6a53c72d88ac5d190100"
}
{% endhighlight %}

用法二：发送两笔金额到两个不同的地址，同时设置确认数和备注。

{% highlight shell %}
$ bitcoin-cli sendmany "" "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}" 6 "testing"
8be88b8242e5857f68693d57f9e371bb32e456eb43f46d65684a561862c58680
$ bitcoin-cli gettransaction 8be88b8242e5857f68693d57f9e371bb32e456eb43f46d65684a561862c58680
{
  "amount": -0.03000000,
  "fee": -0.00000260,
  "confirmations": 1,
  "blockhash": "0000429390bf30cba3a34de33a6938be16f70b1fb88a916b97df7816abd6df35",
  "blockindex": 1,
  "blocktime": 1528451528,
  "txid": "8be88b8242e5857f68693d57f9e371bb32e456eb43f46d65684a561862c58680",
  "walletconflicts": [
  ],
  "time": 1528451522,
  "timereceived": 1528451522,
  "bip125-replaceable": "no",
  "comment": "testing",
  "details": [
    {
      "account": "",
      "address": "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ",
      "category": "send",
      "amount": -0.01000000,
      "vout": 1,
      "fee": -0.00000260,
      "abandoned": false
    }, 
    {
      "account": "",
      "address": "1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz",
      "category": "send",
      "amount": -0.02000000,
      "vout": 2,
      "fee": -0.00000260,
      "abandoned": false
    }
  ],
  "hex": "01000000013ea7dffa7d8e7dca348e07d6e3f919cd0a7f28c2312d451a85765a49a46f3e97020000006a47304402200a2a1b988f6c48d25cf707f016b247610025c21a1c0d355f06a9f62208a44d5f02202f33067c54f3a4cb035119639308035358b79c8cdaff1e3ad211aa58f5e3bfab01210278cb1d48ee2c06204767977ae740d14d1671bd070e13d5aa6bcb85b5b38bcccbfeffffff0340420f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88ac25771e00000000001976a914a50523781231e180c26481e84dd569d24035fbc188ac80841e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388ac8e1a0100"
}
{% endhighlight %}

用法三：发送两笔金额到两个不同的地址，从金额中扣除交易费。

{% highlight shell %}
$ bitcoin-cli sendmany "" "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}" 1 "" "[\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\",\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\"]"
1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118
$ bitcoin-cli gettransaction 1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118
{
  "amount": -0.02999740,
  "fee": -0.00000260,
  "confirmations": 0,
  "trusted": true,
  "txid": "1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118",
  "walletconflicts": [
  ],
  "time": 1528451704,
  "timereceived": 1528451704,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ",
      "category": "send",
      "amount": -0.00999870,
      "vout": 0,
      "fee": -0.00000260,
      "abandoned": false
    }, 
    {
      "account": "",
      "address": "1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz",
      "category": "send",
      "amount": -0.01999870,
      "vout": 2,
      "fee": -0.00000260,
      "abandoned": false
    }
  ],
  "hex": "01000000017708d09c30b24ee303ef9fbcf4990d160fcf62a56d5218d4df0cef7c47321b15000000006b483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff03be410f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acfe831e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388acc0cf6a00000000001976a9149e0342205ce74dc6bb782d99b3269826e8d655b488acaa1a0100"
}
{% endhighlight %}

### cURL

{% highlight C++ %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendmany", "params": ["", "{\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\":0.01,\"1353tsE8YMTA4EuV7dgUXGjNFf9KpVvKHz\":0.02}", 6, "testing"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
暂无。
{% endhighlight %}

## 源码剖析
`sendmany` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue sendmany(const UniValue& params, bool fHelp); // 发送金额到多个地址
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue sendmany(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 2 || params.size() > 5) // 参数至少为 2 个，至多为 5 个
        throw runtime_error( // 命令帮助反馈
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
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strAccount = AccountFromValue(params[0]); // 获取指定账户
    UniValue sendTo = params[1].get_obj(); // 获取发送对象（地址和金额）
    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 2)
        nMinDepth = params[2].get_int(); // 获取最小确认数

    CWalletTx wtx; // 创建一笔钱包交易
    wtx.strFromAccount = strAccount; // 初始化发送账户
    if (params.size() > 3 && !params[3].isNull() && !params[3].get_str().empty())
        wtx.mapValue["comment"] = params[3].get_str(); // 获取交易备注

    UniValue subtractFeeFromAmount(UniValue::VARR);
    if (params.size() > 4)
        subtractFeeFromAmount = params[4].get_array(); // 获取数组类型的从金额中减去交易费

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

    EnsureWalletIsUnlocked(); // 确保当前钱包处于解密状态

    // Check funds // 检查资金
    CAmount nBalance = GetAccountBalance(strAccount, nMinDepth, ISMINE_SPENDABLE); // 获取指定账户余额
    if (totalAmount > nBalance) // 发送总金额不能大于账户余额
        throw JSONRPCError(RPC_WALLET_INSUFFICIENT_FUNDS, "Account has insufficient funds");

    // Send // 发送
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
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取相关参数：指定账户，目标地址和发送金额组成的对象，最小确认数，交易备注，是否从金额中减去交易费的标志。<br>
5.获取发送的目的地址列表，遍历该列表获取要发送的总金额以及由接收对象组成的发送列表。<br>
6.确保当前钱包处于为解密状态。<br>
7.检查指定账户余额是否充足。<br>
8.发送金额到指定的地址。<br>
9.获取交易哈希，转化为 16 进制并返回。

第八步，相关的函数调用，
见 [比特币 RPC 命令剖析 sendtoaddress](/2018/07/06/bitcoin-rpc-command-sendtoaddress)。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#sendmany)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
