---
layout: post
title:  "比特币源码剖析（四）"
date:   2018-06-16 16:21:35 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin src
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
上一篇分析了数据目录路径的获取、配置文件中设置的启动选项的读取、不同网络链参数（包含创世区块信息）的选择、命令行参数完整性检测、`Linux` 下守护进程的后台化以及服务选项的设置，详见[比特币源码剖析（三）](/2018/06/09/bitcoin-source-anatomy-03)。<br>
本篇主要分析 `InitLogging()` 初始化日志记录函数，`InitParameterInteraction()` 初始化参数交互函数。

## 源码剖析

{% highlight C++ %}
bool AppInit(int argc, char* argv[]) // [P]3.0.应用程序初始化
{
    ...
    try
    {
        ...
        // Set this early so that parameter interactions go to console // 尽早设置该项使参数交互到控制台
        InitLogging(); // 3.9.初始化日志记录
        InitParameterInteraction(); // 3.10.初始化参数交互
        ...
    }
    catch (const std::exception& e) {
        PrintExceptionContinue(&e, "AppInit()");
    } catch (...) {
        PrintExceptionContinue(NULL, "AppInit()");
    }
    ...
}
{% endhighlight %}

<p id="InitLogging-ref"></p>
3.9.调用 `InitLogging()` 函数初始化日志记录，实际上只是初始化了部分启动选项，该函数声明在“init.h”文件中。

{% highlight C++ %}
//!Initialize the logging infrastructure // 初始化日志记录基础结构
void InitLogging();
{% endhighlight %}

实现在“init.cpp”文件中，没有入参。

{% highlight C++ %}
void InitLogging()
{
    fPrintToConsole = GetBoolArg("-printtoconsole", false); // 1.打印到控制台，默认关闭
    fLogTimestamps = GetBoolArg("-logtimestamps", DEFAULT_LOGTIMESTAMPS); // 记录日志时间戳，默认打开
    fLogTimeMicros = GetBoolArg("-logtimemicros", DEFAULT_LOGTIMEMICROS); // 时间戳微秒，默认关闭
    fLogIPs = GetBoolArg("-logips", DEFAULT_LOGIPS); // 记录 IPs，默认关闭

    LogPrintf("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"); // 2.n 个空行
    LogPrintf("Bitcoin version %s (%s)\n", FormatFullVersion(), CLIENT_DATE); // 记录比特币客户端版本号和构建时间
}
{% endhighlight %}

1.对记录日志的相关启动选项进行初始化。<br>
2.空出 `n` 行后，记录比特币客户端的版本号和构建时间。

宏定义 `DEFAULT_LOGTIMESTAMPS`、`DEFAULT_LOGTIMEMICROS`、`DEFAULT_LOGIPS` 均定义在“util.h”文件中。

{% highlight C++ %}
static const bool DEFAULT_LOGTIMEMICROS = false; // 时间戳微秒，默认为 false
static const bool DEFAULT_LOGIPS        = false; // 记录 IPs，默认关闭
static const bool DEFAULT_LOGTIMESTAMPS = true; // 记录时间戳，默认为 true
{% endhighlight %}

`CLIENT_DATE` 宏定义在“clientversion.cpp”文件中。

{% highlight C++ %}
#ifndef BUILD_DATE
#ifdef GIT_COMMIT_DATE
#define BUILD_DATE GIT_COMMIT_DATE // git 提交日期
#else
#define BUILD_DATE __DATE__ ", " __TIME__ // __DATE__ 为编译日期，__TIME__ 为编译时间
#endif
#endif
...
const std::string CLIENT_DATE(BUILD_DATE); // 客户端日期即构建日期
{% endhighlight %}

<p id="InitParameterInteraction-ref"></p>
3.10.调用 `InitParameterInteraction()` 函数初始化参数交互，该函数声明在“init.h”文件中。

{% highlight C++ %}
//!Parameter interaction: change current parameters depending on various rules // 参数交互：基于多种规则改变当前参数
void InitParameterInteraction();
{% endhighlight %}

实现在“init.cpp”文件中，没有入参。

