---
layout: post
title:  "比特币 RPC 命令剖析 \"decoderawtransaction\""
date:   2018-06-12 12:10:12 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
decoderawtransaction "hexstring" # 获取一个表示序列化的 16 进制编码交易的 JSON 对象
{% endhighlight %}

参数：<br>
1. `hexstring` （字符串，必备）交易哈希的 16 进制字符串。

结果：<br>
{% highlight shell %}
{
  "txid" : "id",        (string) The transaction id
  "size" : n,             (numeric) The transaction size
  "version" : n,          (numeric) The version
  "locktime" : ttt,       (numeric) The lock time
  "vin" : [               (array of json objects)
     {
       "txid": "id",    (string) The transaction id
       "vout": n,         (numeric) The output number
       "scriptSig": {     (json object) The script
         "asm": "asm",  (string) asm
         "hex": "hex"   (string) hex
       },
       "sequence": n     (numeric) The script sequence number
     }
     ,...
  ],
  "vout" : [             (array of json objects)
     {
       "value" : x.xxx,            (numeric) The value in BTC
       "n" : n,                    (numeric) index
       "scriptPubKey" : {          (json object)
         "asm" : "asm",          (string) the asm
         "hex" : "hex",          (string) the hex
         "reqSigs" : n,            (numeric) The required sigs
         "type" : "pubkeyhash",  (string) The type, eg 'pubkeyhash'
         "addresses" : [           (json array of string)
           "12tvKAXCxZjSmdNbao16dKXC8tRWfcF5oc"   (string) bitcoin address
           ,...
         ]
       }
     }
     ,...
  ],
}
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli decoderawtransaction 01000000017708d09c30b24ee303ef9fbcf4990d160fcf62a56d5218d4df0cef7c47321b15000000006b483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff03be410f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acfe831e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388acc0cf6a00000000001976a9149e0342205ce74dc6bb782d99b3269826e8d655b488acaa1a0100
{
  "txid": "1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118",
  "size": 260,
  "version": 1,
  "locktime": 72362,
  "vin": [
    {
      "txid": "151b32477cef0cdfd418526da562cf0f160d99f4bc9fef03e34eb2309cd00877",
      "vout": 0,
      "scriptSig": {
        "asm": "3045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e[ALL] 02ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0",
        "hex": "483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0"
      },
      "sequence": 4294967294
    }
  ],
  "vout": [
    {
      "value": 0.00999870,
      "valueSat": 999870,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 9dd5d8f38714a8b07a4e702777d445d388805ebd OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9149dd5d8f38714a8b07a4e702777d445d388805ebd88ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "4U6P9NNcWpqPR3CPz7i59doBeBMwepy7yD"
        ]
      }
    }, 
    {
      "value": 0.01999870,
      "valueSat": 1999870,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 a679db3ef39fe34161431507cba8b579ba902813 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914a679db3ef39fe34161431507cba8b579ba90281388ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "4Ut52SrJRMausYSQnsfQBCiYcJKxUdNvBB"
        ]
      }
    }, 
    {
      "value": 0.07000000,
      "valueSat": 7000000,
      "n": 2,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 9e0342205ce74dc6bb782d99b3269826e8d655b4 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9149e0342205ce74dc6bb782d99b3269826e8d655b488ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "4U7KYa17GZqhpeKEPjp6DMn11EdoGnyGeF"
        ]
      }
    }
  ]
}
{% endhighlight %}

## 源码剖析
`decoderawtransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue decoderawtransaction(const UniValue& params, bool fHelp); // 解码原始交易
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
UniValue decoderawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "decoderawtransaction \"hexstring\"\n"
            "\nReturn a JSON object representing the serialized, hex-encoded transaction.\n"

            "\nArguments:\n"
            "1. \"hex\"      (string, required) The transaction hex string\n"

            "\nResult:\n"
            "{\n"
            "  \"txid\" : \"id\",        (string) The transaction id\n"
            "  \"size\" : n,             (numeric) The transaction size\n"
            "  \"version\" : n,          (numeric) The version\n"
            "  \"locktime\" : ttt,       (numeric) The lock time\n"
            "  \"vin\" : [               (array of json objects)\n"
            "     {\n"
            "       \"txid\": \"id\",    (string) The transaction id\n"
            "       \"vout\": n,         (numeric) The output number\n"
            "       \"scriptSig\": {     (json object) The script\n"
            "         \"asm\": \"asm\",  (string) asm\n"
            "         \"hex\": \"hex\"   (string) hex\n"
            "       },\n"
            "       \"sequence\": n     (numeric) The script sequence number\n"
            "     }\n"
            "     ,...\n"
            "  ],\n"
            "  \"vout\" : [             (array of json objects)\n"
            "     {\n"
            "       \"value\" : x.xxx,            (numeric) The value in " + CURRENCY_UNIT + "\n"
            "       \"n\" : n,                    (numeric) index\n"
            "       \"scriptPubKey\" : {          (json object)\n"
            "         \"asm\" : \"asm\",          (string) the asm\n"
            "         \"hex\" : \"hex\",          (string) the hex\n"
            "         \"reqSigs\" : n,            (numeric) The required sigs\n"
            "         \"type\" : \"pubkeyhash\",  (string) The type, eg 'pubkeyhash'\n"
            "         \"addresses\" : [           (json array of string)\n"
            "           \"12tvKAXCxZjSmdNbao16dKXC8tRWfcF5oc\"   (string) bitcoin address\n"
            "           ,...\n"
            "         ]\n"
            "       }\n"
            "     }\n"
            "     ,...\n"
            "  ],\n"
            "}\n"

            "\nExamples:\n"
            + HelpExampleCli("decoderawtransaction", "\"hexstring\"")
            + HelpExampleRpc("decoderawtransaction", "\"hexstring\"")
        );

    LOCK(cs_main); // 上锁
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)); // 检测参数类型

    CTransaction tx;

    if (!DecodeHexTx(tx, params[0].get_str())) // 解码交易
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");

    UniValue result(UniValue::VOBJ);
    TxToJSON(tx, uint256(), result); // 把交易信息转换为 JSON 加入结果对象

    return result; // 返回结果对象
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.检验参数类型，是否为字符串类型。<br>
4.解码交易。<br>
5.把交易信息转换为 JSON 格式加入到结果对象并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#decoderawtransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
