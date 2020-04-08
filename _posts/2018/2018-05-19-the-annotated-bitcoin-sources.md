---
layout: post
title:  "比特币源码剖析（零）"
date:   2018-05-19 14:52:16 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoind
---
以 bitcoin v0.12.1 为例进行解读，这是官方内置挖矿功能的最后一个版本。
当前比特币的最新版本为 bitcoin v0.16.0。

## 概要

使用 Git 把比特币官方源码克隆至本地，并切换到 v0.12.1 版本，进入 bitcoin/src 目录，开始比特币源码的阅读。

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
...
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

> 比特币核心服务程序启动流程：
> 1. [SetupEnvironment()](/blog/2018/05/the-annotated-bitcoin-sources-01.html#SetupEnvironment-ref)<br>
>    设置程序运行环境：本地化处理
> 2. [noui_connect()](/blog/2018/05/the-annotated-bitcoin-sources-01.html#noui_connect-ref)<br>
>    无 UI 连接：连接信号处理函数
> 3. [AppInit(argc, argv)](/blog/2018/06/the-annotated-bitcoin-sources-02.html#AppInit-ref)<br>
>    应用程序初始化：初始化并启动
> > 1. [ParseParameters(argc, argv)](/blog/2018/06/the-annotated-bitcoin-sources-02.html#ParseParameters-ref)<br>
> >    解析命令行（控制台传入）参数
> > 2. [help and version info](/blog/2018/06/the-annotated-bitcoin-sources-02.html#HelpVersionInfo-ref)<br>
> >    版本和帮助信息
> > 3. [GetDataDir(false)](/blog/2018/06/the-annotated-bitcoin-sources-03.html#GetDataDir-ref)<br>
> >    获取数据目录
> > 4. [ReadConfigFile(mapArgs, mapMultiArgs)](/blog/2018/06/the-annotated-bitcoin-sources-03.html#ReadConfigFile-ref)<br>
> >    读取配置文件
> > 5. [SelectParams(ChainNameFromCommandLine())](/blog/2018/06/the-annotated-bitcoin-sources-03.html#SelectParams-ref)<br>
> >    选择区块链（网络）参数
> > 6. [command-line arguments sanity check](/blog/2018/06/the-annotated-bitcoin-sources-03.html#Command-line-ref)<br>
> >    命令行参数完整性检查
> > 7. [daemonization](/blog/2018/06/the-annotated-bitcoin-sources-03.html#Daemon-ref)<br>
> >    守护进程化
> > 8. [setup server](/blog/2018/06/the-annotated-bitcoin-sources-03.html#Server-ref)<br>
> >    设置服务选项
> > 9. [InitLogging()](/blog/2018/06/the-annotated-bitcoin-sources-04.html#InitLogging-ref)<br>
> >    初始化日志记录
> > 10. [InitParameterInteraction()](/blog/2018/06/the-annotated-bitcoin-sources-04.html#InitParameterInteraction-ref)<br>
> >     初始化参数交互
> > 11. [AppInit2(threadGroup, scheduler)](/blog/2018/06/the-annotated-bitcoin-sources-04.html#AppInit2-ref)<br>
> >     应用程序初始化 2（本物入口）
> > > 1. [Step 1: setup](/blog/2018/06/the-annotated-bitcoin-sources-04.html#Step01-ref)<br>
> > >    步骤 1：安装
> > > 2. [Step 2: parameter interactions](/blog/2018/06/the-annotated-bitcoin-sources-04.html#Step02-ref)<br>
> > >    步骤 2：参数交互
> > > 3. [Step 3: parameter-to-internal-flags](/blog/2018/06/the-annotated-bitcoin-sources-05.html#Step03-ref)<br>
> > >    步骤 3：参数转换为内部标志
> > > 4. [Step 4: application initialization: dir lock, daemonize, pidfile, debug log](/blog/2018/06/the-annotated-bitcoin-sources-05.html#Step04-ref)<br>
> > >    步骤 4：应用程序初始化：目录锁，守护进程化，进程号文件，调试日志
> > > 5. [Step 5: verify wallet database integrity](/blog/2018/08/the-annotated-bitcoin-sources-11.html#Step05-ref)<br>
> > >    步骤 5：验证钱包数据库的完整性
> > > 6. [Step 6: network initialization](/blog/2018/08/the-annotated-bitcoin-sources-12.html#Step06-ref)<br>
> > >    步骤 6：网络初始化
> > > 7. [Step 7: load block chain](/blog/2018/08/the-annotated-bitcoin-sources-13.html#Step07-ref)<br>
> > >    步骤 7：加载区块链
> > > 8. [Step 8: load wallet](/blog/2018/08/the-annotated-bitcoin-sources-14.html#Step08-ref)<br>
> > >    步骤 8：加载钱包
> > > 9. [Step 9: data directory maintenance](/blog/2018/09/the-annotated-bitcoin-sources-15.html#Step09-ref)<br>
> > >    步骤 9：数据目录维护
> > > 10. [Step 10: import blocks](/blog/2018/09/the-annotated-bitcoin-sources-15.html#Step10-ref)<br>
> > >     步骤 10：导入区块
> > > 11. [Step 11: start node](/blog/2018/09/the-annotated-bitcoin-sources-16.html#Step11-ref)<br>
> > >     步骤 11：启动节点
> > > 12. [Step 12: finished]()<br>
> > >     步骤 12：完成
> > 12. [WaitForShutdown]()<br>
> >     等待关闭：根据启动标志做出相应处理
> > 13. [Shutdown]()<br>
> >     关闭

## 参考链接

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1){:target="_blank"}
* [mistydew/blockchain](https://github.com/mistydew/blockchain){:target="_blank"}