{% highlight C++ %}
// Parameter interaction based on rules // 基于规则的参数交互
void InitParameterInteraction()
{
    // when specifying an explicit binding address, you want to listen on it
    // even when -connect or -proxy is specified
    if (mapArgs.count("-bind")) {
        if (SoftSetBoolArg("-listen", true))
            LogPrintf("%s: parameter interaction: -bind set -> setting -listen=1\n", __func__);
    }
    if (mapArgs.count("-whitebind")) {
        if (SoftSetBoolArg("-listen", true))
            LogPrintf("%s: parameter interaction: -whitebind set -> setting -listen=1\n", __func__);
    }

    if (mapArgs.count("-connect") && mapMultiArgs["-connect"].size() > 0) {
        // when only connecting to trusted nodes, do not seed via DNS, or listen by default
        if (SoftSetBoolArg("-dnsseed", false))
            LogPrintf("%s: parameter interaction: -connect set -> setting -dnsseed=0\n", __func__);
        if (SoftSetBoolArg("-listen", false))
            LogPrintf("%s: parameter interaction: -connect set -> setting -listen=0\n", __func__);
    }

    if (mapArgs.count("-proxy")) {
        // to protect privacy, do not listen by default if a default proxy server is specified
        if (SoftSetBoolArg("-listen", false))
            LogPrintf("%s: parameter interaction: -proxy set -> setting -listen=0\n", __func__);
        // to protect privacy, do not use UPNP when a proxy is set. The user may still specify -listen=1
        // to listen locally, so don't rely on this happening through -listen below.
        if (SoftSetBoolArg("-upnp", false))
            LogPrintf("%s: parameter interaction: -proxy set -> setting -upnp=0\n", __func__);
        // to protect privacy, do not discover addresses by default
        if (SoftSetBoolArg("-discover", false))
            LogPrintf("%s: parameter interaction: -proxy set -> setting -discover=0\n", __func__);
    }

    if (!GetBoolArg("-listen", DEFAULT_LISTEN)) {
        // do not map ports or try to retrieve public IP when not listening (pointless)
        if (SoftSetBoolArg("-upnp", false))
            LogPrintf("%s: parameter interaction: -listen=0 -> setting -upnp=0\n", __func__);
        if (SoftSetBoolArg("-discover", false))
            LogPrintf("%s: parameter interaction: -listen=0 -> setting -discover=0\n", __func__);
        if (SoftSetBoolArg("-listenonion", false))
            LogPrintf("%s: parameter interaction: -listen=0 -> setting -listenonion=0\n", __func__);
    }

    if (mapArgs.count("-externalip")) {
        // if an explicit public IP is specified, do not try to find others
        if (SoftSetBoolArg("-discover", false))
            LogPrintf("%s: parameter interaction: -externalip set -> setting -discover=0\n", __func__);
    }

    if (GetBoolArg("-salvagewallet", false)) {
        // Rewrite just private keys: rescan to find transactions
        if (SoftSetBoolArg("-rescan", true))
            LogPrintf("%s: parameter interaction: -salvagewallet=1 -> setting -rescan=1\n", __func__);
    }

    // -zapwallettx implies a rescan
    if (GetBoolArg("-zapwallettxes", false)) {
        if (SoftSetBoolArg("-rescan", true))
            LogPrintf("%s: parameter interaction: -zapwallettxes=<mode> -> setting -rescan=1\n", __func__);
    }

    // disable walletbroadcast and whitelistrelay in blocksonly mode
    if (GetBoolArg("-blocksonly", DEFAULT_BLOCKSONLY)) {
        if (SoftSetBoolArg("-whitelistrelay", false))
            LogPrintf("%s: parameter interaction: -blocksonly=1 -> setting -whitelistrelay=0\n", __func__);
#ifdef ENABLE_WALLET
        if (SoftSetBoolArg("-walletbroadcast", false))
            LogPrintf("%s: parameter interaction: -blocksonly=1 -> setting -walletbroadcast=0\n", __func__);
#endif
    }

    // Forcing relay from whitelisted hosts implies we will accept relays from them in the first place.
    if (GetBoolArg("-whitelistforcerelay", DEFAULT_WHITELISTFORCERELAY)) {
        if (SoftSetBoolArg("-whitelistrelay", true))
            LogPrintf("%s: parameter interaction: -whitelistforcerelay=1 -> setting -whitelistrelay=1\n", __func__);
    }
}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（五）](/2018/06/23/bitcoin-source-anatomy-05)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
