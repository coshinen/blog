---
layout: post
title:  "比特币 RPC 命令剖析 \"createrawtransaction\""
date:   2018-06-13 09:34:41 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime ) # 基于输入和创建新的输出创建一笔交易
{% endhighlight %}

**输出可以是地址集或数据。<br>
返回 16 进制编码的原始交易。<br>
注：交易的输入没有签名，且该交易不会存储在钱包或传输到网络中。**

参数：<br>
1. `transactions` （字符串，必备）一个 JSON 对象 JSON 数组。<br>
{% highlight shell %}
     [
       {
         "txid":"id",    (string, required) The transaction id
         "vout":n        (numeric, required) The output number
       }
       ,...
     ]
{% endhighlight %}
2. `outputs` （字符串，必备）一个输出的 JSON 对象。<br>
{% highlight shell %}
    {
      "address": x.xxx   (numeric or string, required) The key is the bitcoin address, the numeric value (can be string) is the BTC amount
      "data": "hex",     (string, required) The key is "data", the value is hex encoded data
      ...
    }
{% endhighlight %}
3. `locktime` （数字型，可选，默认为 0）原始锁定时间。非 0 值也可以激活输入的锁定时间。

结果：（字符串）返回 16 进制交易索引字符串。

## 用法示例

方法一：指定输入（交易索引和 UTXO 序号）和输出（地址和金额）创建一笔原始交易。

{% highlight shell %}
$ bitcoin-cli createrawtransaction "[{\"txid\":\"9db0a0580f5483c634bd549f1c2e4e6f7881b3e52b84ee5cad2431c13e3e916e\",\"vout\":0}]" "{\"1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS\":0.01}"
01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
{% endhighlight %}

方法二：指定 data 类型的输出，data value 来源暂无。

{% highlight C++ %}
$ bitcoin-cli createrawtransaction "[{\"txid\":\"9db0a0580f5483c634bd549f1c2e4e6f7881b3e52b84ee5cad2431c13e3e916e\",\"vout\":0}]" "{\"data\":\"00010203\"}"
01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff010000000000000000066a040001020300000000
{% endhighlight %}

## 源码剖析
`createrawtransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue createrawtransaction(const UniValue& params, bool fHelp); // 创建原始交易
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
UniValue createrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 3) // 参数为 2 或 3 个
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

    LOCK(cs_main); // 上锁
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VARR)(UniValue::VOBJ)(UniValue::VNUM), true); // 检查参数类型
    if (params[0].isNull() || params[1].isNull()) // 输入和输出均不能为空
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, arguments 1 and 2 must be non-null");

    UniValue inputs = params[0].get_array(); // 获取输入
    UniValue sendTo = params[1].get_obj(); // 获取输出

    CMutableTransaction rawTx; // 创建一笔原始交易

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

    return EncodeHexTx(rawTx); // 16 进制编码该原始交易并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁，检验参数类型。<br>
3.获取各参数，构建一笔原始交易并初始化锁定时间。<br>
4.遍历输入，构建交易输入对象并加入交易输入列表。<br>
5.遍历输出，构建交易输出对象并加入交易输出列表。<br>
6.16 进制编码交易并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#createrawtransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
