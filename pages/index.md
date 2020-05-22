---
layout: default
permalink: /
---

<div class="home-left">
  <ul class="post-list">{% for post in site.posts limit:1 %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日 %H:%M" }}</abbr></span>
      <span style="float:right;">分类：<a class="category" href="{{ site.category }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      {{ post.excerpt | markdownify | strip_newlines }}
      <span><a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a></span>
    </li>{% endfor %}
  </ul>
  <h2 class="page-heading">最新文章</h2>
  <ul class="post-list-more">{% for post in site.posts offset:1 limit:6 %}
    <li>
      <span><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y年%m月%d日' }}</abbr> &raquo; </span>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>{% endfor %}
    <li><a class="readmore" href="{{ site.blog }}">更多内容……</a></li>
  </ul>
</div>
<div class="home-right">
  <script src='https://www.intensedebate.com/widgets/acctComment/415414/2' defer="defer" type='text/javascript'></script>
  <div id="profile">
    <h2>关于</h2>
    <div>
      <a href="https://github.com/{{ site.root }}" target="_blank"><img class="border" height="128" width="128" alt="@mistydew" src="https://avatars0.githubusercontent.com/u/29818825"></a>
    </div>
    <ul>
      <li>文章：<a href="{{ site.archive }}">{{ site.posts.size }}</a></li>
    </ul>
  </div>
</div>