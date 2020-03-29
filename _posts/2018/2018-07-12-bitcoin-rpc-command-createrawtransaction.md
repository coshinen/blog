---
layout: post
title:  "比特币 RPC 命令剖析 \"createrawtransaction\""
date:   2018-07-12 19:34:41 +0800
author: mistydew
comments: true
categories: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )
---
## 提示说明

```shell
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime ) # 基于输入和创建新的输出创建一笔交易花费
```

**输出可以是地址集或数据。<br>
返回 16 进制编码的原始交易。<br>
注：交易的输入没有签名，且该交易不会存储在钱包或传输到网络中。**

参数：<br>
1.transactions（字符串，必备）一个由 json 对象构成的 json 数组。<br>
```shell
     [
       {
         "txid":"id",    （字符串，必备）交易索引
         "vout":n        （数字，必备）输出序号/索引
       }
       ,...
     ]
```
2.outputs（字符串，必备）一个输出的 json 对象。<br>
```shell
    {
      "address": x.xxx,  （数字或字符串，必备）比特币地址，以 BTC 为单位的数字类型（可以是字符串）金额
      "data": "hex",     （字符串，必备）“数据”，该值是 16 进制编码的数据
      ...
    }
```
3.locktime（数字，可选，默认为 0）原始锁定时间。非 0 值也可以激活输入的锁定时间。

结果：（字符串）返回 16 进制编码的交易索引字符串。

## 用法示例

### 比特币核心客户端

方法一：指定输入（交易索引和 UTXO 序号）和输出（地址和金额）创建一笔原始交易。<br>
这里的输入即一笔未花费的输出所在的交易索引和输出序号，通过 [listunspent](/blog/2018/09/bitcoin-rpc-command-listunspent.html) 获取 UTXO。<br>
创建原始交易完成后，通过 [decoderawtransaction](/blog/2018/07/bitcoin-rpc-command-decoderawtransaction.html) 解码获取该原始交易的详细信息。

```shell
$ bitcoin-cli listunspent
[
  ...
  {
    "txid": "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67",
    "vout": 0,
    "address": "1NQcq6VbVu5qRFaKe1YvNPx43Ye22WBYM7",
    "account": "",
    "scriptPubKey": "76a914ead21e07ca90f1d1d8a29440a68f070cdd2c8e1588ac",
    "amount": 1.00000000,
    "confirmations": 3660,
    "spendable": true
  }, 
  ...
]
$ bitcoin-cli getnewaddress
1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV
$ bitcoin-cli createrawtransaction "[{\"txid\":\"fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67\",\"vout\":0}]" "{\"1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV\":0.01}"
0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
$ bitcoin-cli decoderawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "txid": "6d5ea131dd69b0a04950cfd95b94412c3f3c70ec57f8558d9986946a37b3958e",
  "size": 85,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67",
      "vout": 0,
      "scriptSig": {
        "asm": "",
        "hex": ""
      },
      "sequence": 4294967295
    }
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
```

**注：这里没有指定找零地址和金额，所以输入和输出之差会全部作为交易费。<br>
使用 [fundrawtransaction](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html) 增加找零输出。**

方法二：指定 data 类型的输出，data value 来源暂无，这里使用官方用例 "00010203"。

```cpp
$ bitcoin-cli createrawtransaction "[{\"txid\":\"fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67\",\"vout\":0}]" "{\"data\":\"00010203\"}"
01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff010000000000000000066a040001020300000000
```

### cURL

```cpp
$ curl --user myusername:mypassword  --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "createrawtransaction", "params": [[{"txid":"fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67","vout":0}], {"1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV":0.01}] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000","error":null,"id":"curltest"}
```

