---
layout: post
title:  "比特币 RPC 命令剖析 \"getgenerate\""
date:   2018-05-25 09:25:39 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getgenerate
---
## 提示说明

{% highlight shell %}
getgenerate # 获取比特币核心服务的挖矿状态
{% endhighlight %}

默认为 false。
服务器程序设置命令行参数 -gen（或配置文件 bitcoin.conf 中设置 gen），也可以使用 [setgenerate](/2018/05/25/bitcoin-rpc-command-setgenerate) 命令设置。

结果：（布尔型）true 表示服务器开启 CPU 挖矿，false 表示关闭。

## 用法示例

### 比特币核心客户端

获取当前比特币核心服务器 CPU 挖矿状态。

{% highlight shell %}
$ bitcoin-cli getgenerate
false
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getgenerate", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":false,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getgenerate 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getgenerate(const UniValue& params, bool fHelp); // 获取挖矿状态
{% endhighlight %}

实现在“rpcmining.cpp”文件中。

{% highlight C++ %}
UniValue getgenerate(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "getgenerate\n"
            "\nReturn if the server is set to generate coins or not. The default is false.\n"
            "It is set with the command line argument -gen (or " + std::string(BITCOIN_CONF_FILENAME) + " setting gen)\n"
            "It can also be set with the setgenerate call.\n"
            "\nResult\n"
            "true|false      (boolean) If the server is set to generate coins or not\n"
            "\nExamples:\n"
            + HelpExampleCli("getgenerate", "")
            + HelpExampleRpc("getgenerate", "")
        );

    LOCK(cs_main);
    return GetBoolArg("-gen", DEFAULT_GENERATE); // 获取 "-gen" 选项的值并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取启动选项 "-gen" 对应的值，转换为布尔型并返回。

调用 GetBoolArg("-gen", DEFAULT_GENERATE) 函数获取挖矿状态，即挖矿选项 "-gen" 对应的值。<br>
DEFAULT_GENERATE 定义在“miner.h”文件中。

{% highlight C++ %}
static const bool DEFAULT_GENERATE = false; // 挖矿状态，默认关闭
{% endhighlight %}

该函数声明在“util.h”文件中。

{% highlight C++ %}
/**
 * Return boolean argument or default value
 *
 * @param strArg Argument to get (e.g. "-foo")
 * @param default (true or false)
 * @return command-line argument or default value
 */ // 返回布尔型参数或默认值
bool GetBoolArg(const std::string& strArg, bool fDefault); // 获取指定选项的值
{% endhighlight %}

实现在“util.cpp”文件中。

{% highlight C++ %}
bool GetBoolArg(const std::string& strArg, bool fDefault)
{
    if (mapArgs.count(strArg)) // 若该选项存在
        return InterpretBool(mapArgs[strArg]); // 返回其对应的值（转换为布尔型）
    return fDefault; // 否则返回默认值
}
{% endhighlight %}

对象 mapArgs 定义在“”文件中，该对象保存所有用户指定的命令行参数和配置文件中的启动选项。<br>
其初始化是在比特币核心启动过程 3.1.ParseParameters(argc, argv) 和 3.4.ReadConfigFile(mapArgs, mapMultiArgs) 中完成的。

{% highlight C++ %}
map<string, string> mapArgs; // 命令行参数（启动选项）映射列表
{% endhighlight %}

确认指定命令行参数（启动选项）"-gen" 存在，调用 InterpretBool(mapArgs[strArg]) 函数把 "-gen" 对应的值转换为布尔型。

{% highlight C++ %}
/** Interpret string as boolean, for argument parsing */
static bool InterpretBool(const std::string& strValue) // 把字符串转换为布尔型，用于参数解析
{
    if (strValue.empty()) // 若字符串为空
        return true; // 返回 true，表示指定的选项未指定值时，该值默认为 true
    return (atoi(strValue) != 0); // 否则，在返回时转换为对应布尔型
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getgenerate)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
