---
layout: post
title:  "比特币 RPC 命令剖析 \"signrawtransaction\""
date:   2018-07-20 20:25:33 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )
---
## 提示说明

```shell
signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype ) # 对（序列化的，16 进制编码的）原始交易的输入签名
```

**第二个可选的参数（可能为空）是该交易所依赖的前一笔交易输出数组，但该交易可能还没上链。<br>
第三个可选的参数（可能为空）是一个 base58 编码的私钥数组，如果指定，它将是签名该交易的唯一私钥。**

参数：
1. hexstring（字符串，必备）交易的 16 进制字符串。
2. prevtxs（字符串，可选）依赖的前一笔交易输出的 json 数组。
```shell
     [               （json 对象的 json 数组，若未提供则为空）
       {
         "txid":"id",             （字符串，必备）交易索引
         "vout":n,                  （数字，必备）输出序号
         "scriptPubKey": "hex",   （字符串，必备）脚本公钥
         "redeemScript": "hex"    （字符串，对于 P2SH 必备）赎回脚本
       }
       ,...
    ]
```
3. privatekeys（字符串，可选）用于签名的 base58 编码的私钥组成的 json 数组。<br>
```shell
    [                  （字符串 json 数组，若未提供则为空）
      "privatekey"   （字符串）base58 编码的私钥
      ,...
    ]
```
4. sighashtype（字符串，可选，默认为 ALL）签名哈希类型。必须是下列中的一个：
```shell
       "ALL"
       "NONE"
       "SINGLE"
       "ALL|ANYONECANPAY"
       "NONE|ANYONECANPAY"
       "SINGLE|ANYONECANPAY"
```

结果：
```shell
{
  "hex" : "value",           （字符串）16 进制编码的带签名的原始交易
  "complete" : true|false,   （布尔型）交易是否有一个完整的签名集
  "errors" : [                 （json 对象数组）脚本验证错误（如果有）
    {
      "txid" : "hash",           （字符串）参照的前一笔交易的哈希
      "vout" : n,                （数字）用于作为输入花费的输出索引/序号
      "scriptSig" : "hex",       （字符串）16 进制编码的签名脚本
      "sequence" : n,            （数字）脚本序列号
      "error" : "text"           （字符串）关于输入的验证或签名错误
    }
    ,...
  ]
}
```

## 用法示例

### 比特币核心客户端

对已创建的原始交易进行签名。<br>
原始交易的创建见 [createrawtransaction](/blog/2018/07/bitcoin-rpc-command-createrawtransaction.html)。

```shell
$ bitcoin-cli createrawtransaction "[{\"txid\":\"fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67\",\"vout\":0}]" "{\"1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV\":0.01}"
0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
$ bitcoin-cli signrawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "hex": "0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "complete": true
}
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "signrawtransaction", "params": ["0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"hex":"0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000","complete":true},"error":null,"id":"curltest"}
```

## 源码剖析

