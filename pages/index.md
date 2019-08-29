---
layout: default
permalink: /
---

<div class="home-left">
  <h1 class="page-heading">Latest Post</h1>
  <ul class="post-list">
    <!-- This loops through the site posts -->
    {% for post in site.posts %}{% if post.hidden == true %}{% continue %}{% else %}<li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
      <span style="float:right;">分类：{% for category in post.categories %}<a class="category" href="{{ site.category }}#{{ category }}-ref">{{ category | append: " " }}</a>{% endfor %}</span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      <div class="excerpt">
        <p>{{ post.excerpt | strip_html }}</p>
      </div>
      <footer>
        <a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a>
      </footer>
    </li>{% break %}{% endif %}{% endfor %}
  </ul>
  <h2 class="page-heading">Newer Posts</h2>
  <ul class="post-list-more">
    {% assign idx = 0 %}{% assign maximum = 7 %}<!-- This loops through the site posts -->{% for post in site.posts %}{% if post.hidden == true %}{% continue %}{% else %}{% assign idx = idx | plus: 1 %}{% if idx == 1 %}{% continue %}{% endif %}
    <li>
      <span>{{ post.date | date: '%Y年%m月%d日' }} &raquo; </span>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>{% if idx == maximum %}{% break %}{% endif %}{% endif %}{% endfor %}
    <li>
      <footer>
        <a class="readmore" href="{{ site.blog }}">更多内容……</a>
      </footer>
    </li>
  </ul>
</div>
<div class="home-right">
{% include crypto.html %}
</div>