## 源码剖析
createrawtransaction 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue createrawtransaction(const UniValue& params, bool fHelp); // 创建原始交易
```

实现在“rpcrawtransaction.cpp”文件中。

```cpp
UniValue createrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 3) // 1.参数为 2 或 3 个
        throw runtime_error( // 命令帮助反馈
            "createrawtransaction [{\"txid\":\"id\",\"vout\":n},...] {\"address\":amount,\"data\":\"hex\",...} ( locktime )\n"
            "\nCreate a transaction spending the given inputs and creating new outputs.\n"
            "Outputs can be addresses or data.\n"
            "Returns hex-encoded raw transaction.\n"
            "Note that the transaction's inputs are not signed, and\n"
            "it is not stored in the wallet or transmitted to the network.\n"

            "\nArguments:\n"
            "1. \"transactions\"        (string, required) A json array of json objects\n"
            "     [\n"
            "       {\n"
            "         \"txid\":\"id\",    (string, required) The transaction id\n"
            "         \"vout\":n        (numeric, required) The output number\n"
            "       }\n"
            "       ,...\n"
            "     ]\n"
            "2. \"outputs\"             (string, required) a json object with outputs\n"
            "    {\n"
            "      \"address\": x.xxx   (numeric or string, required) The key is the bitcoin address, the numeric value (can be string) is the " + CURRENCY_UNIT + " amount\n"
            "      \"data\": \"hex\",     (string, required) The key is \"data\", the value is hex encoded data\n"
            "      ...\n"
            "    }\n"
            "3. locktime                (numeric, optional, default=0) Raw locktime. Non-0 value also locktime-activates inputs\n"
            "\nResult:\n"
            "\"transaction\"            (string) hex string of the transaction\n"

            "\nExamples\n"
            + HelpExampleCli("createrawtransaction", "\"[{\\\"txid\\\":\\\"myid\\\",\\\"vout\\\":0}]\" \"{\\\"address\\\":0.01}\"")
            + HelpExampleCli("createrawtransaction", "\"[{\\\"txid\\\":\\\"myid\\\",\\\"vout\\\":0}]\" \"{\\\"data\\\":\\\"00010203\\\"}\"")
            + HelpExampleRpc("createrawtransaction", "\"[{\\\"txid\\\":\\\"myid\\\",\\\"vout\\\":0}]\", \"{\\\"address\\\":0.01}\"")
            + HelpExampleRpc("createrawtransaction", "\"[{\\\"txid\\\":\\\"myid\\\",\\\"vout\\\":0}]\", \"{\\\"data\\\":\\\"00010203\\\"}\"")
        );

    LOCK(cs_main); // 2.上锁
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VARR)(UniValue::VOBJ)(UniValue::VNUM), true); // 3.检查参数类型
    if (params[0].isNull() || params[1].isNull()) // 输入和输出均不能为空
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, arguments 1 and 2 must be non-null");

    UniValue inputs = params[0].get_array(); // 获取输入
    UniValue sendTo = params[1].get_obj(); // 获取输出

    CMutableTransaction rawTx; // 4.创建一笔原始交易

    if (params.size() > 2 && !params[2].isNull()) { // 4.1.若指定了锁定时间
        int64_t nLockTime = params[2].get_int64(); // 获取锁定时间
        if (nLockTime < 0 || nLockTime > std::numeric_limits<uint32_t>::max()) // 锁定时间范围检查
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, locktime out of range");
        rawTx.nLockTime = nLockTime; // 交易锁定时间初始化
    }

    for (unsigned int idx = 0; idx < inputs.size(); idx++) { // 4.2.遍历输入，构建原始交易输入列表
        const UniValue& input = inputs[idx]; // 获取一个输入
        const UniValue& o = input.get_obj(); // 拿到该输入对象

        uint256 txid = ParseHashO(o, "txid"); // 获取交易索引

        const UniValue& vout_v = find_value(o, "vout"); // 获取输出序号
        if (!vout_v.isNum()) // 输出序号必须为数字
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, missing vout key");
        int nOutput = vout_v.get_int(); // 获取该数字
        if (nOutput < 0) // 输出索引最小为 0
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, vout must be positive");

        uint32_t nSequence = (rawTx.nLockTime ? std::numeric_limits<uint32_t>::max() - 1 : std::numeric_limits<uint32_t>::max()); // 锁定时间
        CTxIn in(COutPoint(txid, nOutput), CScript(), nSequence); // 构建一个交易输入对象

        rawTx.vin.push_back(in); // 加入原始交易输入列表
    }

    set<CBitcoinAddress> setAddress; // 4.3.地址集
    vector<string> addrList = sendTo.getKeys(); // 获取输出的所有关键字（地址）
    BOOST_FOREACH(const string& name_, addrList) { // 遍历地址列表

        if (name_ == "data") { // 若关键字中包含 "data"
            std::vector<unsigned char> data = ParseHexV(sendTo[name_].getValStr(),"Data"); // 解析数据

            CTxOut out(0, CScript() << OP_RETURN << data); // 构建交易输出对象
            rawTx.vout.push_back(out); // 加入原始交易输出列表
        } else { // 否则为目的地址
            CBitcoinAddress address(name_); // 构建比特币地址
            if (!address.IsValid()) // 检验地址是否有效
                throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, string("Invalid Bitcoin address: ")+name_);

            if (setAddress.count(address)) // 保证地址集中不存在该地址，防止地址重复输入
                throw JSONRPCError(RPC_INVALID_PARAMETER, string("Invalid parameter, duplicated address: ")+name_);
            setAddress.insert(address); // 插入地址集

            CScript scriptPubKey = GetScriptForDestination(address.Get()); // 从目的地址获取脚本公钥
            CAmount nAmount = AmountFromValue(sendTo[name_]); // 获取金额

            CTxOut out(nAmount, scriptPubKey); // 构建交易输出对象
            rawTx.vout.push_back(out); // 加入原始交易输出列表
        }
    }

    return EncodeHexTx(rawTx); // 5.16 进制编码该原始交易并返回
}
```

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.检验参数类型并获取指定参数。<br>
4.构建一笔原始交易。<br>
4.1.初始化原始交易锁定时间。<br>
4.2.构建交易输入列表。<br>
4.3.构建交易输出列表。<br>
5.返回原始交易的 16 进制编码形式。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#createrawtransaction){:target="_blank"}
