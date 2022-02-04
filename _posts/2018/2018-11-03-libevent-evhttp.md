---
layout: post
title:  "事件驱动的 HTTP 服务器"
date:   2018-11-03 15:32:02 +0800
author: Coshin
comments: true
category: 程序人生
tags: libevent-evhttp C/S
---
Libevent 提供了一个非常简单的事件驱动的 HTTP 服务器，可以嵌入到你的程序中并用来为 HTTP 请求提供服务。
要使用此功能，你需要包含 <[event2/http.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/http_8h.html){:target="_blank"}> 头文件到你的程序中。

## 1. 服务器端

### 1.1. 初始化多线程支持

```cpp
#ifdef WIN32
    evthread_use_windows_threads();
#else
    evthread_use_threads();
#endif
```

### 1.2. 创建 event_base 事件库对象，用于跟踪/监控事件的状态（激活/挂起）

```cpp
    struct event_base* base = event_base_new();
```

### 1.3. 创建 evhttp 对象，用于处理请求

```cpp
    struct evhttp* http = evhttp_new(base);
```

### 1.4. 设置处理 HTTP 请求函数 http_request_cb

```cpp
    evhttp_set_gencb(http, http_request_cb, NULL);
```

### 1.5. 绑定服务地址和端口

```cpp
    evhttp_bound_socket *bind_handle = evhttp_bind_socket_with_handle(http, rpcallowip, rpcport);
```

### 1.6. 事件调度循环

```cpp
    event_base_dispatch(base);
```

## 2. 客户端

### 2.1. 创建 event_base 事件库对象，用于跟踪/监控事件的状态（激活/挂起）

```cpp
    struct event_base *base = event_base_new();
```

### 2.2. 创建并返回用于发出 HTTP 请求的连接对象

```cpp
    struct evhttp_connection *evcon = evhttp_connection_base_new(base, NULL, host.c_str(), port);
```

### 2.3. 创建需要使用请求参数填充的新请求对象

```cpp
    HTTPReply response;
    struct evhttp_request *req = evhttp_request_new(http_request_done, (void*)&response);
```

### 2.4. 获取并填充请求头

```cpp
    struct evkeyvalq *output_headers = evhttp_request_get_output_headers(req);
    evhttp_add_header(output_headers, "Host", host.c_str());
    evhttp_add_header(output_headers, "Connection", "close");
    evhttp_add_header(output_headers, "Authorization", (std::string("Basic ") + EncodeBase64(strRPCUserColonPass)).c_str());
```

### 2.5. 获取并填充请求的内容

```cpp
    struct evbuffer * output_buffer = evhttp_request_get_output_buffer(req);
    evbuffer_add(output_buffer, strRequest.data(), strRequest.size());
```

### 2.6. 通过指定的连接发出 HTTP POST 请求

```cpp
    int r = evhttp_make_request(evcon, req, EVHTTP_REQ_POST, /);
```

### 2.7. 事件调度循环

```cpp
    event_base_dispatch(base);
```

### 2.8. 释放 HTTP 连接和与事件库对象 event_base 关联的所有内存

```cpp
    evhttp_connection_free(evcon);
    event_base_free(base);
```

## 3. Libevent 介绍

Libevent 是一个用于开发可扩展网络服务的事件通知库。
Libevent API 提供了一种机制，用于在文件描述符上发生的特定事件时或达到超时后执行回调函数。
此外，Libevent 还支持由信号或定期超时引起的回调。

Libevent 旨在代替事件驱动的网络服务器中的事件循环。
应用程序只需调用 [event_base_dispatch()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a3b0096ff22ff56eae9cbbda8907183d1){:target="_blank"}，
然后动态地添加或移除事件，而无需更改事件循环。

当前，Libevent 支持 /dev/poll, kqueue(2), select(2), poll(2), epoll(4) 和 evports。
内部事件机制完全独立于公开的事件 API，且 Libevent 的一个简单更新可以提供新功能，而无需重新设计应用程序。
因此，Libevent 允许便携式应用程序开发，并提供操作系统上可用的最可扩展的事件通知机制。
Libevent 也可用于多线程的程序。Libevent 应该在 Linux, *BSD, Mac OS X, Solaris 和 Windows 上编译。

### 3.1. 标准用法

每个使用 Libevent 的程序必须包含 <[event2/event.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html){:target="_blank"}> 头文件，
并把 -levent 标志传递给链接器。（如果你只想要主事件和基于 IO 的缓冲代码，而不想链接任何协议代码，则可以使用链接 -levent_core 代替。）

### 3.2. 库设置

