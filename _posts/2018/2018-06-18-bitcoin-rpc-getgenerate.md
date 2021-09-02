---
layout: post
title:  "比特币 RPC 命令「getgenerate」"
date:   2018-06-18 19:25:39 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getgenerate
getgenerate

返回服务器是否设置了生成币。默认是 false。
它通过命令行参数 -gen（或 bitcoin.conf 设置选项 gen）进行设置
也可以使用 setgenerate 调用进行设置。

结果：
true|false（布尔型）服务器是否设置了生成币

例子：
> bitcoin-cli getgenerate
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getgenerate", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getgenerate` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getgenerate(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue getgenerate(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getgenerate\n"
            "\nReturn if the server is set to generate coins or not. The default is false.\n"
            "It is set with the command line argument -gen (or " + std::string(BITCOIN_CONF_FILENAME) + " setting gen)\n"
            "It can also be set with the setgenerate call.\n"
            "\nResult\n"
            "true|false      (boolean) If the server is set to generate coins or not\n"
            "\nExamples:\n"
            + HelpExampleCli("getgenerate", "")
            + HelpExampleRpc("getgenerate", "")
        ); // 1. 帮助内容

    LOCK(cs_main);
    return GetBoolArg("-gen", DEFAULT_GENERATE); // 2. 获取 "-gen" 的值并返回
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 获取 "-gen" 的值并返回

`DEFAULT_GENERATE` 定义在文件 `miner.h` 中，默认为 `false`。

```cpp
static const bool DEFAULT_GENERATE = false;
```

获取布尔型参数函数 `GetBoolArg("-gen", DEFAULT_GENERATE)` 声明在文件 `util.h` 中。

```cpp
/**
 * Return boolean argument or default value
 *
 * @param strArg Argument to get (e.g. "-foo")
 * @param default (true or false)
 * @return command-line argument or default value
 */
bool GetBoolArg(const std::string& strArg, bool fDefault); // 返回布尔型参数或默认值
```

实现在文件 `util.cpp` 中。

```cpp
bool GetBoolArg(const std::string& strArg, bool fDefault)
{
    if (mapArgs.count(strArg)) // 若该选项存在
        return InterpretBool(mapArgs[strArg]); // 返回其对应的值（转换为布尔型）
    return fDefault; // 否则返回默认值
}
```

参数映射对象 `mapArgs` 定义在 `util.cpp` 文件中，保存所有用户指定的命令行参数和配置文件中的启动选项。

其初始化是在比特币核心启动过程 3.1.ParseParameters(argc, argv) 和 3.4.ReadConfigFile(mapArgs, mapMultiArgs) 中完成的。

```cpp
map<string, string> mapArgs;
```

转换为布尔型函数 `InterpretBool(mapArgs[strArg])` 实现在 `util.cpp` 文件中。

```cpp
/** Interpret string as boolean, for argument parsing */
static bool InterpretBool(const std::string& strValue) // 把字符串转换为布尔型，用于参数解析
{
    if (strValue.empty())
        return true;
    return (atoi(strValue) != 0);
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
* [bitcoin/util.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/util.h){:target="_blank"}
* [bitcoin/util.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/util.cpp){:target="_blank"}
