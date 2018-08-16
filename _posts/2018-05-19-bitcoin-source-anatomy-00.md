---
layout: post
title:  "比特币源码剖析"
date:   2018-05-19 14:52:16 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin SourceAnalysis
stickie: true
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
下载比特币源码到本地，这里可以采用 Linux 系统的 Git 把官方源码克隆至本地。<br>
切换到 v0.12.1 版本的源码，进入 `bitcoin/src` 目录，开始我们的源码之旅。

{% highlight shell %}
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆官方源码最新版到本地
$ cd bitcoin # 进入比特币根目录
$ git checkout v0.12.1 # 切换到 tag 为 v0.12.1 的版本
$ cd src # 进入 src 目录，之后未作特殊说明的均以该目录作为比特币源码的根目录
{% endhighlight %}

## 源码剖析
“源码之前，了无秘密” — 侯捷<br>

首先要找到一个程序的入口，也就是 `main` 函数。<br>
使用 `grep` 命令查找 `main` 函数所出现的文件即位置。<br>
根据比特币核心服务程序 `bitcoind`，可以找到该程序对应的 `main` 函数在“bitcoind.cpp”文件中。

{% highlight C++ %}
int main(int argc, char* argv[]) // 0.程序入口
{
    SetupEnvironment(); // 1.设置程序运行环境：本地化处理

    // Connect bitcoind signal handlers
    noui_connect(); // 2.无 UI 连接：连接信号处理函数

    return (AppInit(argc, argv) ? 0 : 1); // 3.应用程序初始化：初始化并启动
}
{% endhighlight %}

![bitcoindsetup01](/images/20180519/bitcoindsetup01.png)
![bitcoindsetup02](/images/20180519/bitcoindsetup02.png)

比特币核心服务程序启动流程，如上图所示：<br>
1.设置程序运行环境：本地化处理。[`SetupEnvironment()`](/2018/05/26/bitcoin-source-anatomy-01#SetupEnvironment-ref)<br>
2.无 UI 连接：连接信号处理函数。[`noui_connect()`](/2018/05/26/bitcoin-source-anatomy-01#noui_connect-ref)<br>
3.应用程序初始化：初始化并启动。[`AppInit(argc, argv)`](/2018/06/02/bitcoin-source-anatomy-02#AppInit-ref)<br>
3.1.解析命令行（控制台传入）参数。[`ParseParameters(argc, argv)`](/2018/06/02/bitcoin-source-anatomy-02#ParseParameters-ref)<br>
3.2.版本和帮助信息。[`help and version info`](/2018/06/02/bitcoin-source-anatomy-02#HelpVersionInfo-ref)<br>
3.3.获取数据目录。[`GetDataDir(false)`](/2018/06/09/bitcoin-source-anatomy-03#GetDataDir-ref)<br>
3.4.读取配置文件。[`ReadConfigFile(mapArgs, mapMultiArgs)`](/2018/06/09/bitcoin-source-anatomy-03#ReadConfigFile-ref)<br>
3.5.选择区块链（网络）参数。[`SelectParams(ChainNameFromCommandLine())`](/2018/06/09/bitcoin-source-anatomy-03#SelectParams-ref)<br>
3.6.检测命令行参数完整性。[`command-line arguments sanity check`](/2018/06/09/bitcoin-source-anatomy-03#Command-line-ref)<br>
3.7.`Linux` 下守护进程后台化。[`daemonization`](/2018/06/09/bitcoin-source-anatomy-03#Daemon-ref)<br>
3.8.设置服务选项。[`setup server`](/2018/06/09/bitcoin-source-anatomy-03#Server-ref)<br>
3.9.初始化日志记录。[`InitLogging()`](/2018/06/16/bitcoin-source-anatomy-04#InitLogging-ref)<br>
3.10.初始化参数交互。[`InitParameterInteraction()`](/2018/06/16/bitcoin-source-anatomy-04#InitParameterInteraction-ref)<br>
3.11.应用程序初始化 2（本物入口）。[`AppInit2(threadGroup, scheduler)`](/2018/06/16/bitcoin-source-anatomy-04#AppInit2-ref)<br>
3.11.1.安装。[`Step 1: setup`](/2018/06/16/bitcoin-source-anatomy-04#Step01-ref)<br>
3.11.2.参数交互。[`Step 2: parameter interactions`](/2018/06/16/bitcoin-source-anatomy-04#Step02-ref)<br>
3.11.3.参数转换为内部标志。[`Step 3: parameter-to-internal-flags`](/2018/06/23/bitcoin-source-anatomy-05#Step03-ref)<br>
3.11.4.应用程序初始化：目录锁，守护进程后台化，进程号文件，调试日志文件。[`Step 4: application initialization: dir lock, daemonize, pidfile, debug log`](/2018/06/23/bitcoin-source-anatomy-05#Step04-ref)<br>
3.11.5.验证钱包数据库的完整性。[`Step 5: verify wallet database integrity`](/2018/08/04/bitcoin-source-anatomy-11#Step05-ref)<br>
3.11.6.网络初始化。[`Step 6: network initialization`](/2018/08/11/bitcoin-source-anatomy-12#Step06-ref)<br>
3.11.7.加载区块链。[`Step 7: load block chain`](/2018/08/18/bitcoin-source-anatomy-13#Step07-ref)<br>
3.11.8.加载钱包。[`Step 8: load wallet`]()<br>
3.11.9.数据目录维护。[`Step 9: data directory maintenance`]()<br>
3.11.10.导入区块。[`Step 10: import blocks`]()<br>
3.11.11.启动节点。[`Step 11: start node`]()<br>
3.11.12.完成。[`Step 12: finished`]()<br>
3.12.根据启动标志做出相应处理。[`WaitForShutdown`]()<br>
3.13.关闭。[`Shutdown`]()

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