signrawtransaction 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue signrawtransaction(const UniValue& params, bool fHelp); // 签名原始交易
```

实现在“rpcrawtransaction.cpp”文件中。

```cpp
UniValue signrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 4) // 参数最少 1 个，至多 4 个
        throw runtime_error( // 命令帮助反馈
            "signrawtransaction \"hexstring\" ( [{\"txid\":\"id\",\"vout\":n,\"scriptPubKey\":\"hex\",\"redeemScript\":\"hex\"},...] [\"privatekey1\",...] sighashtype )\n"
            "\nSign inputs for raw transaction (serialized, hex-encoded).\n"
            "The second optional argument (may be null) is an array of previous transaction outputs that\n"
            "this transaction depends on but may not yet be in the block chain.\n"
            "The third optional argument (may be null) is an array of base58-encoded private\n"
            "keys that, if given, will be the only keys used to sign the transaction.\n"
#ifdef ENABLE_WALLET
            + HelpRequiringPassphrase() + "\n"
#endif

            "\nArguments:\n"
            "1. \"hexstring\"     (string, required) The transaction hex string\n"
            "2. \"prevtxs\"       (string, optional) An json array of previous dependent transaction outputs\n"
            "     [               (json array of json objects, or 'null' if none provided)\n"
            "       {\n"
            "         \"txid\":\"id\",             (string, required) The transaction id\n"
            "         \"vout\":n,                  (numeric, required) The output number\n"
            "         \"scriptPubKey\": \"hex\",   (string, required) script key\n"
            "         \"redeemScript\": \"hex\"    (string, required for P2SH) redeem script\n"
            "       }\n"
            "       ,...\n"
            "    ]\n"
            "3. \"privatekeys\"     (string, optional) A json array of base58-encoded private keys for signing\n"
            "    [                  (json array of strings, or 'null' if none provided)\n"
            "      \"privatekey\"   (string) private key in base58-encoding\n"
            "      ,...\n"
            "    ]\n"
            "4. \"sighashtype\"     (string, optional, default=ALL) The signature hash type. Must be one of\n"
            "       \"ALL\"\n"
            "       \"NONE\"\n"
            "       \"SINGLE\"\n"
            "       \"ALL|ANYONECANPAY\"\n"
            "       \"NONE|ANYONECANPAY\"\n"
            "       \"SINGLE|ANYONECANPAY\"\n"

            "\nResult:\n"
            "{\n"
            "  \"hex\" : \"value\",           (string) The hex-encoded raw transaction with signature(s)\n"
            "  \"complete\" : true|false,   (boolean) If the transaction has a complete set of signatures\n"
            "  \"errors\" : [                 (json array of objects) Script verification errors (if there are any)\n"
            "    {\n"
            "      \"txid\" : \"hash\",           (string) The hash of the referenced, previous transaction\n"
            "      \"vout\" : n,                (numeric) The index of the output to spent and used as input\n"
            "      \"scriptSig\" : \"hex\",       (string) The hex-encoded signature script\n"
            "      \"sequence\" : n,            (numeric) Script sequence number\n"
            "      \"error\" : \"text\"           (string) Verification or signing error related to the input\n"
            "    }\n"
            "    ,...\n"
            "  ]\n"
            "}\n"

            "\nExamples:\n"
            + HelpExampleCli("signrawtransaction", "\"myhex\"")
            + HelpExampleRpc("signrawtransaction", "\"myhex\"")
        );

#ifdef ENABLE_WALLET
    LOCK2(cs_main, pwalletMain ? &pwalletMain->cs_wallet : NULL); // 钱包上锁
#else
    LOCK(cs_main);
#endif
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)(UniValue::VARR)(UniValue::VARR)(UniValue::VSTR), true); // 检查参数类型

    vector<unsigned char> txData(ParseHexV(params[0], "argument 1")); // 解析第一个参数
    CDataStream ssData(txData, SER_NETWORK, PROTOCOL_VERSION); // 创建数据流对象
    vector<CMutableTransaction> txVariants; // 可变的交易列表
    while (!ssData.empty()) { // 当数据流对象非空
        try {
            CMutableTransaction tx;
            ssData >> tx; // 导入一笔交易
            txVariants.push_back(tx); // 加入交易列表
        }
        catch (const std::exception&) {
            throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");
        }
    }

    if (txVariants.empty()) // 列表非空，至少有一笔交易
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "Missing transaction");

    // mergedTx will end up with all the signatures; it // mergeTx 将以全部签名为结尾；
    // starts as a clone of the rawtx: // 它作为 rawtx 的副本开始：
    CMutableTransaction mergedTx(txVariants[0]); // 合并的可变交易输入集

    // Fetch previous transactions (inputs): // 获取之前的交易（输入）：
    CCoinsView viewDummy;
    CCoinsViewCache view(&viewDummy);
    { // 开始访问内存池
        LOCK(mempool.cs); // 交易内存池上锁
        CCoinsViewCache &viewChain = *pcoinsTip; // 获取激活的 CCoinsView
        CCoinsViewMemPool viewMempool(&viewChain, mempool);
        view.SetBackend(viewMempool); // temporarily switch cache backend to db+mempool view

        BOOST_FOREACH(const CTxIn& txin, mergedTx.vin) { // 遍历交易输入列表
            const uint256& prevHash = txin.prevout.hash; // 获取输入的前一笔交易输出的哈希
            CCoins coins;
            view.AccessCoins(prevHash); // this is certainly allowed to fail // 这里肯定会失败
        }

        view.SetBackend(viewDummy); // switch back to avoid locking mempool for too long // 切换回以避免锁定内存池时间过长
    }

    bool fGivenKeys = false; // 指定密钥标志，默认为 false
    CBasicKeyStore tempKeystore; // 临时私钥库
    if (params.size() > 2 && !params[2].isNull()) { // 若指定了密钥
        fGivenKeys = true; // 标志置为 true
        UniValue keys = params[2].get_array(); // 获取密钥数组
        for (unsigned int idx = 0; idx < keys.size(); idx++) { // 遍历该数组
            UniValue k = keys[idx]; // 获取一个 base58 编码的密钥
            CBitcoinSecret vchSecret; // 比特币密钥对象
            bool fGood = vchSecret.SetString(k.get_str()); // 初始化密钥
            if (!fGood)
                throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid private key");
            CKey key = vchSecret.GetKey(); // 获取私钥
            if (!key.IsValid()) // 验证私钥是否有效
                throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Private key outside allowed range");
            tempKeystore.AddKey(key); // 添加到临时私钥库
        }
    }
