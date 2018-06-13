---
layout: post
title:  "比特币 RPC 命令剖析 \"fundrawtransaction\""
date:   2018-06-13 13:21:44 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
fundrawtransaction "hexstring" includeWatching # 把输入添加到交易中，直到它有足够的金额满足其输出
{% endhighlight %}

**此操作不会修改现存的输入，并且会添加一个找零输出到输出列表。<br>
注：因为输入/输出已被添加，所以签名后的输入可能需要在完成后重签。<br>
使用 [`signrawtransaction`](/2018/06/13/bitcoin-rpc-command-signrawtransaction) 已添加的输入将不会被签名。<br>
注意所有现存的输入在钱包中必须有它们前一个输出交易。<br>
注意所选的全部输入必须是标准格式，且在钱包中的 P2SH 脚本必须使用 [`importaddress`](/2018/06/07/bitcoin-rpc-command-importaddress) 和 [`addmultisigaddress`]()（用来计算交易费）。<br>
watch-only 目前只支持 P2PKH，多签，和 P2SH 版本。**

参数：<br>
1. `hexstring` （字符串，必备）原始交易的 16 进制字符串。<br>
2. `includeWatching` （布尔型，可选，默认为 false）选择 watch-only 的输入。

结果：<br>
{% highlight shell %}
{
  "hex":       "value", (string)  The resulting raw transaction (hex-encoded string)
  "fee":       n,         (numeric) Fee the resulting transaction pays
  "changepos": n          (numeric) The position of the added change output, or -1
}
"hex"             
{% endhighlight %}

## 用法示例

为创建的空输入的原始交易资助足够的输入以供输出。

{% highlight shell %}
$ bitcoin-cli createrawtransaction "[]" "{\"4UX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS\":0.01}"
01000000000140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
$ bitcoin-cli decoderawtransaction 01000000000140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
{
  "txid": "70104bdc326608f5c7a49f5692b06456579a8486f77be73ab9003a096f3a3d6f",
  "size": 44,
  "version": 1,
  "locktime": 0,
  "vin": [
  ],
  "vout": [
    {
      "value": 0.01000000,
      "valueSat": 1000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 a282769e3b2aa722dbcb2c04219893a35520d025 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914a282769e3b2aa722dbcb2c04219893a35520d02588ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS"
        ]
      }
    }
  ]
}
$ bitcoin-cli fundrawtransaction 01000000000140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
{
  "hex": "010000000118d1f31bf855d6a25ec1dc17e649f0197a4d713c08ef5cf163bdc0ef0fac03190200000000feffffff0240420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac9e8c5b00000000001976a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac00000000",
  "changepos": 1,
  "fee": 0.00000226
}
$ bitcoin-cli signrawtransaction 010000000118d1f31bf855d6a25ec1dc17e649f0197a4d713c08ef5cf163bdc0ef0fac03190200000000feffffff0240420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac9e8c5b00000000001976a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac00000000
{
  "hex": "010000000118d1f31bf855d6a25ec1dc17e649f0197a4d713c08ef5cf163bdc0ef0fac0319020000006a47304402207468bc1c9aba305bb8ce23024e6fe5e1f37b2931a217015effd931075bb3994302206762c49704903e9acee02242cfb006c02af77df375bd3bbfc56983db4e9673b60121025f2308ae80205003bec46daa936c72bd148e0e8b02b33254c45badef54c339d1feffffff0240420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac9e8c5b00000000001976a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac00000000",
  "complete": true
}
$ bitcoin-cli sendrawtransaction 010000000118d1f31bf855d6a25ec1dc17e649f0197a4d713c08ef5cf163bdc0ef0fac0319020000006a47304402207468bc1c9aba305bb8ce23024e6fe5e1f37b2931a217015effd931075bb3994302206762c49704903e9acee02242cfb006c02af77df375bd3bbfc56983db4e9673b60121025f2308ae80205003bec46daa936c72bd148e0e8b02b33254c45badef54c339d1feffffff0240420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac9e8c5b00000000001976a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac00000000
d0c669f9a496e46af4d3e637e00e085f1408acf0e56b9be170e30446bbf35150
$ bitcoin-cli gettransaction d0c669f9a496e46af4d3e637e00e085f1408acf0e56b9be170e30446bbf35150
{
  "amount": -0.01000000,
  "fee": -0.00000226,
  "confirmations": 3,
  "instantlock": false,
  "blockhash": "00004a97486c75563dbdc2de4c0109b427f4daf89980a593c34a99e8ef24c549",
  "blockindex": 1,
  "blocktime": 1528869804,
  "txid": "d0c669f9a496e46af4d3e637e00e085f1408acf0e56b9be170e30446bbf35150",
  "walletconflicts": [
  ],
  "time": 1528869792,
  "timereceived": 1528869792,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS",
      "category": "send",
      "amount": -0.01000000,
      "vout": 0,
      "fee": -0.00000226,
      "abandoned": false
    }
  ],
  "hex": "010000000118d1f31bf855d6a25ec1dc17e649f0197a4d713c08ef5cf163bdc0ef0fac0319020000006a47304402207468bc1c9aba305bb8ce23024e6fe5e1f37b2931a217015effd931075bb3994302206762c49704903e9acee02242cfb006c02af77df375bd3bbfc56983db4e9673b60121025f2308ae80205003bec46daa936c72bd148e0e8b02b33254c45badef54c339d1feffffff0240420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac9e8c5b00000000001976a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac00000000"
}
$ bitcoin-cli decoderawtransaction 010000000118d1f31bf855d6a25ec1dc17e649f0197a4d713c08ef5cf163bdc0ef0fac0319020000006a47304402207468bc1c9aba305bb8ce23024e6fe5e1f37b2931a217015effd931075bb3994302206762c49704903e9acee02242cfb006c02af77df375bd3bbfc56983db4e9673b60121025f2308ae80205003bec46daa936c72bd148e0e8b02b33254c45badef54c339d1feffffff0240420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac9e8c5b00000000001976a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac00000000
{
  "txid": "d0c669f9a496e46af4d3e637e00e085f1408acf0e56b9be170e30446bbf35150",
  "size": 225,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118",
      "vout": 2,
      "scriptSig": {
        "asm": "304402207468bc1c9aba305bb8ce23024e6fe5e1f37b2931a217015effd931075bb3994302206762c49704903e9acee02242cfb006c02af77df375bd3bbfc56983db4e9673b6[ALL] 025f2308ae80205003bec46daa936c72bd148e0e8b02b33254c45badef54c339d1",
        "hex": "47304402207468bc1c9aba305bb8ce23024e6fe5e1f37b2931a217015effd931075bb3994302206762c49704903e9acee02242cfb006c02af77df375bd3bbfc56983db4e9673b60121025f2308ae80205003bec46daa936c72bd148e0e8b02b33254c45badef54c339d1"
      },
      "sequence": 4294967294
    }
  ],
  "vout": [
    {
      "value": 0.01000000,
      "valueSat": 1000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 a282769e3b2aa722dbcb2c04219893a35520d025 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914a282769e3b2aa722dbcb2c04219893a35520d02588ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS"
        ]
      }
    }, 
    {
      "value": 0.05999774,
      "valueSat": 5999774,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 a2ca1135287d06f6dbcd4c700a82ede041b6c4b9 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914a2ca1135287d06f6dbcd4c700a82ede041b6c4b988ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1kYaQpexBapKmBrGku9e7FEZcZbyrC3xej"
        ]
      }
    }
  ]
}
{% endhighlight %}

