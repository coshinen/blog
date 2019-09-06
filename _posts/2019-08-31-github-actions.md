---
layout: post
title:  "GitHub Actions workflows CI 入门"
date:   2019-08-31 22:56:58 +0800
author: mistydew
comments: true
categories: Git/GitHub CI/CD
tags: Git/GitHub CI/CD
---
持续集成 CI（Continuous Integration）是指软件开发过程中，进行的一系列自动化测试。
持续部署 CD（Continuous Deployment）是指项目的部署上线，比如：GitHub Pages，每次提交之后，都会自动进行部署。
CI、CD 都属于敏捷开发。

GitHub Actions 可以自动化 GitHub 上托管项目的工作流，从而实现 GitHub 对代码的托管、测试和部署一体化。
目前 GitHub 上较为流行的持续集成服务是 Travis CI，可能会被 GitHub Actions workflows CI 取代。

GitHub Actions 目前处于测试阶段，需要提前注册 beta 版待官方开启后才能使用。

下面以 C/C++ 项目为例，对其 GitHub Actions 工作流进行基本的设置。

## 1. 定义工作流的名称

name 定义工作流的名称，对该工作流要完成的任务进行简单的描述。

{% highlight yml %}
name: C/C++ CI ## 表示这是一个 C/C++ 项目的 CI 工作流
{% endhighlight %}

## 2. 控制工作流的触发时机

on 设置工作流的触发条件，一般指定为 push，表示在每次 git push 操作后自动触发该项目的工作流。

{% highlight yml %}
on: [push]
{% endhighlight %}

可以让工作流在 master 和 release 分支的 push 事件上运行：

{% highlight yml %}
on:
  push:
    branches:
    - master
    - release/*
{% endhighlight %}

或只在 master 分支的 pull_request 事件上运行：

{% highlight yml %}
on:
  pull_request:
    branches:
    - master
{% endhighlight %}

也可以设置定时运行计划，在周一到周五每天的 02:00 运行：

{% highlight yml %}
on:
  schedule:
  - cron: 0 2 * * 1-5
{% endhighlight %}

## 3. 在不同的操作系统上运行

GitHub Actions 提供 Linux、Windows 和 macOS 来构建运行。
更换操作系统只需指定一个不同的虚拟机：

runs-on 指定运行所在操作系统的类型。

{% highlight yml %}
jobs:
  build:

    runs-on: ubuntu-latest # 表示该工作流将在 ubuntu 的最新版本上运行
{% endhighlight %}

可用的虚拟机类型如下：

> * ubuntu-latest, ubuntu-18.04, or ubuntu-16.04
> * windows-latest, windows-2019, or windows-2016
> * macOS-latest or macOS-10.14

## 4. 设置运行命令的步骤

每个 jobs 都在 runs-on 指定的一个虚拟环境新实例中运行。

steps 用于设置工作流的运行步骤，即在终端中执行的 shell 命令。
run 设置要执行的命令。

{% highlight yml %}
jobs:
  build:
    
    steps:
    - uses: actions/checkout@v1
    - name: make # 定义命令的名称
      run: make # 使用 Makefile 来构建项目
    - name: ...
      run: ...
{% endhighlight %}

## 5. 一个 C/C++ 项目的工作流模版

{% highlight yml %}
name: C/C++ CI

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v1
    - name: configure
      run: ./configure
    - name: make
      run: make
    - name: make check
      run: make check
    - name: make distcheck
      run: make distcheck
{% endhighlight %}

## 6. 工作流配置文件的默认路径

每个工作流必须使用 YAML 写入一个扩展名为 .yml 的文件中。
文件名一般定义为项目主要使用的语言名称。
比如 c-cpp.yml，默认路径如下：

> .github/workflows/c-cpp.yml

## 参照

* [GitHub Actions now supports CI/CD, free for public repositories](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd){:target="_blank"}
* [Features • GitHub Actions](https://github.com/features/actions){:target="_blank"}
* [actions/starter-workflows: Accelerating new GitHub Actions workflows](https://github.com/actions/starter-workflows){:target="_blank"}
* [Workflow syntax for GitHub Actions - GitHub Help](https://help.github.com/en/articles/workflow-syntax-for-github-actions){:target="_blank"}
* [Events that trigger workflows - GitHub Help](https://help.github.com/en/articles/events-that-trigger-workflows){:target="_blank"}
* [Virtual environments for GitHub Actions - GitHub Help](https://help.github.com/en/articles/virtual-environments-for-github-actions){:target="_blank"}
