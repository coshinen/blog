---
layout: post
title:  "设计模式之单例模式"
date:   2018-10-09 21:31:55 +0800
author: mistydew
comments: true
categories: 设计模式
tags: C++ 设计模式
---
## 概要
单例模式是一种软件设计模式，它限制类的实例化为一个对象。

## 特性
1.不可复制，确保单例类只存在一个实例。<br>
2.提供全局访问该实例的方法。

## 实现方法
0.声明该类的默认构造函数为私有，防止在类外实例化。<br>
1.使用 static 关键字保证只实例化一次。<br>
2.提供一个静态方法，返回对实例的引用。

**注：该实例通常存储私有静态变量，在首次调用静态方法前创建实例。**

基础类图如下：<br>
![Singleton_UML_class_diagram](/images/20180717/Singleton_UML_class_diagram.svg)

## 实现

{% highlight C++ %}
class Singleton
{
public:
	static Singleton & getInstance()
	{
		static Singleton instance;
		Singleton::_pInstance = &instance;
		return *_pInstance;
	}
private:
	Singleton(){}

	static Singleton * _pInstance;
};
{% endhighlight %}

## 比特币中单例类的实现

{% highlight C++ %}
class Singleton
{
public:
	static Singleton & getInstance()
	{
		boost:call_once(Singleton::createInstance, Singleton::_init_flag);
		return *_pInstance;
	}
private:
	Singleton(){}

	static void createInstance()
	{
		static Singleton instance;
		Singleton::_pInstance = &instance;
	}

	static Singleton * _pInstance;
	static boost::once_flag _init_flag;
};
{% endhighlight %}

参考 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1) 源码中的类 [LockedPageManager](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/support/pagelocker.h) 的实现。

Thanks for your time.

## 参照
* [Singleton pattern - Wikipedia](https://en.wikipedia.org/wiki/Singleton_pattern)
* [...](https://github.com/mistydew/DesignPatterns)
