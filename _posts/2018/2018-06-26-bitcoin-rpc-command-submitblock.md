---
layout: post
title:  "比特币 RPC 命令剖析 \"submitblock\""
date:   2018-06-26 10:46:23 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli submitblock "hexdata" ( "jsonparametersobject" )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help submitblock
submitblock "hexdata" ( "jsonparametersobject" )

尝试提交新的区块到网络。
'jsonparametersobject' 参数当前已被忽略。
查看 https://en.bitcoin.it/wiki/BIP_0022 获取完整规格。

参数：
1. "hexdata"             （字符串，必备）待提交的 16 进制编码的区块数据
2. "jsonparametersobject"（字符串，可选）可选的参数对象
    {
      "workid" : "id"    （字符串，可选）如果服务器提供一个工作 id，它必须包含在提交中
    }

结果：

例子：
> bitcoin-cli submitblock "mydata"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "submitblock", "params": ["mydata"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`submitblock` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue submitblock(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue submitblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "submitblock \"hexdata\" ( \"jsonparametersobject\" )\n"
            "\nAttempts to submit new block to network.\n"
            "The 'jsonparametersobject' parameter is currently ignored.\n"
            "See https://en.bitcoin.it/wiki/BIP_0022 for full specification.\n"

            "\nArguments\n"
            "1. \"hexdata\"    (string, required) the hex-encoded block data to submit\n"
            "2. \"jsonparametersobject\"     (string, optional) object of optional parameters\n"
            "    {\n"
            "      \"workid\" : \"id\"    (string, optional) if the server provided a workid, it MUST be included with submissions\n"
            "    }\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("submitblock", "\"mydata\"")
            + HelpExampleRpc("submitblock", "\"mydata\"")
        ); // 1. 帮助内容

    CBlock block;
    if (!DecodeHexBlk(block, params[0].get_str())) // 2. 解码 16 进制区块数据
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "Block decode failed");

    uint256 hash = block.GetHash();
    bool fBlockPresent = false;
    {
        LOCK(cs_main);
        BlockMap::iterator mi = mapBlockIndex.find(hash);
        if (mi != mapBlockIndex.end()) {
            CBlockIndex *pindex = mi->second;
            if (pindex->IsValid(BLOCK_VALID_SCRIPTS))
                return "duplicate";
            if (pindex->nStatus & BLOCK_FAILED_MASK)
                return "duplicate-invalid";
            // Otherwise, we might only have the header - process the block before returning
            fBlockPresent = true; // 否则，我们可能只有区块头 - 在返回前处理区块
        }
    }

    CValidationState state;
    submitblock_StateCatcher sc(block.GetHash());
    RegisterValidationInterface(&sc);
    bool fAccepted = ProcessNewBlock(state, Params(), NULL, &block, true, NULL);
    UnregisterValidationInterface(&sc);
    if (fBlockPresent)
    {
        if (fAccepted && !sc.found)
            return "duplicate-inconclusive";
        return "duplicate";
    }
    if (fAccepted)
    {
        if (!sc.found)
            return "inconclusive";
        state = sc.state;
    }
    return BIP22ValidationResult(state);
}

```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
