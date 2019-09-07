---
layout: post
title:  "比特币源码剖析"
date:   2018-05-19 14:52:16 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
以 bitcoin v0.12.1 为例进行解读，这是官方内置挖矿功能的最后一个版本。
当前比特币的最新版本为 bitcoin v0.16.0。

## 概要

在 Ubuntu 系统上使用 Git 把比特币官方源码克隆至本地，并切换到 v0.12.1 版本，进入 bitcoin/src 目录，开始比特币源码阅读之旅。

```shell
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆官方源码最新版到本地
$ cd bitcoin # 进入比特币根目录
$ git checkout v0.12.1 # 切换到 tag 为 v0.12.1 的版本
$ cd src # 进入 src 目录，之后未作特殊说明的均以该目录作为比特币源码的根目录
```

## 源码剖析

首先要找到一个程序的入口，也就是 main 函数。
使用 grep 命令找出 main 函数所在的文件及位置。
根据比特币核心服务程序 bitcoind，可以确定该程序对应的 main 函数在“bitcoind.cpp”文件中。

```cpp
int main(int argc, char* argv[]) // 0.程序入口
{
    SetupEnvironment(); // 1.设置程序运行环境：本地化处理

    // Connect bitcoind signal handlers
    noui_connect(); // 2.无 UI 连接：连接信号处理函数

    return (AppInit(argc, argv) ? 0 : 1); // 3.应用程序初始化：初始化并启动
}
```

下图为比特币核心服务程序启动过程中函数调用的流程：

![bitcoind-startup](https://raw.githubusercontent.com/mistydew/blockchain/master/images/bitcoind-startup-v0.12.1.png)

> 比特币核心服务程序启动流程：<br>
> 1.[SetupEnvironment()](/blog/2018/05/bitcoin-source-anatomy-01.html#SetupEnvironment-ref) | 设置程序运行环境：本地化处理。<br>
> 2.[noui_connect()](/blog/2018/05/bitcoin-source-anatomy-01.html#noui_connect-ref) | 无 UI 连接：连接信号处理函数。<br>
> 3.[AppInit(argc, argv)](/blog/2018/06/bitcoin-source-anatomy-02.html#AppInit-ref) | 应用程序初始化：初始化并启动。<br>
> 3.1.[ParseParameters(argc, argv)](/blog/2018/06/bitcoin-source-anatomy-02.html#ParseParameters-ref) | 解析命令行（控制台传入）参数。<br>
> 3.2.[help and version info](/blog/2018/06/bitcoin-source-anatomy-02.html#HelpVersionInfo-ref) | 版本和帮助信息。<br>
> 3.3.[GetDataDir(false)](/blog/2018/06/bitcoin-source-anatomy-03.html#GetDataDir-ref) | 获取数据目录。<br>
> 3.4.[ReadConfigFile(mapArgs, mapMultiArgs)](/blog/2018/06/bitcoin-source-anatomy-03.html#ReadConfigFile-ref) | 读取配置文件。<br>
> 3.5.[SelectParams(ChainNameFromCommandLine())](/blog/2018/06/bitcoin-source-anatomy-03.html#SelectParams-ref) | 选择区块链（网络）参数。<br>
> 3.6.[command-line arguments sanity check](/blog/2018/06/bitcoin-source-anatomy-03.html#Command-line-ref) | 检测命令行参数完整性。<br>
> 3.7.[daemonization](/blog/2018/06/bitcoin-source-anatomy-03.html#Daemon-ref) | 守护进程后台化。<br>
> 3.8.[setup server](/blog/2018/06/bitcoin-source-anatomy-03.html#Server-ref) | 设置服务选项。<br>
> 3.9.[InitLogging()](/blog/2018/06/bitcoin-source-anatomy-04.html#InitLogging-ref) | 初始化日志记录。<br>
> 3.10.[InitParameterInteraction()](/blog/2018/06/bitcoin-source-anatomy-04.html#InitParameterInteraction-ref) | 初始化参数交互。<br>
> 3.11.[AppInit2(threadGroup, scheduler)](/blog/2018/06/bitcoin-source-anatomy-04.html#AppInit2-ref) | 应用程序初始化 2（本物入口）。<br>
> 3.11.1.[Step 1: setup](/blog/2018/06/bitcoin-source-anatomy-04.html#Step01-ref) | 安装。<br>
> 3.11.2.[Step 2: parameter interactions](/blog/2018/06/bitcoin-source-anatomy-04.html#Step02-ref) | 参数交互。<br>
> 3.11.3.[Step 3: parameter-to-internal-flags](/blog/2018/06/bitcoin-source-anatomy-05.html#Step03-ref) | 参数转换为内部标志。<br>
> 3.11.4.[Step 4: application initialization: dir lock, daemonize, pidfile, debug log](/blog/2018/06/bitcoin-source-anatomy-05.html#Step04-ref) | 应用程序初始化：目录锁，守护进程后台化，进程号文件，调试日志文件。<br>
> 3.11.5.[Step 5: verify wallet database integrity](/blog/2018/08/bitcoin-source-anatomy-11.html#Step05-ref) | 验证钱包数据库的完整性。<br>
> 3.11.6.[Step 6: network initialization](/blog/2018/08/bitcoin-source-anatomy-12.html#Step06-ref) | 网络初始化。<br>
> 3.11.7.[Step 7: load block chain](/blog/2018/08/bitcoin-source-anatomy-13.html#Step07-ref) | 加载区块链。<br>
> 3.11.8.[Step 8: load wallet](/blog/2018/08/bitcoin-source-anatomy-14.html#Step08-ref) | 加载钱包。<br>
> 3.11.9.[Step 9: data directory maintenance](/blog/2018/09/bitcoin-source-anatomy-15.html#Step09-ref) | 数据目录维护。<br>
> 3.11.10.[Step 10: import blocks](/blog/2018/09/bitcoin-source-anatomy-15.html#Step10-ref) | 导入区块。<br>
> 3.11.11.[Step 11: start node](/blog/2018/09/bitcoin-source-anatomy-16.html#Step11-ref) | 启动节点。<br>
> 3.11.12.[Step 12: finished]() | 完成。<br>
> 3.12.[WaitForShutdown]() | 根据启动标志做出相应处理。<br>
> 3.13.[Shutdown]() | 关闭。

## 参照

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1){:target="_blank"}
* [mistydew/blockchain](https://github.com/mistydew/blockchain){:target="_blank"}
