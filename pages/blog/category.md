---
layout: page
title: "类别"
permalink: /blog/category.html
excerpt: Here is the category of my blog posts.
---
<div id="category">
  <h2>目录</h2>
  <ul>{% for category in site.categories %}
    <li><a href="#{{ category[0] }}">{{ category[0] }}</a>（{{ category[1].size }}）</li>{% endfor %}
  </ul>
</div>

{% for category in site.categories %}
<div class="contents">
  <h2 id="{{ category[0] }}">
    {{ category[0] }}（{{ category[1].size }}）
    <a href="#category" class="right">🔝</a>
  </h2>
  <ul>{% for post in category[1] %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>{% endfor %}
  </ul>
</div>
{% endfor %}
