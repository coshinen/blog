---
layout: default
permalink: /
---

<div class="home-left">
  <ul class="post-list">
    <!-- This loops through the site posts -->{% for post in site.posts %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日 %H:%M" }}</abbr></span>
      <span style="float:right;">分类：<a class="category" href="{{ site.category }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      <div class="excerpt">
        {{ post.excerpt | markdownify }}
      </div>
      <span><a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a></span>
    </li>{% break %}{% endfor %}
  </ul>
  <h2 class="page-heading">最新文章</h2>
  <ul class="post-list-more">
    <!-- This loops through the site posts -->{% assign idx = 0 %}{% assign maximum = 7 %}{% for post in site.posts %}{% assign idx = idx | plus: 1 %}{% if idx == 1 %}{% continue %}{% endif %}
    <li>
      <span><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y年%m月%d日' }}</abbr> &raquo; </span>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>{% if idx == maximum %}{% break %}{% endif %}{% endfor %}
    <li><a class="readmore" href="{{ site.blog }}">更多内容……</a></li>
  </ul>
</div>
<div class="home-right">
  <script src='https://www.intensedebate.com/widgets/acctComment/{{ site.site_id }}/2' defer="defer" type='text/javascript'> </script>
  <blockquote>
    <h2>关于</h2>
    <div>
      <a href="https://github.com/{{ site.root }}" target="_blank"><img class="border" height="128" width="128" alt="@mistydew" src="https://avatars0.githubusercontent.com/u/29818825"></a>
    </div>
    <ul>{% assign count = 0 %}{% for post in site.posts %}{% assign count = count | plus: 1 %}{% endfor %}
      <li>文章：<a href="{{ site.archive }}">{{ count }}</a></li>
    </ul>
  </blockquote>
</div>