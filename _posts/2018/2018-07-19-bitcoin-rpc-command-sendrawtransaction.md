---
layout: post
title:  "比特币 RPC 命令剖析 \"sendrawtransaction\""
date:   2018-07-19 20:54:02 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli sendrawtransaction "hexstring" ( allowhighfees )
---
## 提示说明

```shell
sendrawtransaction "hexstring" ( allowhighfees ) # 把（序列化的，16 进制编码的）原始交易提交到本地节点和网络
```

也可以查看 [createrawtransaction](/blog/2018/07/bitcoin-rpc-command-createrawtransaction.html) 和 [signrawtransaction](/blog/2018/07/bitcoin-rpc-command-signrawtransaction.html) 调用。

参数：
1. hexstring（字符串，必备）原始交易的 16 进制字符串。
2. allowhighfees（布尔型，可选，默认为 false）允许交易费超额。

结果：（字符串）返回 16 进制编码的交易。

## 用法示例

### 比特币核心客户端

构造一笔交易并发送流程：（1->2->3）<br>
1.使用 [createrawtransaction](/blog/2018/07/bitcoin-rpc-command-createrawtransaction.html) 创建一笔原始交易，注意找零。<br>
1.5.（可选）若创建原始交易时为指定找零，使用 [fundrawtransaction](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html) 增加找零输出。<br>
2.使用 [signrawtransaction](/blog/2018/07/bitcoin-rpc-command-signrawtransaction.html) 对创建的原始交易进行签名。<br>
3.使用该命令提交完成签名的原始交易（放入本地节点的内存池并进行交易广播）。<br>

**使用 [getrawtransaction](/blog/2018/07/bitcoin-rpc-command-getrawtransaction.html) 查看提交到内存池中的原始交易，
或使用 [gettransaction](/blog/2018/08/bitcoin-rpc-command-gettransaction.html) 查看。**

```shell
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
$ bitcoin-cli fundrawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "hex": "0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "changepos": 0,
  "fee": 0.00004520
}
$ bitcoin-cli decoderawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "txid": "485299c36c68d8e231219ff195d3bf5e4ed3c91f7fbe427bd8d2930da81bc771",
  "size": 119,
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
$ bitcoin-cli signrawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "hex": "0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b483045022100ff991e45fc4f055734d27613a539372c83ca1ff409c34ea2afe586589660a2d2022042f9fc2709e976195c73ee76d8e7a5b78eca054d0f3d25074df5490241bd4c38012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "complete": true
}
$ bitcoin-cli decoderawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b483045022100ff991e45fc4f055734d27613a539372c83ca1ff409c34ea2afe586589660a2d2022042f9fc2709e976195c73ee76d8e7a5b78eca054d0f3d25074df5490241bd4c38012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "txid": "ff35b0890a598fefa147c846ee6d9acc7cda5d94f77c92c9cb0a58d775fcfaf4",
  "size": 191,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67",
      "vout": 0,
      "scriptSig": {
        "asm": "3045022100ff991e45fc4f055734d27613a539372c83ca1ff409c34ea2afe586589660a2d2022042f9fc2709e976195c73ee76d8e7a5b78eca054d0f3d25074df5490241bd4c38[ALL] 03583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546",
        "hex": "483045022100ff991e45fc4f055734d27613a539372c83ca1ff409c34ea2afe586589660a2d2022042f9fc2709e976195c73ee76d8e7a5b78eca054d0f3d25074df5490241bd4c38012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546"
      },
      "sequence": 4294967295
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
$ bitcoin-cli sendrawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b483045022100ff991e45fc4f055734d27613a539372c83ca1ff409c34ea2afe586589660a2d2022042f9fc2709e976195c73ee76d8e7a5b78eca054d0f3d25074df5490241bd4c38012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff02188de605000000001976a91441068d02c7c981b7a7ac4f4c2f28b480a76a66c188ac40420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746
$ bitcoin-cli getrawtransaction 684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746 1
{
  "hex": "0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "txid": "684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746",
  "size": 191,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67",
      "vout": 0,
      "scriptSig": {
        "asm": "30450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d[ALL] 03583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546",
        "hex": "4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546"
      },
      "sequence": 4294967295
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
```

**注：若未设置找零输出，则会导致交易费过高，所以要设置允许交易费超额。**

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendrawtransaction", "params": ["0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000", true] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746","error":null,"id":"curltest"}
```

## 源码剖析

sendrawtransaction 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue sendrawtransaction(const UniValue& params, bool fHelp); // 发送原始交易
```

实现在“rpcrawtransaction.cpp”文件中。

