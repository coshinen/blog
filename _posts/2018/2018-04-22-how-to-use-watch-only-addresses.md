---
layout: post
title:  "如何使用 Watch-only 地址"
date:   2018-04-22 16:20:00 +0800
author: mistydew
comments: true
categories: 译文集 区块链
tags: Translations Blockchain Bitcoin
---
Watch-only 地址是一个区块链钱包功能，你可以在钱包的导入地址部分找到它。
在最近的更新中，我们对如何使用 watch-only 地址，以及这些地址的余额如何反应在你的钱包中做了一些改进。
在这篇文章中我们将详细介绍这些更新以及它是如何影响你的钱包体验。

## 什么是 Watch-only 地址？

Watch-only 地址是一个你导入自己钱包的比特币公共地址。
如果你想要监控特定的比特币地址的活动，这是一个很酷且有用的功能。
你可以把任何现有的比特币地址作为一个 watch-only 地址导入你的钱包，该地址将其收入和支出的交易整合到你的实时交易反馈中。
你可以识别出哪些交易包含 watch-only 地址，因为它们会被标记成这样。

了解更多钱包中的地址部分的更多信息，包括导入的地址，请查看该[指南](https://support.blockchain.com/hc/en-us/articles/207746403-Addresses){:target="_blank"}。

一个 watch-only 地址的交易活动在该交易类型（发送或接收）右侧会有一个 Watch Only 标签。
这种情况下，你可以看到底部的第三笔交易属于 watch-only 地址。
Watch-only 地址将会包含在你的总余额中。

我们的钱包现在将在你的钱包总余额中包含来自 watch-only 地址的余额。
如果你使用 watch-only 地址来监控你控制的地址，并且如果你想知道账户中比特币的总额，加上你导入的地址，那么这将非常有用。

重要的是跟踪可控的 watch-only 地址和不可控的地址，因为现在总余额将表示你的钱包中所有比特币地址的总和。
识别导入地址的一个好办法是为它们创建唯一的标签。
请注意如果导入了一个没有私钥的 watch-only 地址，那么整个钱包余额可能无法准确表示你控制的比特币总数。

## 使用私钥从 Watch-only 地址消费

Watch-only 消费是最近更新的另一个功能。
如果你已经使用 watch-only 地址导入你的资金，那么现在你可以在出现提示时通过提供私钥来花费它们。

当出现提示时通过输入私钥从你的 watch-only 地址发送。

关于 Watch-only 地址的源码部分，详见[比特币 RPC 命令剖析 "importaddress"](/blog/2018/08/bitcoin-rpc-command-importaddress.html)。

## 参考链接

* [How to use Watch-only Addresses](https://blog.blockchain.com/2016/05/31/how-to-use-watch-only-addresses){:target="_blank"}, By Blockchain Team
* [Watch-Only Address - Bitcoin Glossary](https://bitcoin.org/en/glossary/watch-only-address){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#importaddress){:target="_blank"}
