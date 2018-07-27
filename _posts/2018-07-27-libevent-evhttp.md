---
layout: post
title:  "libevent evhttp c/s"
date:   2018-07-27 05:12:02 +0800
author: mistydew
categories: libevent
tags: C libevent
---
## 介绍

`Libevent` 提供了一个非常简单的事件驱动的 `HTTP` 服务器，可以嵌入到你的程序中并用来为 `HTTP` 请求提供服务。<br>
要使用此功能，你需要包含 <[event2/http.h](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/http_8h.html)> 头文件到你的程序中。了解更多信息，请查看其头文件。

## 服务器端

1.初始化多线程支持。

{% highlight C++ %}
#ifdef WIN32
    evthread_use_windows_threads();
#else
    evthread_use_threads();
#endif
{% endhighlight %}

2.创建 `event_base` 事件库对象，用于跟踪/监控事件的状态（激活/挂起）。

{% highlight C++ %}
    struct event_base* base = event_base_new();
{% endhighlight %}

3.创建 `evhttp` 对象，用于处理请求。

{% highlight C++ %}
    struct evhttp* http = evhttp_new(base);
{% endhighlight %}

4.设置处理 `HTTP` 请求函数 `http_request_cb`。

{% highlight C++ %}
    evhttp_set_gencb(http, http_request_cb, NULL);
{% endhighlight %}

5.绑定服务地址和端口。

{% highlight C++ %}
    evhttp_bound_socket *bind_handle = evhttp_bind_socket_with_handle(http, rpcallowip, rpcport);
{% endhighlight %}

6.派发（进入） `HTTP` 事件循环。

{% highlight C++ %}
    event_base_dispatch(base);
{% endhighlight %}

## 参照
* [libevent](http://libevent.org)
* [libevent: Main Page](http://www.wangafu.net/~nickm/libevent-2.1/doxygen/html/)
* [...](https://github.com/mistydew)