在调用任何其它 Libevent 函数前，你需要设置库。
如果你要在一个多线程的应用程序中从多个线程使用 Libevent，你需要初始化线程支持 -
通常使用 [evthread_use_pthreads()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/thread_8h.html#acc0cc708c566c14f4659331ec12f8a5b){:target="_blank"} 或 [evthread_use_windows_threads()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/thread_8h.html#a1b0fe36dcb033da2c679d39ce8a190e2){:target="_blank"}。
了解更多信息，见 <[event2/thread.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/thread_8h.html){:target="_blank"}>。

这也是你能够使用 event_set_mem_functions 替换 Libevent 的内存管理函数，使用 [event_enable_debug_mode()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a37441a3defac55b5d2513521964b2af5){:target="_blank"} 开启调试模式的地方。

### 3.3. 创建事件库

接下来，你需要使用 [event_base_new()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#af34c025430d445427a2a5661082405c3){:target="_blank"} 或 [event_base_new_with_config()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a925410b1d145c85849882dd220beb9d5){:target="_blank"} 来创建一个 [event_base](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/structevent__base.html){:target="_blank"} 结构。
该 [event_base](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/structevent__base.html){:target="_blank"} 是负责跟踪（即被监控是否被激活） "pending" 和 "active" 的事件。
每个事件都与一个 [event_base](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/structevent__base.html){:target="_blank"} 相关联。

### 3.4. 事件通知

对于每个希望监控的文件描述符，你必须要使用 [event_new()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#ad60bb980e309993205a3880de41e3ec8){:target="_blank"} 创建事件结构。
（你还可以声明一个事件结构并调用 [event_assign()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a71cbaa3e99d66d788985b25c7f53237d){:target="_blank"} 来初始化该结构的成员。）
要开启通知，你需要通过调用 [event_add()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#ab0c85ebe9cf057be1aa17724c701b0c8){:target="_blank"} 把该结构添加到受监控的事件列表中。
只要该事件结构是激活的，它就必须保持分配状态，因此通常应在堆上分配。

### 3.5. 调度事件

最终，你调用 [event_base_dispatch()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a3b0096ff22ff56eae9cbbda8907183d1){:target="_blank"} 来循环和调度事件。
你还可以使用 [event_base_loop()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a76e311cff042dab77125e309315a0617){:target="_blank"} 进行更细粒度的控制。

目前，一次只能有一个线程能调度给定的 [event_base](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/structevent__base.html){:target="_blank"}。
如果想同时在多个线程中运行事件，你也可以拥有一个 [event_base](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/structevent__base.html){:target="_blank"}，该事件可以把工作添加到工作队列。
或者也可以创建多个 [event_base](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/structevent__base.html){:target="_blank"} 对象。

### 3.6. I/O 缓冲区

Libevent 提供了一个在常规事件回调上缓冲的 I/O 抽象。
这种抽象被称为 bufferevent。一个 bufferevent 提供了可自动填充和清空的的输入和输出缓冲区。
缓冲事件的用户不再直接处理 I/O，而是从输入读取并写入输出缓冲区。

一旦通过 [bufferevent_socket_new()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/bufferevent_8h.html#a71181be5ab504e26f866dd3d91494854){:target="_blank"} 初始化，
bufferevent 结构亦可以使用 [bufferevent_enable()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/bufferevent_8h.html#aa8a5dd2436494afd374213b99102265b){:target="_blank"} 和 [bufferevent_disable()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/bufferevent_8h.html#a4f3974def824e73a6861d94cff71e7c6){:target="_blank"} 重复使用。
你也可以调用 [bufferevent_read()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/bufferevent_8h.html#a9e36c54f6b0ea02183998d5a604a00ef){:target="_blank"} 和 [bufferevent_write()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/bufferevent_8h.html#a7873bee379202ca1913ea365b92d2ed1){:target="_blank"}，而非直接读取和写入套接字。

当读取开启时，bufferevent 将尝试从文件描述符读取并调用读取回调。
当输出缓冲区消耗至低于写入低水位（默认为 0）时，则执行写入回调。

了解更多相关信息，查看 <event2/bufferevent*.h>。

### 3.7. 定时器

Libevent 还可以创建在一定时间过期后调用回调的定时器。
evtimer_new() 宏返回一个用于定时器的事件结构。
要激活定时器，调用 evtimer_add()。
可以通过调用 evtimer_del() 停用定时器。
（这些宏是 [event_new()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#ad60bb980e309993205a3880de41e3ec8){:target="_blank"}, [event_add()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#ab0c85ebe9cf057be1aa17724c701b0c8){:target="_blank"}, [event_del()](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html#a8d6f0f479b2b2b5c13854b7efae7b243){:target="_blank"} 的简易包装器；你也可以直接使用它们。）

### 3.8. 异步 DNS 解析

Libevent 提供了一个异步的 DNS 解析器，应该使用这个代替标准的 DNS 解析函数。
查看 <[event2/dns.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/dns_8h.html){:target="_blank"}> 函数了解更多细节。

### 3.9. 事件驱动的 HTTP 服务器

Libevent 提供了一个非常简单的事件驱动的 HTTP 服务器，可以嵌入到你的程序中并用来为 HTTP 请求提供服务。<br>
要使用此功能，你需要包含 <[event2/http.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/http_8h.html){:target="_blank"}> 头文件到你的程序中。

### 3.10. RPC 服务器和客户端的框架

Libevent 提供了一个用于创建 RPC 服务器和客户端的框架。它负责编组（调度）和解组全部数据结构。

### 3.11. API 参考

[event2/event.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/event_8h.html){:target="_blank"} libevent 主要的头文件

[event2/thread.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/thread_8h.html){:target="_blank"} 多线程程序使用的函数

[event2/buffer.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/buffer_8h.html){:target="_blank"} 和 [event2/bufferevent.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/bufferevent_8h.html){:target="_blank"} 用于网络读写的缓冲区管理

[event2/util.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/util_8h.html){:target="_blank"} 用于可移植非阻塞网络代码的实用函数

[event2/dns.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/dns_8h.html){:target="_blank"} 异步 DNS 解析

[event2/http.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/http_8h.html){:target="_blank"} 嵌入式基于 libevent 的 HTTP 服务器

[event2/rpc.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/rpc_8h.html){:target="_blank"} 用于创建 RPC 服务器和客户端的框架

## 参考链接

* [libevent](http://libevent.org){:target="_blank"}
* [libevent: Main Page](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/){:target="_blank"}
