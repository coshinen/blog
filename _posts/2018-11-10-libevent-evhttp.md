---
layout: post
title:  "libevent evhttp c/s"
date:   2018-11-10 15:32:02 +0800
author: mistydew
comments: true
categories: Libevent
tags: C/C++ libevent evhttp
excerpt: Libevent 提供了一个非常简单的事件驱动的 HTTP 服务器，可以嵌入到你的程序中并用来为 HTTP 请求提供服务。
---
## 介绍

Libevent 提供了一个非常简单的事件驱动的 HTTP 服务器，可以嵌入到你的程序中并用来为 HTTP 请求提供服务。
要使用此功能，你需要包含 <[event2/http.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/http_8h.html){:target="_blank"}> 头文件到你的程序中。了解更多信息，请查看其头文件。

## 服务器端

1.初始化多线程支持。

```cpp
#ifdef WIN32
    evthread_use_windows_threads();
#else
    evthread_use_threads();
#endif
```

2.创建 event_base 事件库对象，用于跟踪/监控事件的状态（激活/挂起）。

```cpp
    struct event_base* base = event_base_new();
```

3.创建 evhttp 对象，用于处理请求。

```cpp
    struct evhttp* http = evhttp_new(base);
```

4.设置处理 HTTP 请求函数 http_request_cb。

```cpp
    evhttp_set_gencb(http, http_request_cb, NULL);
```

5.绑定服务地址和端口。

```cpp
    evhttp_bound_socket *bind_handle = evhttp_bind_socket_with_handle(http, rpcallowip, rpcport);
```

6.事件调度循环。

```cpp
    event_base_dispatch(base);
```

## 客户端

1.创建 event_base 事件库对象，用于跟踪/监控事件的状态（激活/挂起）。

```cpp
    struct event_base *base = event_base_new();
```

2.创建并返回用于发出 HTTP 请求的连接对象。

```cpp
    struct evhttp_connection *evcon = evhttp_connection_base_new(base, NULL, host.c_str(), port);
```

3.创建需要使用请求参数填充的新请求对象。

```cpp
    HTTPReply response;
    struct evhttp_request *req = evhttp_request_new(http_request_done, (void*)&response);
```

4.获取并填充请求头。

```cpp
    struct evkeyvalq *output_headers = evhttp_request_get_output_headers(req);
    evhttp_add_header(output_headers, "Host", host.c_str());
    evhttp_add_header(output_headers, "Connection", "close");
    evhttp_add_header(output_headers, "Authorization", (std::string("Basic ") + EncodeBase64(strRPCUserColonPass)).c_str());
```

5.获取并填充请求的内容。

```cpp
    struct evbuffer * output_buffer = evhttp_request_get_output_buffer(req);
    evbuffer_add(output_buffer, strRequest.data(), strRequest.size());
```

6.通过指定的连接发出 HTTP POST 请求。

```cpp
    int r = evhttp_make_request(evcon, req, EVHTTP_REQ_POST, /);
```

7.事件调度循环。

```cpp
    event_base_dispatch(base);
```

8.释放 HTTP 连接和与事件库对象 event_base 关联的所有内存。

```cpp
    evhttp_connection_free(evcon);
    event_base_free(base);
```

## 参考链接

* [libevent](http://libevent.org){:target="_blank"}
* [libevent: Main Page](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/){:target="_blank"}
