---
layout: post
title:  "网页爬虫入门"
date:   2018-12-22 20:32:03 +0800
author: Coshin
comments: true
category: 程序人生
tags: Crawler Python Requests BS4
excerpt: 几个简单的网页爬虫示例。
---
## 依赖

> * python-requests
> * python-bs4

## 示例

## 1. 获取网页文本

```python
#!/usr/bin/python3

import requests
from bs4 import BeautifulSoup
import os

def GetHTMLTextPro(url):
    flag = True
    while flag:
        try:
            r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout = 2)
            r.raise_for_status()
            r.encoding = r.apparent_encoding
            flag = False
        except:
            print("Try connecting again")
    return r.text

def DownloadDiaryViaDate(url, title, darg):
    filename = title + ".md"
    if not os.path.exists(filename):
        text = GetHTMLTextPro(url + darg)

        soup = BeautifulSoup(text, 'lxml')
        article = soup.find('div', 'article').text
        diary = title + '\n' + article.strip()
        f = open(filename, "w+", errors = 'ignore')
        f.write(diary)
        f.close()
        print("Download " + filename + ": completed")
    else:
        print("File already exists")

def DownloadDiaryViaMonth(url, month, marg):
    if not os.path.exists(month):
        os.mkdir(month)
    os.chdir(month)

    text = GetHTMLTextPro(url + marg)

    soup = BeautifulSoup(text, 'lxml')
    for tag in soup.find('p').find_all('a'):
        date = tag.attrs['href']
        title = tag.text
        DownloadDiaryViaDate(url, title, date)

    os.chdir("..")
    print("Download " + month + ": completed")

def DownloadDiaryViaYear(url, year, yarg):
    if not os.path.exists(year):
        os.mkdir(year)
    os.chdir(year)

    text = GetHTMLTextPro(url + yarg)

    soup = BeautifulSoup(text, 'lxml')
    tuple = ('Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.')
    for tag in soup.find('div', 'diary-area').find_all('a'):
        if tag.text in tuple:
            month = tag.text
            marg = tag.attrs['href']
            DownloadDiaryViaMonth(url, month, marg)

    os.chdir("..")
    print("Download " + year + ": completed")

def DownloadDiaryViaURL(url):
    path = "~/diary/"
    if not os.path.exists(path):
        os.mkdir(path)
    os.chdir(path)

    text = GetHTMLTextPro(url)

    soup = BeautifulSoup(text, 'lxml')
    tuple = ('2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013')
    for tag in soup.find('div', 'diary-area').find_all('a'):
        if tag.text in tuple:
            year = tag.text
            yarg = tag.attrs['href']
            DownloadDiaryViaYear(url, year, yarg)
    print("Download diary completed!")

if __name__ == "__main__":
    DownloadDiaryViaURL("http://www.garnetcrow.com/diary/")
```

```python
#!/usr/bin/python3

import requests
from bs4 import BeautifulSoup
import os

def DownloadLyricViaId(url, name, id):
    lyricname = name + ".lrc"
    if not os.path.exists(lyricname):
        r = requests.get(url + id, headers = {'User-Agent': 'Mozilla/5.0'})

        soup = BeautifulSoup(r.text, 'lxml')
        for tag in soup.find_all('div'):
            try:
                if 'kashi_area' == tag['id']:
                    lyric = tag.text
            except:
                pass

        f = open(lyricname, 'w+')
        f.write(lyric)
        f.close()
        print("Download " + lyricname + ": completed")
    else:
        print("Lyric already exists")

def DownloadGC167LyricsViaURL(url):
    r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'})

    soup = BeautifulSoup(r.text, 'lxml')

    path = "./lyric/"
    if not os.path.exists(path):
        os.mkdir(path)
    os.chdir(path)

    for tag in soup.find_all('a'):
        songname = tag.text
        id = tag.attrs['href']
        try:
            DownloadLyricViaId(url, songname, id)
        except:
            pass

if __name__ == "__main__":
    DownloadGC167LyricsViaURL("https://www.uta-net.com/artist/344/")
```

## 2. 下载图片

