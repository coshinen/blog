---
layout: post
title:  "比特币 RPC 命令剖析 \"decodescript\""
date:   2018-06-13 09:03:39 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
decodescript "hex" # 解码一个 16 进制编码的脚本
{% endhighlight %}

参数：<br>
1. `hex` （字符串，必备）16 进制编码的脚本，可以为空串 `""`。

结果：<br>
{% highlight shell %}
{
  "asm":"asm",   (string) Script public key
  "hex":"hex",   (string) hex encoded public key
  "type":"type", (string) The output type
  "reqSigs": n,    (numeric) The required signatures
  "addresses": [   (json array of string)
     "address"     (string) bitcoin address
     ,...
  ],
  "p2sh","address" (string) script address
}
{% endhighlight %}

## 用法示例

方法一：解锁指定交易的最后一个输出的脚本。

{% highlight shell %}
$ bitcoin-cli getrawtransaction 1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118
{
  "hex": "01000000017708d09c30b24ee303ef9fbcf4990d160fcf62a56d5218d4df0cef7c47321b15000000006b483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff03be410f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acfe831e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388acc0cf6a00000000001976a9149e0342205ce74dc6bb782d99b3269826e8d655b488acaa1a0100",
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
          "1k6P9NNcWpqPR3CPz7i59doBeBMwepy7yD"
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
          "1kt52SrJRMausYSQnsfQBCiYcJKxUdNvBB"
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
          "1k7KYa17GZqhpeKEPjp6DMn11EdoGnyGeF"
        ]
      }
    }
  ],
  "blockhash": "000059ac90cf7439ea8186e4f4d35f349fe878c4723cde7ff18c66a8e33f1b73",
  "height": 72366,
  "confirmations": 10249,
  "time": 1528451744,
  "blocktime": 1528451744
}
$ bitcoin-cli decodescript 76a9149e0342205ce74dc6bb782d99b3269826e8d655b488ac
{
  "asm": "OP_DUP OP_HASH160 9e0342205ce74dc6bb782d99b3269826e8d655b4 OP_EQUALVERIFY OP_CHECKSIG",
  "reqSigs": 1,
  "type": "pubkeyhash",
  "addresses": [
    "1k7KYa17GZqhpeKEPjp6DMn11EdoGnyGeF"
  ],
  "p2sh": "7pDif9xH8YRFG1VjFGXym3cNkGG5HEKMBm"
}
{% endhighlight %}

方法二：解锁空脚本。

{% highlight C++ %}
$ bitcoin-cli decodescript ""
{
  "asm": "",
  "type": "nonstandard",
  "p2sh": "7irmiCnz3YCgC9JNCLK8CAyNSQdDFWLMGM"
}
{% endhighlight %}

## 源码剖析
`decodescript` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue decodescript(const UniValue& params, bool fHelp); // 解码脚本
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
UniValue decodescript(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须是 1 个
        throw runtime_error( // 命令帮助反馈
            "decodescript \"hex\"\n"
            "\nDecode a hex-encoded script.\n"
            "\nArguments:\n"
            "1. \"hex\"     (string) the hex encoded script\n"
            "\nResult:\n"
            "{\n"
            "  \"asm\":\"asm\",   (string) Script public key\n"
            "  \"hex\":\"hex\",   (string) hex encoded public key\n"
            "  \"type\":\"type\", (string) The output type\n"
            "  \"reqSigs\": n,    (numeric) The required signatures\n"
            "  \"addresses\": [   (json array of string)\n"
            "     \"address\"     (string) bitcoin address\n"
            "     ,...\n"
            "  ],\n"
            "  \"p2sh\",\"address\" (string) script address\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("decodescript", "\"hexstring\"")
            + HelpExampleRpc("decodescript", "\"hexstring\"")
        );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)); // 参数类型检查

    UniValue r(UniValue::VOBJ);
    CScript script;
    if (params[0].get_str().size() > 0){ // 若脚本非空字符串
        vector<unsigned char> scriptData(ParseHexV(params[0], "argument")); // 解析参数
        script = CScript(scriptData.begin(), scriptData.end()); // 构建序列化的脚本
    } else { // 空脚本是有效的
        // Empty scripts are valid
    }
    ScriptPubKeyToJSON(script, r, false); // 脚本公钥转换为 JSON 格式加入结果集

    r.push_back(Pair("p2sh", CBitcoinAddress(CScriptID(script)).ToString())); // Base58 编码的脚本哈希
    return r; // 返回结果集
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.检验参数类型，是否为字符串类型。<br>
3.构建序列化脚本对象，可为空。<br>
4.脚本公钥转换为 JSON 格式加入结果集。<br>
5.把 Base58 编码的脚本哈希加入结果集并返回。

第四步，调用 ScriptPubKeyToJSON(script, r, false) 把脚本公钥转换为 JSON 格式，
该函数定义在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
void ScriptPubKeyToJSON(const CScript& scriptPubKey, UniValue& out, bool fIncludeHex)
{
    txnouttype type;
    vector<CTxDestination> addresses;
    int nRequired;

    out.push_back(Pair("asm", ScriptToAsmStr(scriptPubKey))); // 脚本操作码
    if (fIncludeHex)
        out.push_back(Pair("hex", HexStr(scriptPubKey.begin(), scriptPubKey.end()))); // 16 进制形式

    if (!ExtractDestinations(scriptPubKey, type, addresses, nRequired)) {
        out.push_back(Pair("type", GetTxnOutputType(type))); // 脚本类型
        return;
    }

    out.push_back(Pair("reqSigs", nRequired)); // 是否需要签名
    out.push_back(Pair("type", GetTxnOutputType(type))); // 类型

    UniValue a(UniValue::VARR);
    BOOST_FOREACH(const CTxDestination& addr, addresses)
        a.push_back(CBitcoinAddress(addr).ToString());
    out.push_back(Pair("addresses", a)); // 输出地址
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#decodescript)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