#ifdef ENABLE_WALLET
    else if (pwalletMain)
        EnsureWalletIsUnlocked(); // 确保此时钱包处于解密状态
#endif

    // Add previous txouts given in the RPC call:
    if (params.size() > 1 && !params[1].isNull()) { // 若指定了前一笔交易输出集合，且非空
        UniValue prevTxs = params[1].get_array(); // 获取前一笔交易输出的数组
        for (unsigned int idx = 0; idx < prevTxs.size(); idx++) { // 遍历该数组
            const UniValue& p = prevTxs[idx]; // 获取一个交易输出对象
            if (!p.isObject()) // 确保是对象类型
                throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "expected object with {\"txid'\",\"vout\",\"scriptPubKey\"}");

            UniValue prevOut = p.get_obj(); // 获取输出对象

            RPCTypeCheckObj(prevOut, boost::assign::map_list_of("txid", UniValue::VSTR)("vout", UniValue::VNUM)("scriptPubKey", UniValue::VSTR)); // 参数类型检查

            uint256 txid = ParseHashO(prevOut, "txid"); // 解析交易索引

            int nOut = find_value(prevOut, "vout").get_int(); // 获取交易输出序号
            if (nOut < 0) // 序号最小为 0
                throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "vout must be positive");

            vector<unsigned char> pkData(ParseHexO(prevOut, "scriptPubKey")); // 解析脚本公钥
            CScript scriptPubKey(pkData.begin(), pkData.end()); // 创建一个脚本公钥对象

            {
                CCoinsModifier coins = view.ModifyCoins(txid); // 获取交易索引对应的可修改 CCoins
                if (coins->IsAvailable(nOut) && coins->vout[nOut].scriptPubKey != scriptPubKey) { // 检测输出的脚本公钥是否一致
                    string err("Previous output scriptPubKey mismatch:\n");
                    err = err + ScriptToAsmStr(coins->vout[nOut].scriptPubKey) + "\nvs:\n"+
                        ScriptToAsmStr(scriptPubKey);
                    throw JSONRPCError(RPC_DESERIALIZATION_ERROR, err);
                }
                if ((unsigned int)nOut >= coins->vout.size()) // 交易输出序号若大于等于币输出大小
                    coins->vout.resize(nOut+1); // 重新设置输出列表大小 +1
                coins->vout[nOut].scriptPubKey = scriptPubKey; // 设置输出列表中输出对应的脚本公钥
                coins->vout[nOut].nValue = 0; // we don't know the actual output value // 输出对应的值初始化为 0
            }

            // if redeemScript given and not using the local wallet (private keys // 如果给定了赎回脚本，且不使用本地钱包（提供了私钥），
            // given), add redeemScript to the tempKeystore so it can be signed: // 添加赎回脚本到临时密钥库以至于对它签名：
            if (fGivenKeys && scriptPubKey.IsPayToScriptHash()) { // 如果是 P2SH
                RPCTypeCheckObj(prevOut, boost::assign::map_list_of("txid", UniValue::VSTR)("vout", UniValue::VNUM)("scriptPubKey", UniValue::VSTR)("redeemScript",UniValue::VSTR)); // 先进行参数类型检查
                UniValue v = find_value(prevOut, "redeemScript"); // 获取赎回脚本
                if (!v.isNull()) { // 脚本非空
                    vector<unsigned char> rsData(ParseHexV(v, "redeemScript"));
                    CScript redeemScript(rsData.begin(), rsData.end()); // 创建脚本对象
                    tempKeystore.AddCScript(redeemScript); // 添加脚本到临时密钥库
                }
            }
        }
    }

