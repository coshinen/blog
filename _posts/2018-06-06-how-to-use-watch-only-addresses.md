---
layout: post
title:  "如何使用 Watch-only 地址"
date:   2018-06-06 16:20:00 +0800
author: mistydew
categories: Blockchain
---
译自 [How to use Watch-only Addresses](https://blog.blockchain.com/2016/05/31/how-to-use-watch-only-addresses)。

Watch-only 地址是一个区块链钱包功能，你可以在你的钱包导入地址部分找到它。
在最近的更新中，我们对如下做了一些改进，你如何使用 watch-only 地址，以及这些地址的余额如何反应在你的钱包中。
在这篇文章中我们将会介绍这些更新的细节以及它是如何影响你的钱包体验。

## 什么是 Watch-only 地址？
一个 watch-only 地址是一个你导入自己钱包的公共比特币地址。
如果你想要监控特定比特币地址的活动，这是一个很酷且有效的功能。
你可以把任何已存在的比特币地址（[例如，像这个](https://blockchain.info/address/1PRxCErnys1jWEBnbG3Ad1e2s3uQzpasGX)）导入你的钱包作为一个 watch-only 地址，
该地址将其收入和支出交易整合到你的实时交易反馈中。
你可以直到哪些交易输入 watch-only 地址，因为它们会被标记成这样？

了解更多关于在你钱包中的地址部分，包括导入的地址，查看该[指南](https://support.blockchain.com/hc/en-us/articles/207746403-Addresses)。

一个 watch-only 地址的交易活动在该交易类型（发送或接收）右侧会有一个 `Watch Only` 标签。
![watch-only-example](https://blog.blockchain.com/content/images/2016/05/watch-only-example.png)
在这种情况下，底部的第三笔交易属于 watch-only 地址。

#### Watch-only 地址包含在你的总余额中
我们的钱包现在将在你的钱包总余额中包含来自 watch-only 地址的余额。
如果你使用 watch-only 地址来监控你控制的地址，并且你想知道你账户中的比特币总价值加上你导入的地址，这可能会有所帮助。

跟踪你可控的 watch-only 地址和不可控的地址是很重要的，
因为现在你的总余额将表示你的钱包中所有比特币地址的总和。
识别导入地址的好办法是为它们每个创建一个唯一的标签。
注意，如果你导入了一个你没有私钥的 watch-only 地址，
那么你的整个钱包余额可能无法准确反映你真正的总比特币数。

## 使用私钥从 Watch-only 地址消费
Watch-only 消费是最近更新的另一个功能。
如果你已经使用 watch-only 地址导入你的资金，
那么现在你可以在出现提示时通过提供私钥来花费它们。

当出现提示时通过输入私钥从你的 watch-only 地址发送。
![Watch-only](https://blog.blockchain.com/content/images/2016/05/Watch-only.png)

#### 这些更新在移动设备上是否可用？
当然，我们钱包的最新版本在 IOS 和 Android 上包含了以上功能。

## 参照
* [How to use Watch-only Addresses](https://blog.blockchain.com/2016/05/31/how-to-use-watch-only-addresses)
* [Watch-Only Address - Bitcoin Glossary](https://bitcoin.org/en/glossary/watch-only-address)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#importaddress)
* [...](https://github.com/mistydew/blockchain)
