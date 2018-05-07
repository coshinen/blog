---
layout: post
title:  "启动比特币核心 bitcoind"
date:   2018-05-04 03:08:22 +0800
categories: jekyll update
---
原始可用的比特币程序有两个版本；
一个带有图形化用户界面（通常被称为“比特币”），和一个“无头”版本（被称为 bitcoind，这里的“无头”指的是没有图形化界面，只有命令行）。
它们完全互相兼容，并使用相同的命令行参数，读取相同的配置文件，且读写相同的数据文件。
你可以在你的系统上运行比特币或 bitcoind 的一个副本一次（如果你不小心启动来另一个，该副本将让你知道：比特币或 bitcoind 已经启动并该程序将要退出）。

![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## Linux 快速启动
使用命令行客户端启动（从头开始）的最简单方式，自动同步区块并创建一个钱包，只要从包含你的 bitcoind 二进制程序的目录运行以下命令（不带参数）：

> `./bitcoind`

运行标准的图形化界面：

> `./bitcoin-qt`

## 命令行参数
以下命令是准确的来自于比特币核心版本 v0.12.1.

## 比特币配置文件样例
来自 [https://github.com/mistydew/blockchain/blob/master/bitcoin.conf](https://github.com/mistydew/blockchain/blob/master/bitcoin.conf):

## 参照
* [Running Bitcoin - Bitcoin Wiki](https://en.bitcoin.it/wiki/Running_Bitcoin)
* [bitcoin.conf](https://github.com/mistydew/blockchain/blob/master/bitcoin.conf)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew)