```python
#!/usr/bin/python3

import requests
from bs4 import BeautifulSoup
import os
import re

def GetHTML(url):
    flag = True
    while flag:
        try:
            r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'}, timeout = 2)
            r.raise_for_status()
            r.encoding = r.apparent_encoding
            flag = False
        except:
            print("Try connecting again")
    return r

def DownloadDiscographyVia(url, title, arg):
    filename = title + ".gif"
    if not os.path.exists(filename):
        r = GetHTML(url + arg)
        with open(filename, 'wb') as f:
            f.write(r.content)
            f.close()
            print("Download " + filename + ": completed")
    else:
        print("File already exists")

def DownloadDiscographyViaURL(url):
    path = "./discography/"
    if not os.path.exists(path):
        os.mkdir(path)
    os.chdir(path)

    r = GetHTML(url)
    soup = BeautifulSoup(r.text, 'lxml')
    for tag in soup.find_all('div', 'list-discography'):
        for tags in tag.find_all('a'):
            title = tags.attrs['title']
            pat = re.compile(r'/')
            title = re.sub(pat, '_', title)
            title = title.strip()
            arg = tags.attrs['href']
            DownloadDiscographyVia(url, title, arg)

    print("Download discography completed.")

if __name__ == "__main__":
    DownloadDiscographyViaURL("http://www.garnetcrow.com/discography/")
```

```python
#!/usr/bin/python3

import requests
from bs4 import BeautifulSoup
import os

def DownloadPictureViaURL(url):
    name = url.split('/')[-1]
    if not os.path.exists(name):
        try:
            r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'})
            with open(name, 'wb') as f:
                f.write(r.content)
                f.close()
                print("Download " + name + ": completed")
        except:
            pass
    else:
        print("File already exists")

def DownloadSQZKSUBgcPicture(url):
    r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'})

    soup = BeautifulSoup(r.text, 'lxml')

    path = "./picture/"
    if not os.path.exists(path):
        os.mkdir(path)
    os.chdir(path)

    for tag in soup.find_all('img'):
        print(tag.attrs['src'])
        DownloadPictureViaURL(tag.attrs['src'])

if __name__ == "__main__":
    DownloadSQZKSUBgcPicture("http://www.sqzksub.com/portal.php")
    print("Download completed")
```

## 3. 下载音频

```python
#!/usr/bin/python3

import requests
from bs4 import BeautifulSoup
import os
import re
import time

def DownloadMusicViaURL(songname, url):
    name = songname + ".mp3"
    if not os.path.exists(name):
        r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'})
        with open(name, 'wb') as f:
            f.write(r.content)
            f.close()
            print("Download " + name + ": completed")
    else:
        print("Music already exists")

def DownloadLyricViaURL(songname, url):
    name = songname + ".lrc"
    if not os.path.exists(name):
        r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'})
        with open(name, 'wb') as f:
            f.write(r.content)
            f.close()
            print("Download " + name + ": completed")
    else:
        print("Lyric already exists")

def DownloadSQZKSUBgc2Music(url):
    r = requests.get(url, headers = {'User-Agent': 'Mozilla/5.0'})
    r.encoding = r.apparent_encoding

    soup = BeautifulSoup(r.text, 'lxml')

    path = "./music/"
    if not os.path.exists(path):
        os.mkdir(path)
    os.chdir(path)

    id = 0
    for tag in soup.find_all('song'):
        songname = tag.attrs['label']
        pat = re.compile(r'\?')
        songname = re.sub(pat, "？", songname)
        songname = songname.strip()
        lrcpath = tag.attrs['lrcpath']
        mp3path = tag.attrs['mp3path']

        id += 1
        print("Download music id " + str(id) + " ...")
        DownloadMusicViaURL(songname, mp3path)
        DownloadLyricViaURL(songname, lrcpath)

if __name__ == "__main__":
    DownloadSQZKSUBgc2Music("http://www.sqzksub.com/gc2.xml")
    print("Download completed")
```

## 参考链接

* [Requests: HTTP for Humans™ — Requests 2.25.1 documentation](https://docs.python-requests.org/en/master/index.html){:target="_blank"}
* [Beautiful Soup Documentation — Beautiful Soup 4.4.0 documentation](https://beautiful-soup-4.readthedocs.io/en/latest/){:target="_blank"}