```cpp
UniValue sendrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 1.参数为 1 或 2 个
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

    LOCK(cs_main); // 2.上锁
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)(UniValue::VBOOL)); // 3.参数类型检查

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
    if (!fHaveMempool && !fHaveChain) { // 4.若该交易不在交易内存池中 且 超过了高度限制即没有上链
        // push to local node and sync with wallets // 推送到本地节点并同步钱包
        CValidationState state;
        bool fMissingInputs;
        if (!AcceptToMemoryPool(mempool, state, tx, false, &fMissingInputs, false, !fOverrideFees)) { // 放入交易内存池
            if (state.IsInvalid()) { // 进行状态检测
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
    RelayTransaction(tx); // 5.然后中继（发送）该交易

    return hashTx.GetHex(); // 6.交易哈希转换为 16 进制并返回
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁。
3. 检验参数类型并获取指定参数。
4. 验证该交易是否上链（在内存池中是否存在、是否符合交易高度限制），若未上链则先把该交易加入内存池。
5. 中继（发送）该交易。
6. 返回交易的 16 进制形式。

4.调用 AcceptToMemoryPool(mempool, state, tx, false, &fMissingInputs, false, !fOverrideFees) 函数来尝试添加交易至内存池。
该函数定义在“main.cpp”文件中。入参为：交易内存池全局对象，待获取的验证状态，该交易，false，丢失输入标志，false，!交易费超额标志。

```cpp
bool AcceptToMemoryPool(CTxMemPool& pool, CValidationState &state, const CTransaction &tx, bool fLimitFree,
                        bool* pfMissingInputs, bool fOverrideMempoolLimit, bool fRejectAbsurdFee)
{
    std::vector<uint256> vHashTxToUncache; // 未缓存交易哈希列表
    bool res = AcceptToMemoryPoolWorker(pool, state, tx, fLimitFree, pfMissingInputs, fOverrideMempoolLimit, fRejectAbsurdFee, vHashTxToUncache); // 接收到内存池工作者
    if (!res) { // 若添加失败
        BOOST_FOREACH(const uint256& hashTx, vHashTxToUncache) // 遍历未缓存的交易哈希列表
            pcoinsTip->Uncache(hashTx); // 从缓存中移除该交易索引
    }
    return res;
}
```

（未完）

5.调用 RelayTransaction(tx) 中继该交易，该函数声明在“net.h”文件中。

```cpp
class CTransaction;
void RelayTransaction(const CTransaction& tx); // 转调下面重载函数
void RelayTransaction(const CTransaction& tx, const CDataStream& ss); // 中继交易
```

定义在“net.cpp”文件中。入参为：该交易。

```cpp
void RelayTransaction(const CTransaction& tx)
{
    CDataStream ss(SER_NETWORK, PROTOCOL_VERSION);
    ss.reserve(10000); // 预开辟 10000 个字节
    ss << tx; // 导入交易
    RelayTransaction(tx, ss); // 开始中继
}

void RelayTransaction(const CTransaction& tx, const CDataStream& ss)
{
    CInv inv(MSG_TX, tx.GetHash()); // 根据交易哈希创建 inv 对象
    {
        LOCK(cs_mapRelay); // 中继映射列表上锁
        // Expire old relay messages // 使旧的中继数据过期
        while (!vRelayExpiration.empty() && vRelayExpiration.front().first < GetTime())
        { // 中继到期队列非空 且 中继过期队列队头元素过期时间小于当前时间（表示已过期）
            mapRelay.erase(vRelayExpiration.front().second); // 从中继数据映射列表中擦除中继过期队列的队头
            vRelayExpiration.pop_front(); // 中继过期队列出队
        }

        // Save original serialized message so newer versions are preserved // 保存原始的序列化消息，以便保留新版本
        mapRelay.insert(std::make_pair(inv, ss)); // 把该交易插入中继数据映射列表
        vRelayExpiration.push_back(std::make_pair(GetTime() + 15 * 60, inv)); // 加上 15min 的过期时间，加入过期队列
    }
    LOCK(cs_vNodes); // 已建立连接的节点列表上锁
    BOOST_FOREACH(CNode* pnode, vNodes) // 遍历当前已建立连接的节点列表
    {
        if(!pnode->fRelayTxes) // 若中继交易状态为 false
            continue; // 跳过该节点
        LOCK(pnode->cs_filter);
        if (pnode->pfilter) // 布鲁姆过滤器
        {
            if (pnode->pfilter->IsRelevantAndUpdate(tx))
                pnode->PushInventory(inv);
        } else // 没有使用 bloom filter
            pnode->PushInventory(inv); // 直接推送 inv 消息到该节点
    }
}
```

这里先检查了中继过期队列把过期元素移除，接着把该交易加入中继列表同时设置 15 分钟的过期时间并加入中继过期队列。
然后遍历了已建立连接的节点链表，调用 pnode->PushInventory(inv) 把 inv 消息发送到对端节点，
该函数定义在“net.h”文件的 CNode 类中。入参为：该交易的库存条目对象。

```cpp
/** Information about a peer */ // 关于对端节点的信息
class CNode // 对端节点信息类
{
    ...
    // inventory based relay // 用于中继的库存数据
    CRollingBloomFilter filterInventoryKnown; // 布鲁姆过滤器
    std::vector<CInv> vInventoryToSend; // 发送库存列表
    ...
    void PushInventory(const CInv& inv)
    {
        {
            LOCK(cs_inventory); // 库存上锁
            if (inv.type == MSG_TX && filterInventoryKnown.contains(inv.hash)) // 若为交易类型 且 布鲁姆过滤器包含了该交易所在 inv 的哈希
                return; // 啥也不做直接返回
            vInventoryToSend.push_back(inv); // 否则加入发送库存列表
        }
    }
    ...
};
```

最终只是把库存条目 inv 消息对象加入到发送库存消息列表。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcrawtransaction.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcrawtransaction.cpp){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