#ifdef ENABLE_WALLET
    const CKeyStore& keystore = ((fGivenKeys || !pwalletMain) ? tempKeystore : *pwalletMain); // 若提供了密钥 或 主钱包无效,则获取临时密钥库的引用
#else
    const CKeyStore& keystore = tempKeystore;
#endif

    int nHashType = SIGHASH_ALL; // 脚本哈希类型，默认为 ALL
    if (params.size() > 3 && !params[3].isNull()) { // 若指定了类型
        static map<string, int> mapSigHashValues =
            boost::assign::map_list_of
            (string("ALL"), int(SIGHASH_ALL))
            (string("ALL|ANYONECANPAY"), int(SIGHASH_ALL|SIGHASH_ANYONECANPAY))
            (string("NONE"), int(SIGHASH_NONE))
            (string("NONE|ANYONECANPAY"), int(SIGHASH_NONE|SIGHASH_ANYONECANPAY))
            (string("SINGLE"), int(SIGHASH_SINGLE))
            (string("SINGLE|ANYONECANPAY"), int(SIGHASH_SINGLE|SIGHASH_ANYONECANPAY))
            ; // 签名哈希值类型映射列表
        string strHashType = params[3].get_str(); // 获取哈希类型
        if (mapSigHashValues.count(strHashType)) // 若在映射列表中存在指定的哈希类型
            nHashType = mapSigHashValues[strHashType]; // 设置脚本哈希类型
        else
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid sighash param");
    }

    bool fHashSingle = ((nHashType & ~SIGHASH_ANYONECANPAY) == SIGHASH_SINGLE);

    // Script verification errors
    UniValue vErrors(UniValue::VARR); // 数组类型的脚本验证错误集

    // Sign what we can: // 我们签名：
    for (unsigned int i = 0; i < mergedTx.vin.size(); i++) { // 遍历合并的可变交易输入列表
        CTxIn& txin = mergedTx.vin[i]; // 获取一笔交易输入
        const CCoins* coins = view.AccessCoins(txin.prevout.hash); // 获取该输入依赖的前一笔交易的哈希对应的 CCoins
        if (coins == NULL || !coins->IsAvailable(txin.prevout.n)) {
            TxInErrorToJSON(txin, vErrors, "Input not found or already spent");
            continue;
        }
        const CScript& prevPubKey = coins->vout[txin.prevout.n].scriptPubKey; // 获取前一笔交易输出的脚本公钥

        txin.scriptSig.clear(); // 清空交易输入的脚本签名
        // Only sign SIGHASH_SINGLE if there's a corresponding output: // 如果有相应的输出，只签名 SIGHASH_SINGLE
        if (!fHashSingle || (i < mergedTx.vout.size()))
            SignSignature(keystore, prevPubKey, mergedTx, i, nHashType); // 签名

        // ... and merge in other signatures: // ... 接着合并其他签名：
        BOOST_FOREACH(const CMutableTransaction& txv, txVariants) { // 遍历交易列表
            txin.scriptSig = CombineSignatures(prevPubKey, mergedTx, i, txin.scriptSig, txv.vin[i].scriptSig); // 合并所有输入签名
        }
        ScriptError serror = SCRIPT_ERR_OK;
        if (!VerifyScript(txin.scriptSig, prevPubKey, STANDARD_SCRIPT_VERIFY_FLAGS, MutableTransactionSignatureChecker(&mergedTx, i), &serror)) { // 验证脚本签名
            TxInErrorToJSON(txin, vErrors, ScriptErrorString(serror));
        }
    }
    bool fComplete = vErrors.empty(); // 若没有错误，表示已完成

    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("hex", EncodeHexTx(mergedTx))); // 合并的交易的 16 进制编码
    result.push_back(Pair("complete", fComplete)); // 是否完成签名
    if (!vErrors.empty()) {
        result.push_back(Pair("errors", vErrors)); // 错误信息
    }

    return result; // 返回结果集
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁，若钱包功能开启，钱包上锁。
3. 检验参数类型并获取指定参数：待签名的交易哈希，依赖的前一笔交易输出集，用于签名的私钥，签名的哈希类型。
4. 开始签名，遍历交易输入列表，对每笔交易输入进行签名，然后遍历前一笔输出交易列表，合并全部的交易输入签名，验证脚本签名。
5. 追加相关信息到对象类型的结果集后返回。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#signrawtransaction){:target="_blank"}
