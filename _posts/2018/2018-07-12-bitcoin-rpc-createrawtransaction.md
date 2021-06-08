---
layout: post
title:  "比特币 RPC 命令「createrawtransaction」"
date:   2018-07-12 19:34:41 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help createrawtransaction
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )

创建一笔使用给定输入并创建新输出的交易。
输出可以是地址集或数据。
返回 16 进制编码的原始交易。
注意交易的输入未被签名，并且它不会存储在钱包中或传输到网络中。

参数：
1. "transactions"      （字符串，必备）一个 json 对象们的 json 数组
     [
       {
         "txid":"id",  （字符串，必备）交易索引
         "vout":n      （数字，必备）输出序号
       }
       ,...
     ]
2. "outputs"           （字符串，必备）一个输出们的 json 对象
    {
      "address": x.xxx,（数字或字符串，必备）密钥是比特币地址，数值（可以是字符串）是以 BTC 为单位金额
      "data": "hex",   （字符串，必备）密钥是 "data"，该值是 16 进制编码的数据
      ...
    }
3. locktime            （数字，可选，默认为 0）原始锁定时间。非 0 值也会激活锁定时间输入

结果：
"transaction"（字符串）16 进制的交易字符串

例子：
> bitcoin-cli createrawtransaction "[{\"txid\":\"myid\",\"vout\":0}]" "{\"address\":0.01}"
> bitcoin-cli createrawtransaction "[{\"txid\":\"myid\",\"vout\":0}]" "{\"data\":\"00010203\"}"
> curl --user myusername:mypassword  --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "createrawtransaction", "params": ["[{\"txid\":\"myid\",\"vout\":0}]", "{\"address\":0.01}"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
> curl --user myusername:mypassword  --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "createrawtransaction", "params": ["[{\"txid\":\"myid\",\"vout\":0}]", "{\"data\":\"00010203\"}"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`createrawtransaction` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue createrawtransaction(const UniValue& params, bool fHelp);
```

实现在文件 `rpcrawtransaction.cpp` 中。

```cpp
UniValue createrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 3)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VARR)(UniValue::VOBJ)(UniValue::VNUM), true); // 2. RPC 类型检测
    if (params[0].isNull() || params[1].isNull())
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, arguments 1 and 2 must be non-null");

    UniValue inputs = params[0].get_array();
    UniValue sendTo = params[1].get_obj();

    CMutableTransaction rawTx; // 3. 构建原始交易

    if (params.size() > 2 && !params[2].isNull()) { // 若指定了锁定时间
        int64_t nLockTime = params[2].get_int64(); // 获取锁定时间
        if (nLockTime < 0 || nLockTime > std::numeric_limits<uint32_t>::max()) // 锁定时间范围检查
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, locktime out of range");
        rawTx.nLockTime = nLockTime; // 交易锁定时间初始化
    }

    for (unsigned int idx = 0; idx < inputs.size(); idx++) { // 遍历输入，构建原始交易输入列表
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

    set<CBitcoinAddress> setAddress; // 地址集
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

    return EncodeHexTx(rawTx); // 4. 编码 16 进制交易并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcrawtransaction.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcrawtransaction.cpp){:target="_blank"}
