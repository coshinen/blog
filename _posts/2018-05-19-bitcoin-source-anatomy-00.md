---
layout: post
title:  "比特币源码剖析"
date:   2018-05-19 14:52:16 +0800
categories: Blockchain
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

![](/images/20180519/bitcoindsetup01.png)
![](/images/20180519/bitcoindsetup02.png)

比特币核心服务程序启动流程，如上图所示：<br>
1.设置程序运行环境：本地化处理。<br>
2.无 UI 连接：连接信号处理函数。<br>
3.应用程序初始化：初始化并启动。<br>
3.1.解析命令行（控制台传入）参数。<br>
3.2.版本和帮助信息。<br>
3.3.数据目录：先获取，若不存在则按 默认/指定 名字创建。<br>
3.4.读取配置文件。<br>
3.5.选择区块链（网络）参数，创世区块程序启动时便生成。<br>
3.6.检测每个命令行参数是否以'-'或'/'开头。<br>
3.7.Linux 下根据配置后台化，默认关闭。<br>
3.8.服务设置，默认开启，后面启动。<br>
3.9.初始化日志记录，默认输出至 debug.log。<br>
3.10.初始化参数交互，说明部分参数规则（用法）。<br>
3.11.应用程序初始化 2（本物入口）。<br>
3.11.1.安装网络环境，挂接事件处理器。<br>
3.11.2.参数交互设置，如区块裁剪 prune 与交易索引 txindex 的冲突检测、文件描述符限制的检查。<br>
3.11.3.参数转换为内部变量，把外部参数的设置转化为程序内部的状态（bool 型参数，开关类选项）。<br>
3.11.4.初始化 ECC，目录锁检查（保证只有一个 bitcoind 运行），pid 文件，debug 日志。<br>
3.11.5.若启用钱包功能，则验证钱包数据库的完整性。<br>
3.11.6.网络初始化。<br>
3.11.7.加载区块链数据，区块数据目录 blocks。<br>
3.11.8.若启用钱包功能，则加载钱包。<br>
3.11.9.若是裁剪模式，则进行 blockstore 的裁剪。<br>
3.11.10.导入区块数据。<br>
3.11.11.启动节点服务，监听网络 P2P 请求，挖矿线程。<br>
3.11.12.初始化完成。<br>
3.12.根据启动标志做出相应处理。<br>
3.13.关闭。

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
