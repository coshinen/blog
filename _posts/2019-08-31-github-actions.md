---
layout: post
title:  "GitHub Actions workflows CI 入门"
date:   2019-08-31 22:56:58 +0800
author: mistydew
comments: true
categories: Git/GitHub CI/CD
tags: Git/GitHub CI/CD
---
GitHub Actions 使自动化所有的软件工作流变得简单，现在使用世界级的 CI/CD。
从 GitHub 构建，测试，和部署代码。
以你想要的方式进行代码审查，分支管理，和问题修复工作。

持续集成 CI（Continuous Integration）是指软件开发过程中，进行的一系列自动化测试，以发现错误来提高开发的速度，该过程属于敏捷开发。
持续部署 CD（Continuous Deployment）是指代码的部署上线，例如：GitHub Pages。
这里的持续（Continuous）表示代码的每次更新都会自动执行相应的行为-集成、部署等。

## 1. 定义工作流的名称

以 C/C++ 项目为例：

{% highlight yml %}
name: C/C++ CI ## name 定义工作流的名称，这里表示这是一个 C/C++ 项目的 CI 工作流
{% endhighlight %}

## 2. 控制工作流的触发时机

{% highlight yml %}
on: [push] ## on 定义工作流的触发条件，这里表示在每次 git push 操作后自动触发该项目的工作流
{% endhighlight %}

可以让工作流在 master 和 release 分支的 push 事件上运行：

{% highlight yml %}
on:
  push:
    branches:
    - master
    - release/*
{% endhighlight %}

或在只以 master 分支为目标的 pull_request 上运行：

{% highlight yml %}
on:
  pull_request:
    branches:
    - master
{% endhighlight %}

或者设置定时运行计划，从每周一到周五在每天的 02:00 运行：

{% highlight yml %}
on:
  schedule:
  - cron: 0 2 * * 1-5
{% endhighlight %}

## 3. 在不同的操作系统上运行

GitHub Actions 提供 Linux、Windows 和 macOS 来构建运行。
要更改操作系统只需指定一个不同的虚拟机：

{% highlight yml %}
jobs:
  build:

    runs-on: ubuntu-latest # runs-on 定义运行操作系统的类型，这里指定的是 ubuntu 最新版本
{% endhighlight %}

可用的虚拟机类型如下：

> * ubuntu-latest, ubuntu-18.04, or ubuntu-16.04
> * windows-latest, windows-2019, or windows-2016
> * macOS-latest or macOS-10.14

## 4. 设置运行命令的步骤

每个 jobs 都在 runs-on 指定的一个虚拟环境新实例中运行。

{% highlight yml %}
jobs:
  build:
    
    steps:
    - uses: actions/checkout@v1
    - name: make # 定义运行命令的名称
      run: make # run 设置要执行的命令，这里使用 Makefile 来构建项目
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

## 6. 该配置文件的默认路径

每个工作流必须使用 YAML 写入一个 .yml 扩展名的文件中。

> .github/workflows/xxx.yml

GitHub Actions 目前处于测试阶段，需要提前注册 beta 版待官方开启后才能使用。

## 参照

* [GitHub Actions now supports CI/CD, free for public repositories](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd){:target="_blank"}
* [Features • GitHub Actions](https://github.com/features/actions){:target="_blank"}
* [actions/starter-workflows: Accelerating new GitHub Actions workflows](https://github.com/actions/starter-workflows){:target="_blank"}
* [Workflow syntax for GitHub Actions - GitHub Help](https://help.github.com/en/articles/workflow-syntax-for-github-actions){:target="_blank"}
* [Events that trigger workflows - GitHub Help](https://help.github.com/en/articles/events-that-trigger-workflows){:target="_blank"}
* [Virtual environments for GitHub Actions - GitHub Help](https://help.github.com/en/articles/virtual-environments-for-github-actions){:target="_blank"}
