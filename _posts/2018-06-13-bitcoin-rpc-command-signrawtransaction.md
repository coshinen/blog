---
layout: post
title:  "比特币 RPC 命令剖析 \"signrawtransaction\""
date:   2018-06-13 14:25:33 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype ) # 为（序列化的，16 进制编码的）原始交易的输入签名
{% endhighlight %}

**第二个可选的参数（可能为空）是该交易所依赖的前一笔交易输出数组，但它可能还没上链。<br>
第三个可选的参数（可能为空）是一个 base58 编码的私钥数组，如果指定，它将是签名交易的唯一私钥。**

参数：<br>
1.`hexstring` （字符串，必备）交易的额 16 进制字符串。<br>
2.`prevtxs` （字符串，可选）依赖的前一笔交易输出的 json 数组。<br>
{% highlight shell %}
     [               (json array of json objects, or 'null' if none provided)
       {
         "txid":"id",             (string, required) The transaction id
         "vout":n,                  (numeric, required) The output number
         "scriptPubKey": "hex",   (string, required) script key
         "redeemScript": "hex"    (string, required for P2SH) redeem script
       }
       ,...
    ]
{% endhighlight %}
3.`privatekeys` （字符串，可选）用于签名的 base58 编码的私钥组成的 json 数组。<br>
{% highlight shell %}
    [                  (json array of strings, or 'null' if none provided)
      "privatekey"   (string) private key in base58-encoding
      ,...
    ]
{% endhighlight %}
4.`sighashtype` （字符串，可选，默认为 ALL）签名哈希类型。必须使以下之一：
{% highlight shell %}
       "ALL"
       "NONE"
       "SINGLE"
       "ALL|ANYONECANPAY"
       "NONE|ANYONECANPAY"
       "SINGLE|ANYONECANPAY"
{% endhighlight %}

结果：<br>
{% highlight shell %}
{
  "hex" : "value",           (string) The hex-encoded raw transaction with signature(s)
  "complete" : true|false,   (boolean) If the transaction has a complete set of signatures
  "errors" : [                 (json array of objects) Script verification errors (if there are any)
    {
      "txid" : "hash",           (string) The hash of the referenced, previous transaction
      "vout" : n,                (numeric) The index of the output to spent and used as input
      "scriptSig" : "hex",       (string) The hex-encoded signature script
      "sequence" : n,            (numeric) Script sequence number
      "error" : "text"           (string) Verification or signing error related to the input
    }
    ,...
  ]
}
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli createrawtransaction "[{\"txid\":\"9db0a0580f5483c634bd549f1c2e4e6f7881b3e52b84ee5cad2431c13e3e916e\",\"vout\":0}]" "{\"1kX6dhUWqaEZjhvqVnyLTiMGjCm8R5sgLS\":0.01}"
01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
$ bitcoin-cli signrawtransaction 01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d0000000000ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000
{
  "hex": "01000000016e913e3ec13124ad5cee842be5b381786f4e2e1c9f54bd34c683540f58a0b09d000000006b483045022100b66be9e04de6b0846a4e3cd08f327789f1607980e851e8b6a8cfca4428697c0b022036fa51060ca8d6b275dbdb753c322a171abce50ca17321448574867e518ab6e0012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0ffffffff0140420f00000000001976a914a282769e3b2aa722dbcb2c04219893a35520d02588ac00000000",
  "complete": true
}
{% endhighlight %}

## 源码剖析
`signrawtransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue signrawtransaction(const UniValue& params, bool fHelp); // 签名原始交易
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
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
    while (!ssData.empty()) { // 若数据流对象非空
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
            CBitcoinSecret vchSecret; // 米特比密钥对象
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

            UniValue prevOut = p.get_obj(); // 获取输出

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
    const CKeyStore& keystore = ((fGivenKeys || !pwalletMain) ? tempKeystore : *pwalletMain);
#else
    const CKeyStore& keystore = tempKeystore; // 获取临时密钥库的引用
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
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁，检验参数类型。<br>
3.获取并处理各参数。<br>
4.开始签名，对每笔交易输入进行签名，然后合并全部的交易输入签名，验证脚本签名。<br>
5.追加相关信息到结果集后返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#signrawtransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
