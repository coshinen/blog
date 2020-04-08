---
layout: post
title:  "设计模式之单例模式"
date:   2018-11-24 21:31:55 +0800
author: mistydew
comments: true
category: 设计模式
tags: DP C/C++
---
单例模式是一种软件设计模式，它限制类的实例化为一个对象。

## 特性

1. 不可复制，确保单例类只存在一个实例。
2. 提供全局访问该实例的方法。

## 实现方法

0. 声明该类的默认构造函数为私有，防止在类外实例化。
1. 使用 static 关键字保证只实例化一次。
2. 提供一个静态方法，返回对实例的引用。

**注：该实例通常存储私有静态变量，在首次调用静态方法前创建实例。**

基础类图：

![singleton](https://mistydew.github.io/assets/images/designpatterns/singleton.svg)

## 基础实现

```cpp
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
```

## 比特币中单例类的实现

```cpp
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
```

参考 bitcoin v0.12.1 源码中的类 [LockedPageManager](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/support/pagelocker.h){:target="_blank"} 的实现。

## 参考链接

* [Singleton pattern - Wikipedia](https://en.wikipedia.org/wiki/Singleton_pattern){:target="_blank"}
* [bitcoin/bitcoin at v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1){:target="_blank"}
