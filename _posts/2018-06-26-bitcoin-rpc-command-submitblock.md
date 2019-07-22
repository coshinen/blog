---
layout: post
title:  "比特币 RPC 命令剖析 \"submitblock\""
date:   2018-06-26 10:46:23 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli submitblock "hexdata" ( "jsonparametersobject" )
---
## 提示说明

{% highlight shell %}
submitblock "hexdata" ( "jsonparametersobject" ) # 尝试提交一个新区块到网络
{% endhighlight %}

**注：jsonparametersobject 当前被忽略。详见 [https://en.bitcoin.it/wiki/BIP_0022](https://en.bitcoin.it/wiki/BIP_0022)。**

参数：<br>
1.hexdata（字符串，必备）用于提交的 16 进制编码的区块数据。<br>
2.jsonparametersobject（字符串，可选）可选的参数对象。<br>
{% highlight shell %}
{
  "workid" : "id"  （字符串，可选）如果服务器提供一个工作 id，它必须包含在提交内容中。
}
{% endhighlight %}

结果：无返回值。

## 用法示例

### 比特币核心客户端

尝试提交最佳区块到链上。

{% highlight shell %}
$ bitcoin-cli getbestblockhash
00000268eb1f82d7a86f7e3d2db39974933605b36d21b61242bcf8535de8d38c
$ bitcoin-cli getblock 00000268eb1f82d7a86f7e3d2db39974933605b36d21b61242bcf8535de8d38c false
0000002083aadc5ca01aeaf98d15b7a0fe04c2a9801c4221a921bb1fb417f329ce010000a677dc9648643da9cf2d013e3cc342a998be81c1d4ce8c41c71a42b8626dbd6eedb6315b538c021ec8e13c000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff05025c720101ffffffff0100f2052a010000002321029aeb393fdc3360a7c2660487f1955404fbe54f99ad9a80d61686a7b68d08a272ac00000000
$ bitcoin-cli submitblock 0000002083aadc5ca01aeaf98d15b7a0fe04c2a9801c4221a921bb1fb417f329ce010000a677dc9648643da9cf2d013e3cc342a998be81c1d4ce8c41c71a42b8626dbd6eedb6315b538c021ec8e13c000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff05025c720101ffffffff0100f2052a010000002321029aeb393fdc3360a7c2660487f1955404fbe54f99ad9a80d61686a7b68d08a272ac00000000
duplicate
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "submitblock", "params": ["0000002083aadc5ca01aeaf98d15b7a0fe04c2a9801c4221a921bb1fb417f329ce010000a677dc9648643da9cf2d013e3cc342a998be81c1d4ce8c41c71a42b8626dbd6eedb6315b538c021ec8e13c000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff05025c720101ffffffff0100f2052a010000002321029aeb393fdc3360a7c2660487f1955404fbe54f99ad9a80d61686a7b68d08a272ac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"duplicate","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
submitblock 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue submitblock(const UniValue& params, bool fHelp); // 提交区块
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue submitblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数只有 1 个
        throw runtime_error( // 命令帮助反馈
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
        );

    CBlock block;
    if (!DecodeHexBlk(block, params[0].get_str())) // 解码 16 进制的区块数据
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "Block decode failed");

    uint256 hash = block.GetHash(); // 获取区块哈希
    bool fBlockPresent = false;
    {
        LOCK(cs_main);
        BlockMap::iterator mi = mapBlockIndex.find(hash); // 通过区块索引得到该区块对应迭代器
        if (mi != mapBlockIndex.end()) { // 如果找到了
            CBlockIndex *pindex = mi->second; // 获取其区块索引
            if (pindex->IsValid(BLOCK_VALID_SCRIPTS))
                return "duplicate";
            if (pindex->nStatus & BLOCK_FAILED_MASK)
                return "duplicate-invalid";
            // Otherwise, we might only have the header - process the block before returning
            fBlockPresent = true;
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

{% endhighlight %}

基本流程：
1. 处理命令帮助和参数个数。
2. 解码 16 进制的区块数据。
3. 获取区块哈希。
4. 查找该区块是否存在，若存在，...
5. 若不存在，...

Thanks for your time.

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#submitblock){:target="_blank"}