## 源码剖析
`fundrawtransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue fundrawtransaction(const UniValue& params, bool fHelp); // 资助原始交易
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue fundrawtransaction(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;

    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 或 2 个
        throw runtime_error( // 命令帮助反馈
                            "fundrawtransaction \"hexstring\" includeWatching\n"
                            "\nAdd inputs to a transaction until it has enough in value to meet its out value.\n"
                            "This will not modify existing inputs, and will add one change output to the outputs.\n"
                            "Note that inputs which were signed may need to be resigned after completion since in/outputs have been added.\n"
                            "The inputs added will not be signed, use signrawtransaction for that.\n"
                            "Note that all existing inputs must have their previous output transaction be in the wallet.\n"
                            "Note that all inputs selected must be of standard form and P2SH scripts must be"
                            "in the wallet using importaddress or addmultisigaddress (to calculate fees).\n"
                            "Only pay-to-pubkey, multisig, and P2SH versions thereof are currently supported for watch-only\n"
                            "\nArguments:\n"
                            "1. \"hexstring\"     (string, required) The hex string of the raw transaction\n"
                            "2. includeWatching (boolean, optional, default false) Also select inputs which are watch only\n"
                            "\nResult:\n"
                            "{\n"
                            "  \"hex\":       \"value\", (string)  The resulting raw transaction (hex-encoded string)\n"
                            "  \"fee\":       n,         (numeric) Fee the resulting transaction pays\n"
                            "  \"changepos\": n          (numeric) The position of the added change output, or -1\n"
                            "}\n"
                            "\"hex\"             \n"
                            "\nExamples:\n"
                            "\nCreate a transaction with no inputs\n"
                            + HelpExampleCli("createrawtransaction", "\"[]\" \"{\\\"myaddress\\\":0.01}\"") +
                            "\nAdd sufficient unsigned inputs to meet the output value\n"
                            + HelpExampleCli("fundrawtransaction", "\"rawtransactionhex\"") +
                            "\nSign the transaction\n"
                            + HelpExampleCli("signrawtransaction", "\"fundedtransactionhex\"") +
                            "\nSend the transaction\n"
                            + HelpExampleCli("sendrawtransaction", "\"signedtransactionhex\"")
                            );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)(UniValue::VBOOL)); // 检查参数类型

    // parse hex string from parameter
    CTransaction origTx; // 原始交易
    if (!DecodeHexTx(origTx, params[0].get_str())) // 从参数解析 16 进制字符串
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");

    if (origTx.vout.size() == 0) // 交易的输出列表不能为空
        throw JSONRPCError(RPC_INVALID_PARAMETER, "TX must have at least one output");

    bool includeWatching = false; // 是否包含 watch-only 地址，默认不包含
    if (params.size() > 1)
        includeWatching = params[1].get_bool(); // 获取用户设置

    CMutableTransaction tx(origTx); // 构建一笔可变版本的交易
    CAmount nFee; // 交易费
    string strFailReason;
    int nChangePos = -1; // 改变位置
    if(!pwalletMain->FundTransaction(tx, nFee, nChangePos, strFailReason, includeWatching)) // 资助交易，增加输入和找零输出（如果有的话）
        throw JSONRPCError(RPC_INTERNAL_ERROR, strFailReason);

    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("hex", EncodeHexTx(tx))); // 16 进制编码交易
    result.push_back(Pair("changepos", nChangePos)); // 改变位置
    result.push_back(Pair("fee", ValueFromAmount(nFee))); // 交易费

    return result; // 返回结果集
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用。<br>
2.处理命令帮助和参数个数。<br>
3.检验参数类型。<br>
4.获取各参数并验证交易的输出不能为空。<br>
5.构建可变版本的交易，并资助该交易使输入大于等于输出，同时如果有找零的话，追加找零到输出。<br>
6.追加相关信息到结果集并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#fundrawtransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
