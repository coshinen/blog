---
layout: post
title:  "比特币 RPC 命令剖析 \"lockunspent\""
date:   2018-06-05 16:40:29 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli lockunspent unlock [{"txid":"txid","vout":n},...]
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
lockunspent unlock [{"txid":"txid","vout":n},...] # 临时加锁（unlock=false）或解锁（unlock=true）指定的交易输出
{% endhighlight %}

更新不可花费的临时输出列表。<br>
一个锁定的交易输出，当花费比特币时，将不会被自动筛选币选中。<br>
该锁只存储在内存中。节点启动时零个锁定的输出，且当一个节点停止或崩溃时，锁定的输出列表总会被清空。<br>
也可以查看 [`listunspent`](/2018/06/05/bitcoin-rpc-command-listunspent)。

参数：<br>
1. `unlock` （布尔型，必备）指定交易是否解锁（true）或上锁（false）。<br>
2. `transactions` （字符串，可选，默认为全部交易输出）一个 json 对象数组。每个对象的交易索引（字符串）和交易输出序号（数字）。<br>
{% highlight shell %}
     [           （json 对象的 json 数组）
       {
         "txid":"id",    （字符串）交易索引
         "vout": n         （数字）输出序号
       }
       ,...
     ]
{% endhighlight %}

结果：（布尔型）返回 true 表示成功，false 表示失败。

## 用法示例

### 比特币核心客户端

1. 使用 [`listunspent`](/2018/06/05/bitcoin-rpc-command-listunspent) 获取未花费的交易输出列表。<br>
2. 使用该命令对其中一个未花费的交易输出加临时锁。<br>
3. 使用 [`listlockunspent`](/2018/06/05/bitcoin-rpc-command-listlockunspent) 查看未花费交易输出的临时锁定列表。

{% highlight shell %}
$ bitcoin-cli listunspent
[
  ...
  {
    "txid": "8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff",
    "vout": 0,
    "address": "1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb",
    "scriptPubKey": "21023d2f5ddafe8a161867bb9a9162aa5c84b0882af4bfca1fa89f4811b651761f10ac",
    "amount": 50.00000000,
    "confirmations": 6631,
    "spendable": true
  }
]
$ bitcoin-cli lockunspent false "[{\"txid\":\"8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff\",\"vout\":0}]"
true
$ bitcoin-cli listlockunspent
[
  {
    "txid": "8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff",
    "vout": 0
  }
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "lockunspent", "params": [false, "[{\"txid\":\"8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff\",\"vout\":0}]"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
暂无。
{% endhighlight %}

## 源码剖析
`lockunspent` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue lockunspent(const UniValue& params, bool fHelp); // 加解锁未花费的交易输出
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue lockunspent(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数只能是 1 个或 2 个
        throw runtime_error( // 命令帮助反馈
            "lockunspent unlock [{\"txid\":\"txid\",\"vout\":n},...]\n"
            "\nUpdates list of temporarily unspendable outputs.\n"
            "Temporarily lock (unlock=false) or unlock (unlock=true) specified transaction outputs.\n"
            "A locked transaction output will not be chosen by automatic coin selection, when spending bitcoins.\n"
            "Locks are stored in memory only. Nodes start with zero locked outputs, and the locked output list\n"
            "is always cleared (by virtue of process exit) when a node stops or fails.\n"
            "Also see the listunspent call\n"
            "\nArguments:\n"
            "1. unlock            (boolean, required) Whether to unlock (true) or lock (false) the specified transactions\n"
            "2. \"transactions\"  (string, required) A json array of objects. Each object the txid (string) vout (numeric)\n"
            "     [           (json array of json objects)\n"
            "       {\n"
            "         \"txid\":\"id\",    (string) The transaction id\n"
            "         \"vout\": n         (numeric) The output number\n"
            "       }\n"
            "       ,...\n"
            "     ]\n"

            "\nResult:\n"
            "true|false    (boolean) Whether the command was successful or not\n"

            "\nExamples:\n"
            "\nList the unspent transactions\n"
            + HelpExampleCli("listunspent", "") +
            "\nLock an unspent transaction\n"
            + HelpExampleCli("lockunspent", "false \"[{\\\"txid\\\":\\\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\\\",\\\"vout\\\":1}]\"") +
            "\nList the locked transactions\n"
            + HelpExampleCli("listlockunspent", "") +
            "\nUnlock the transaction again\n"
            + HelpExampleCli("lockunspent", "true \"[{\\\"txid\\\":\\\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\\\",\\\"vout\\\":1}]\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("lockunspent", "false, \"[{\\\"txid\\\":\\\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\\\",\\\"vout\\\":1}]\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (params.size() == 1) // 若只有一个参数
        RPCTypeCheck(params, boost::assign::list_of(UniValue::VBOOL)); // 验证参数类型
    else
        RPCTypeCheck(params, boost::assign::list_of(UniValue::VBOOL)(UniValue::VARR));

    bool fUnlock = params[0].get_bool(); // 获取加解锁的状态

    if (params.size() == 1) { // 若只有一个参数
        if (fUnlock) // 若是解锁
            pwalletMain->UnlockAllCoins(); // 解锁全部
        return true;
    }

    UniValue outputs = params[1].get_array(); // 获取交易输出索引数组
    for (unsigned int idx = 0; idx < outputs.size(); idx++) { // 遍历该数组
        const UniValue& output = outputs[idx]; // 获取一个对象（交易输出索引）
        if (!output.isObject())
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, expected object");
        const UniValue& o = output.get_obj(); // 获取该对象

        RPCTypeCheckObj(o, boost::assign::map_list_of("txid", UniValue::VSTR)("vout", UniValue::VNUM)); // 检查对象类型，"交易索引" 为字符串，"交易输出索引" 为数字型

        string txid = find_value(o, "txid").get_str(); // 获取交易索引
        if (!IsHex(txid)) // 判断是否为 16 进制
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, expected hex txid");

        int nOutput = find_value(o, "vout").get_int(); // 获取交易输出索引
        if (nOutput < 0) // 该值大于等于 0
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, vout must be positive");

        COutPoint outpt(uint256S(txid), nOutput); // 构建一个输出点对象

        if (fUnlock) // 若解锁
            pwalletMain->UnlockCoin(outpt); // 解锁该交易输出
        else // 加锁
            pwalletMain->LockCoin(outpt); // 加锁该交易输出
    }

    return true; // 成功返回 true
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
3.检查参数类型。<br>
4.若只用一个参数，且为 true，则解锁全部交易输出并返回 true。<br>
5.若指定了交易输出索引，获取并遍历该数组，把指定交易输出加/解锁后返回 true。

相关加解锁函数声明在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    void LockCoin(COutPoint& output); // 锁定指定交易输出
    void UnlockCoin(COutPoint& output); // 解锁指定交易输出
    void UnlockAllCoins(); // 解锁全部交易输出
    ...
};
{% endhighlight %}

实现在“wallet.cpp”文件中。

{% highlight C++ %}
void CWallet::LockCoin(COutPoint& output)
{
    AssertLockHeld(cs_wallet); // setLockedCoins
    setLockedCoins.insert(output); // 加入锁定的交易输出集合
}

void CWallet::UnlockCoin(COutPoint& output)
{
    AssertLockHeld(cs_wallet); // setLockedCoins
    setLockedCoins.erase(output); // 擦除指定的交易输出
}

void CWallet::UnlockAllCoins()
{
    AssertLockHeld(cs_wallet); // setLockedCoins
    setLockedCoins.clear(); // 清空锁定的交易输出集合
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#lockunspent)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
