---
layout: default
permalink: /blog/
---
<div class="home-left">
  <ul class="post-list">
    <li>
      <span class="post-meta"><abbr title="{{ site.posts.first.date | date_to_xmlschema }}">{{ site.posts.first.date | date: "%Y年%m月%d日 %H:%M" }}</abbr>【最新】</span>
      <span class="right">分类：<a class="category" href="{{ site.category }}#{{ site.posts.first.category }}">{{ site.posts.first.category }}</a></span>
      <h2>
        <a class="post-link" href="{{ site.posts.first.url }}">{{ site.posts.first.title | escape }}</a>
      </h2>
      {{ site.posts.first.excerpt }}
      <span><a class="readmore" href="{{ site.posts.first.url }}">阅读全文 &raquo;</a></span>
    </li>
    <h2 class="page-heading">近期文章</h2>{% for post in site.posts offset:1 limit:7 %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日" }}</abbr></span>
      <span class="right">分类：<a class="category" href="{{ site.category }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title | escape }}</a>
      </h2>
      {{ post.excerpt }}
      <span><a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a></span>
    </li>{% endfor %}
  </ul>
</div>

<div class="home-right">
  <div id="category">
    <h2>分类</h2>
    <ul>{% for category in site.categories %}
      <li><a href="{{ site.category }}#{{ category[0] }}">{{ category[0] }}</a>（{{ category[1].size }}）</li>{% endfor %}
    </ul>
  </div>
  <div id="tagcloud">
    <h2>标签</h2>{% assign max = site.tags.first[1].size %}{% assign min = max %}{% for tag in site.tags offset:1 %}{% if tag[1].size > max %}{% assign max = tag[1].size %}{% elsif tag[1].size < min %}{% assign min = tag[1].size %}{% endif %}{% endfor %}{% assign diff = max | minus: min %}{% for tag in site.tags %}{% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}{% assign base = temp | divided_by: 4 %}{% assign remain = temp | modulo: 4 %}{% if remain == 0 %}{% assign size = base | plus: 9 %}{% elsif remain == 1 or remain == 2 %}{% assign size = base | plus: 9 | append: '.5' %}{% else %}{% assign size = base | plus: 10 %}{% endif %}{% if remain == 0 or remain == 1 %}{% assign color = 9 | minus: base %}{% else %}{% assign color = 8 | minus: base %}{% endif %}
    <a href="{{ site.tag }}#{{ tag[0] }}" style="font-size:{{ size }}pt;color:#{{ color }}{{ color }}{{ color }}">{{ tag[0] }}</a>{% endfor %}
  </div>
  <div id="archive">
    <h2 title="{{ site.posts.size }}">归档</h2>
    <ul>{% assign count = 1 %}{% for post in site.posts %}{% assign yearmonth = post.date | date: '%Y年%m月' %}{% assign prevyearmonth = post.previous.date | date: '%Y年%m月' %}{% if yearmonth == prevyearmonth %}{% assign count = count | plus: 1 %}{% else %}
      <li><a href="{{ site.archive }}#{{ yearmonth }}">{{ yearmonth }}</a>（{{ count }}）</li>{% assign count = 1 %}{% endif %}{% endfor %}
    </ul>
  </div>
</div>
