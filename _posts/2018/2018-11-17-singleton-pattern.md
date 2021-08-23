---
layout: post
title:  "单例设计模式"
date:   2018-11-17 21:31:55 +0800
author: Coshin
comments: true
category: 程序人生
tags: Design-Patterns C++ GC
---
单例模式属于创建型模式，限制类只能实例化一个对象。

## 特性

1. 不可复制，确保单例类只存在一个实例。
2. 提供全局访问该实例的方法。

## 实现方法

1. 声明该类的默认构造函数为私有，防止在类外实例化。
2. 使用 static 关键字保证只实例化一次。
3. 提供一个静态方法，返回对实例的引用。

基础类图：

![singleton](https://www.plantuml.com/plantuml/svg/JOwnoi90383tF4Mcd_QNmWrEJdNit2Suqr23rrGkAOAbx-uXg1s_vFj2MlEOVPaI6CN4U0m17pBu5UmcUeyvJaWfcftTirmMvuvcxUN96E2zm5vqJEophe2ubdikj65Zdp6UVif_KPelLVM-E8pidHPIughULt-mGSiwb3TV)

## 实现一（饱/懒汉式 + 栈空间/自动销毁 + 非线程安全）

```cpp
class Singleton
{
public:
    static Singleton & getInstance()
    {
        if (_pInstance == NULL) {
            static Singleton instance;
            Singleton::_pInstance = &instance;
        }
        return *_pInstance;
    }
private:
    Singleton(){}

    static Singleton* _pInstance;
};

Singleton* Singleton::_pInstance = NULL;
```

## 实现二（饱/懒汉式 + 堆空间/手动销毁 + 非线程安全）

```cpp
class Singleton
{
public:
    static Singleton & getInstance()
    {
        if (_pInstance == NULL)
            _pInstance = new Singleton;
        return _pInstance;
    }

    static void destroy()
    {
        if (_pInstance) {
            delete _pInstance;
            _pInstance = NULL;
        }
    }
private:
    Singleton(){}

    static Singleton* _pInstance;
};

Singleton* Singleton::_pInstance = NULL;
```

## 实现三（饱/懒汉式 + 栈空间/自动销毁 + 使用 boost:call_once 保证线程安全）

```cpp
class Singleton
{
public:
    static Singleton& getInstance()
    {
        // boost::call_once 注册的函数只执行一次，可用于以线程安全的方式初始化数据。
        // 比特币 v0.12.1 中的 LockedPageManager 类也是采用这样的方式实现的。
        boost:call_once(Singleton::createInstance, Singleton::_init_flag);
        return *_pInstance;
    }

private:
    Singleton(){}

    static void createInstance()
    {
        // 使用本地静态实例保证在第一次需要对象时初始化该对象，
        // 并且在使用该对象的所有对象都用完后取消其初始化。
        static Singleton instance;
        Singleton::_pInstance = &instance;
    }

    static Singleton* _pInstance;
    static boost::once_flag _init_flag;
};

Singleton* Singleton::_pInstance = NULL;
boost::once_flag Singleton::_init_flag = BOOST_ONCE_INIT;
```

## 实现四（饿汉式 + 栈空间/自动销毁 + 非线程安全）

```cpp
class Singleton
{
public:
    static Singleton& getInstance()
    {
        return _instance;
    }
private:
    Singleton(){}

    static Singleton _instance;
};
```

## 实现五（饿汉式 + 堆空间/GC 自动销毁 + 线程安全）

```cpp
class Singleton
{
public:
    static Singleton * getInstance()
    {
        if (_pInstance == NULL)
            _pInstance = new Singleton();
        return _pInstance;
    }
private:
    Singleton(){}

    // 利用栈对象在程序出口自动销毁的特性，
    // 把回收堆空间的操作放进栈对象类的析构函数中。
    class GC
    {
    public:
        GC(){}

        ~GC()
        {
            if (_pInstance) {
                delete _pInstance;
                _pInstance = NULL;
            }
        }
    };

    static Singleton* _pInstance;
    static GC _gc;
};

//Singleton * Singleton::_pInstance = NULL; // 饱/懒汉式，无法保证多线程安全
Singleton * Singleton::_pInstance = getInstance(); // 饿汉式，可保证多线程安全
Singleton::GC Singleton::_gc;
```

## 实现六（饿汉式 + 堆空间/atexit 自动销毁 + 线程安全）

```cpp
class Singleton
{
public:
    static Singleton * getInstance()
    {
        if (_pInstance == NULL) {
            // atexit 注册清理函数，在程序退出时自动调用。
            ::atexit(destory);
            _pInstance = new Singleton();
        }
        return _pInstance;
    }

private:
    Singleton(){}

    static void destory() // 清理（回收堆空间）函数，静态成员函数内部只能直接调用静态成员
    {
        if (_pInstance) {
            delete _pInstance;
        }
    }

    static Singleton * _pInstance;
};

Singleton * Singleton::_pInstance = getInstance(); // 饿汉式，可保证多线程安全
```

## 实现七（饿汉式 + 堆空间/atexit 自动销毁 + 使用 pthread_once 保证线程安全）

```cpp
class Singleton
{
public:
    static Singleton* getInstance()
    {
        // pthread_once（Linux 独有的 POSIX 线程库）注册的函数只执行一次，注册创建单例对象函数。
        ::pthread_once(&_once_control, init);
        return _pInstance;
    }

private:
    Singleton(){}

    static void init()
    {
        _pInstance = new Singleton();
        ::atexit(destory);
    }

    static void destory()
    {
        if (_pInstance) {
            delete _pInstance;
            _pInstance = NULL;
        }
    }

    static Singleton* _pInstance;
    static pthread_once_t _once_control;
};

//Singleton * Singleton::_pInstance = NULL; // 饱/懒汉式（和饿汉式均能保证线程安全）
Singleton * Singleton::_pInstance = getInstance(); // 饿汉式
pthread_once_t Singleton::_once_control = PTHREAD_ONCE_INIT;
```

## 参考链接

* [Function boost::call_once - 1.32.0](https://www.boost.org/doc/libs/1_32_0/doc/html/call_once.html){:target="_blank"}
* [src/support/pagelocker.h at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/support/pagelocker.h){:target="_blank"}
* [src/support/pagelocker.cpp at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/support/pagelocker.cpp){:target="_blank"}
