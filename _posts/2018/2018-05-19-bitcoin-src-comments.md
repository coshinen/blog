---
layout: post
title:  "比特币源码剖析"
date:   2018-05-19 14:52:16 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoind
---
本文以比特币 v0.12.1（目前最新为 v0.16.0）为例进行解读，这是内置挖矿功能的最后一个版本。

## 1. 获取源码

```shell
$ git clone https://github.com/bitcoin/bitcoin.git
$ cd bitcoin # 进入根目录
$ git checkout v0.12.1 # 切换到 v0.12.1
$ cd src # 进入源码目录
```

## 2. 源码剖析

使用 `grep` 查看入口函数 `main` 的所在位置。
比特币核心程序 `bitcoind` 的入口函数定义在源文件 `bitcoind.cpp` 中。

```cpp
int main(int argc, char* argv[])
{
    SetupEnvironment(); // 1. 设置程序运行环境：本地化处理

    // Connect bitcoind signal handlers
    noui_connect(); // 2. 无 UI 连接：连接信号处理函数

    return (AppInit(argc, argv) ? 0 : 1); // 3. 应用程序初始化：初始化并启动
}
```

> 比特币 v0.12.1 核心服务程序启动流程：
> 1. [SetupEnvironment()](/blog/2018/05/bitcoin-src-comments-01.html#SetupEnvironment-ref)<br>设置程序运行环境：本地化处理
> 2. [noui_connect()](/blog/2018/05/bitcoin-src-comments-01.html#noui_connect-ref)<br>无 UI 连接：连接信号处理函数
> 3. [AppInit(argc, argv)](/blog/2018/06/bitcoin-src-comments-02.html#AppInit-ref)<br>应用程序初始化：初始化并启动
> > 1. [ParseParameters(argc, argv)](/blog/2018/06/bitcoin-src-comments-02.html#ParseParameters-ref)<br>解析命令行（控制台传入）参数
> > 2. [help and version info](/blog/2018/06/bitcoin-src-comments-02.html#HelpVersionInfo-ref)<br>版本和帮助信息
> > 3. [GetDataDir(false)](/blog/2018/06/bitcoin-src-comments-03.html#GetDataDir-ref)<br>获取数据目录
> > 4. [ReadConfigFile(mapArgs, mapMultiArgs)](/blog/2018/06/bitcoin-src-comments-03.html#ReadConfigFile-ref)<br>读取配置文件
> > 5. [SelectParams(ChainNameFromCommandLine())](/blog/2018/06/bitcoin-src-comments-03.html#SelectParams-ref)<br>选择区块链（网络）参数
> > 6. [command-line arguments sanity check](/blog/2018/06/bitcoin-src-comments-03.html#Command-line-ref)<br>命令行参数完整性检查
> > 7. [daemonization](/blog/2018/06/bitcoin-src-comments-03.html#Daemon-ref)<br>守护进程化
> > 8. [setup server](/blog/2018/06/bitcoin-src-comments-03.html#Server-ref)<br>设置服务选项
> > 9. [InitLogging()](/blog/2018/06/bitcoin-src-comments-04.html#InitLogging-ref)<br>初始化日志记录
> > 10. [InitParameterInteraction()](/blog/2018/06/bitcoin-src-comments-04.html#InitParameterInteraction-ref)<br>初始化参数交互
> > 11. [AppInit2(threadGroup, scheduler)](/blog/2018/06/bitcoin-src-comments-04.html#AppInit2-ref)<br>应用程序初始化 2
> > > 1. [Step 1: setup](/blog/2018/06/bitcoin-src-comments-04.html#Step01-ref)<br>步骤 1：安装
> > > 2. [Step 2: parameter interactions](/blog/2018/06/bitcoin-src-comments-04.html#Step02-ref)<br>步骤 2：参数交互
> > > 3. [Step 3: parameter-to-internal-flags](/blog/2018/06/bitcoin-src-comments-05.html#Step03-ref)<br>步骤 3：参数转换为内部标志
> > > 4. [Step 4: application initialization: dir lock, daemonize, pidfile, debug log](/blog/2018/06/bitcoin-src-comments-05.html#Step04-ref)<br>步骤 4：应用程序初始化：目录锁，守护进程化，进程号文件，调试日志
> > > 5. [Step 5: verify wallet database integrity](/blog/2018/08/bitcoin-src-comments-11.html#Step05-ref)<br>步骤 5：验证钱包数据库的完整性
> > > 6. [Step 6: network initialization](/blog/2018/08/bitcoin-src-comments-12.html#Step06-ref)<br>步骤 6：网络初始化
> > > 7. [Step 7: load block chain](/blog/2018/08/bitcoin-src-comments-13.html#Step07-ref)<br>步骤 7：加载区块链
> > > 8. [Step 8: load wallet](/blog/2018/08/bitcoin-src-comments-14.html#Step08-ref)<br>步骤 8：加载钱包
> > > 9. [Step 9: data directory maintenance](/blog/2018/09/bitcoin-src-comments-15.html#Step09-ref)<br>步骤 9：数据目录维护
> > > 10. [Step 10: import blocks](/blog/2018/09/bitcoin-src-comments-15.html#Step10-ref)<br>步骤 10：导入区块
> > > 11. [Step 11: start node](/blog/2018/09/bitcoin-src-comments-16.html#Step11-ref)<br>步骤 11：启动节点
> > > 12. [Step 12: finished]()<br>步骤 12：完成
> > 12. [WaitForShutdown(&threadGroup)]()<br>等待关闭：根据启动标志做出相应处理
> > 13. [Shutdown()]()<br>关闭
> 
> ![bitcoind-startup](https://www.plantuml.com/plantuml/svg/ZLHDJzn03Btlhx3sK6NHHYhqEmS4uWCXqQhgLke1eSeaJjPYuebc713zzVLaTo7XK7g9alUU_JnsF4THCMZVkbcsju0yFxnU9O2bWIxuacAyWNcBB1cB0eQcN4Avnh2Ntk-lRnRpMHwuMMj-2FCLQT-ToJq7Bos9PebDXFYUVvTUXCfdyBZhBeKr6v8EwIR9lcE8P0ziIId45xAaM9Fh0AM2U-FP2x3KVijTa9wYuYc7h4ONQHVpWx0wyL9pSywEiXQxuz349TZBrzuffw-TTaNEwXrAYDd96bc-OKldmRSdlctD-8g5iiLENcx0t1cQwknJ2o945DP7QngLTrjbXTHwuJ-ex6MBnTGxY1JiC5ieTUVADmrBaor6s5DJBiKUMAOiBxjwaEaw45ONmVVT4gBPLxsZC9sNKWVx1GpUHZnX1mLqEnFWPvSu5hqRYNBr-Q0JT7dji9aetnU0NUUuHDsCYPNHRSzVGCK1d2_lbh1h32sXuwfcHuRHRTyOtumpVYZIqBb-X0TqZjGY5Mynqb1j4wpZO_d70eJqmOUx5-PZqQV2NB22srHB-ibvGd_Uq5l3CVEb6EpJEQXK7nwXnLI6e9Gq5kw_BO3RpWVTcCG9cGQXQ9puQXfcuwXPEDeC_tlAN5kqRmb-KjGvw9fa1iE2Q-Z9bleNifxxi5htMla7oTwCKbaym63qH1j4BfBXbYAjLCen_82XxpHxFLWghl-n-CQyUj6OyvbKaxl9RgtPaUNkM_SN)

## 参考链接

* [bitcoin/bitcoind.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/bitcoind.cpp){:target="_blank"}
