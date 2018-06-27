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
fundrawtransaction "hexstring" includeWatching # 把输入添加到交易中，直到它有足够的满足其输出的金额
{% endhighlight %}

**此操作不会修改现存的输入，并且会添加一个找零输出到输出集中。<br>
注：因为输入/输出已被添加，所以签名后的输入可能需要在完成此操作后重签。<br>
使用 [`signrawtransaction`](/2018/06/13/bitcoin-rpc-command-signrawtransaction) 已添加的输入将不会被签名。<br>
注意全部现存的输入必须在钱包中有它们前一笔输出交易。<br>
注意所选的全部输入必须是标准格式，且在钱包中的 P2SH 脚本必须使用 [`importaddress`](/2018/06/07/bitcoin-rpc-command-importaddress) 和 [`addmultisigaddress`](/2018/06/15/bitcoin-rpc-command-addmultisigaddress)（用来计算交易费）。<br>
watch-only 目前只支持 P2PKH，多签，和 P2SH 版本。**

参数：<br>
1. `hexstring` （字符串，必备）原始交易的 16 进制字符串。<br>
2. `includeWatching` （布尔型，可选，默认为 false）选择 watch-only 的输入。

结果：<br>
{% highlight shell %}
{
  "hex":       "value", （字符串）产生的原始交易（16 进制编码的字符串）
  "fee":       n,         （数字）由此产生的交易费
  "changepos": n          （数字）添加的找零输出的位置，或为 -1
}
"hex"             
{% endhighlight %}

## 用法示例

### 比特币核心客户端

先创建一笔没有输入的交易，<br>
添加充足的未签名的输入用以满足输出金额，<br>
签名交易，<br>
发送交易。<br>

{% highlight shell %}
$ bitcoin-cli createrawtransaction "[]" "{\"1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV\":0.01}"
01000000000140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
$ bitcoin-cli decoderawtransaction 01000000000140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "txid": "b88e6b7777cbcca8f316fde34ab27917f62734c127a218887f032884751a7a94",
  "size": 44,
  "version": 1,
  "locktime": 0,
  "vin": [
  ],
  "vout": [
    {
      "value": 0.01000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914e221b8a504199bec7c5fe8081edd011c3653118288ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"
        ]
      }
    }
  ]
}
$ bitcoin-cli fundrawtransaction 01000000000140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "hex": "01000000014412ee17ce40921719443ac884702a5100db85a98fa0eea49fe185c36aab546e0100000000feffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "changepos": 0,
  "fee": 0.00004520
}
$ bitcoin-cli decoderawtransaction 01000000014412ee17ce40921719443ac884702a5100db85a98fa0eea49fe185c36aab546e0100000000feffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "txid": "17b65e7c94c81e71e03e763051c85e94dc74f44f385b61bb0c60391717ee5cdb",
  "size": 119,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244",
      "vout": 1,
      "scriptSig": {
        "asm": "",
        "hex": ""
      },
      "sequence": 4294967294
    }
  ],
  "vout": [
    {
      "value": 0.98995480,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 41068d02c7c981b7a7ac4f4c2f28b480a76a66c1 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "16vpmdSDaX3Nv9UMuk2vSecMrdstjjSP4R"
        ]
      }
    }, 
    {
      "value": 0.01000000,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914e221b8a504199bec7c5fe8081edd011c3653118288ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"
        ]
      }
    }
  ]
}
$ bitcoin-cli signrawtransaction 01000000014412ee17ce40921719443ac884702a5100db85a98fa0eea49fe185c36aab546e0100000000feffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "hex": "01000000014412ee17ce40921719443ac884702a5100db85a98fa0eea49fe185c36aab546e010000006b483045022100c49f5b0ff43f2b35266c6944b042bbaef667c3504c556a915636930d857465e1022041421645d9fb25b154c5356508d08f69054a57cfd0f9f9a60975855de62167430121029add8d65b91a60990c1ca7e45d8239631511a217cd23521054727c63ff1ff7c0feffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "complete": true
}
$ bitcoin-cli sendrawtransaction 01000000014412ee17ce40921719443ac884702a5100db85a98fa0eea49fe185c36aab546e010000006b483045022100c49f5b0ff43f2b35266c6944b042bbaef667c3504c556a915636930d857465e1022041421645d9fb25b154c5356508d08f69054a57cfd0f9f9a60975855de62167430121029add8d65b91a60990c1ca7e45d8239631511a217cd23521054727c63ff1ff7c0feffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
cd92e2a951d5624355fff82288d28cd4d213a711f7ddb10fcdd22bc6fa16801f
$ bitcoin-cli getrawtransaction cd92e2a951d5624355fff82288d28cd4d213a711f7ddb10fcdd22bc6fa16801f 1
{
  "hex": "01000000014412ee17ce40921719443ac884702a5100db85a98fa0eea49fe185c36aab546e010000006b483045022100c49f5b0ff43f2b35266c6944b042bbaef667c3504c556a915636930d857465e1022041421645d9fb25b154c5356508d08f69054a57cfd0f9f9a60975855de62167430121029add8d65b91a60990c1ca7e45d8239631511a217cd23521054727c63ff1ff7c0feffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "txid": "cd92e2a951d5624355fff82288d28cd4d213a711f7ddb10fcdd22bc6fa16801f",
  "size": 226,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244",
      "vout": 1,
      "scriptSig": {
        "asm": "3045022100c49f5b0ff43f2b35266c6944b042bbaef667c3504c556a915636930d857465e1022041421645d9fb25b154c5356508d08f69054a57cfd0f9f9a60975855de6216743[ALL] 029add8d65b91a60990c1ca7e45d8239631511a217cd23521054727c63ff1ff7c0",
        "hex": "483045022100c49f5b0ff43f2b35266c6944b042bbaef667c3504c556a915636930d857465e1022041421645d9fb25b154c5356508d08f69054a57cfd0f9f9a60975855de62167430121029add8d65b91a60990c1ca7e45d8239631511a217cd23521054727c63ff1ff7c0"
      },
      "sequence": 4294967294
    }
  ],
  "vout": [
    {
      "value": 0.98995480,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 41068d02c7c981b7a7ac4f4c2f28b480a76a66c1 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "16vpmdSDaX3Nv9UMuk2vSecMrdstjjSP4R"
        ]
      }
    }, 
    {
      "value": 0.01000000,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914e221b8a504199bec7c5fe8081edd011c3653118288ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"
        ]
      }
    }
  ]
}
{% endhighlight %}

这里可以看到签名前后交易大小的变化，从 `119` 到 `226` 增加了 107 个字节。

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "fundrawtransaction", "params": ["01000000000140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"hex":"010000000153c8eace39ab4a16f586eb8f041e9f3b383832ac7b6e533e7e45762ddc3bae580100000000feffffff0240420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac186edc0b000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac00000000","changepos":1,"fee":0.00004520},"error":null,"id":"curltest"}
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
