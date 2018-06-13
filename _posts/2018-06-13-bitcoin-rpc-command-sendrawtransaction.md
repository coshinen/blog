---
layout: post
title:  "比特币 RPC 命令剖析 \"sendrawtransaction\""
date:   2018-06-13 10:54:02 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
sendrawtransaction "hexstring" ( allowhighfees ) # 把（序列化的，16 进制编码的）原始交易提交到本地节点和网络
{% endhighlight %}

也可以查看 [`createrawtransaction`](/2018/06/13/bitcoin-rpc-command-createrawtransaction) 和 [`signrawtransaction`]() 调用。

参数：<br>
1. `hexstring` （字符串，必备）原始交易的 16 进制字符串。<br>
2. `allowhighfees` （布尔型，可选，默认为 false）允许高费用。

结果：（字符串）返回 16 进制交易索引字符串。

## 用法示例

{% highlight shell %}
$ bitcoin-cli createrawtransaction "[{\"txid\":\"9db0a0580f5483c634bd549f1c2e4e6f7881b3e52b84ee5cad2431c13e3e916e\",\"vout\":0}]" "{\"1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS\":0.01}"
01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
$ bitcoin-cli signrawtransaction 01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
{
  "hex": "01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d000000006b483045022100b66be9e04de6b0846a4e3cd08f327789f1607980e851e8b6a8cfca4428697c0b022036fa51060ca8d6b275dbdb753c322a171abce50ca17321448574867e518ab6e0012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000",
  "complete": true
}
$ bitcoin-cli sendrawtransaction 01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d000000006b483045022100b66be9e04de6b0846a4e3cd08f327789f1607980e851e8b6a8cfca4428697c0b022036fa51060ca8d6b275dbdb753c322a171abce50ca17321448574867e518ab6e0012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000 true
dd9dff9d384040a86157d4b77f1593349f7af64e48200b675b806931d398238d
$ bitcoin-cli gettransaction dd9dff9d384040a86157d4b77f1593349f7af64e48200b675b806931d398238d
{
  "amount": -0.01000000,
  "fee": -0.09000000,
  "confirmations": 23,
  "instantlock": false,
  "blockhash": "00004da226953d28c7fabbf792b6131ac2cd6cc08b24cf73ae1e21ef6464b44a",
  "blockindex": 1,
  "blocktime": 1528860704,
  "txid": "dd9dff9d384040a86157d4b77f1593349f7af64e48200b675b806931d398238d",
  "walletconflicts": [
  ],
  "time": 1528860702,
  "timereceived": 1528860702,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS",
      "category": "send",
      "amount": -0.01000000,
      "vout": 0,
      "fee": -0.09000000,
      "abandoned": false
    }
  ],
  "hex": "01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d000000006b483045022100b66be9e04de6b0846a4e3cd08f327789f1607980e851e8b6a8cfca4428697c0b022036fa51060ca8d6b275dbdb753c322a171abce50ca17321448574867e518ab6e0012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000"
}
{% endhighlight %}

**注：这里因交易未设置找零地址而导致交易费过高，所以要设置允许交易费超额。**

## 源码剖析
`sendrawtransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue sendrawtransaction(const UniValue& params, bool fHelp); // 发送原始交易
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
UniValue sendrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 或 2 个
        throw runtime_error( // 命令帮助反馈
            "sendrawtransaction \"hexstring\" ( allowhighfees )\n"
            "\nSubmits raw transaction (serialized, hex-encoded) to local node and network.\n"
            "\nAlso see createrawtransaction and signrawtransaction calls.\n"
            "\nArguments:\n"
            "1. \"hexstring\"    (string, required) The hex string of the raw transaction)\n"
            "2. allowhighfees    (boolean, optional, default=false) Allow high fees\n"
            "\nResult:\n"
            "\"hex\"             (string) The transaction hash in hex\n"
            "\nExamples:\n"
            "\nCreate a transaction\n"
            + HelpExampleCli("createrawtransaction", "\"[{\\\"txid\\\" : \\\"mytxid\\\",\\\"vout\\\":0}]\" \"{\\\"myaddress\\\":0.01}\"") +
            "Sign the transaction, and get back the hex\n"
            + HelpExampleCli("signrawtransaction", "\"myhex\"") +
            "\nSend the transaction (signed hex)\n"
            + HelpExampleCli("sendrawtransaction", "\"signedhex\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("sendrawtransaction", "\"signedhex\"")
        );

    LOCK(cs_main); // 上锁
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)(UniValue::VBOOL)); // 参数类型检查

    // parse hex string from parameter
    CTransaction tx;
    if (!DecodeHexTx(tx, params[0].get_str())) // 从参数解析 16 进制字符串
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");
    uint256 hashTx = tx.GetHash(); // 获取交易哈希

    bool fOverrideFees = false; // 交易费超额标志，默认不允许
    if (params.size() > 1)
        fOverrideFees = params[1].get_bool(); // 获取交易费超额设置

    CCoinsViewCache &view = *pcoinsTip;
    const CCoins* existingCoins = view.AccessCoins(hashTx); // 获取该交易的修剪版本
    bool fHaveMempool = mempool.exists(hashTx); // 交易内存池中是否存在该交易
    bool fHaveChain = existingCoins && existingCoins->nHeight < 1000000000; // 交易的高度限制
    if (!fHaveMempool && !fHaveChain) { // 若该交易不在交易内存池中 且 超过了高度限制即没有上链
        // push to local node and sync with wallets // 推送到本地节点并同步钱包
        CValidationState state;
        bool fMissingInputs;
        if (!AcceptToMemoryPool(mempool, state, tx, false, &fMissingInputs, false, !fOverrideFees)) { // 首先放入交易内存池
            if (state.IsInvalid()) { // 放入状态检测
                throw JSONRPCError(RPC_TRANSACTION_REJECTED, strprintf("%i: %s", state.GetRejectCode(), state.GetRejectReason()));
            } else {
                if (fMissingInputs) {
                    throw JSONRPCError(RPC_TRANSACTION_ERROR, "Missing inputs");
                }
                throw JSONRPCError(RPC_TRANSACTION_ERROR, state.GetRejectReason());
            }
        }
    } else if (fHaveChain) {
        throw JSONRPCError(RPC_TRANSACTION_ALREADY_IN_CHAIN, "transaction already in block chain");
    }
    RelayTransaction(tx); // 然后中继（发送）该交易

    return hashTx.GetHex(); // 交易哈希转换为 16 进制并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁，检验参数类型。<br>
3.获取各参数：交易哈希和交易费超额设置。<br>
4.获取该交易在缓存中的修剪版本，验证该交易是否存在于内存池且交易高度。<br>
5.若不存在于内存池且未上链，则把此交易放入交易内存池。<br>
6.中继（发送）该交易。<br>
7.获取交易哈希，转换为 16 进制并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#sendrawtransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
