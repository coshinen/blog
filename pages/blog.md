---
layout: default
title: blog
permalink: /blog/index.html
excerpt: Welcome to mistydew's blog.
---

<div class="home">
  <h1 class="page-heading">Posts</h1>
  <ul class="post-list">
  <!-- This loops through the site posts for sticky -->
    {% for post in site.posts %}{% if post.stickie == true %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }} [Sticky]</span><span style="float:right;"> 分类：{% for category in post.categories %}<a class="category" href="{{ site.category }}#{{ category }}-ref">{{ category | prepend: " " }}</a>{% endfor %}</span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      <div class="excerpt">
        <p>{{ post.excerpt | strip_html }}</p>
      </div>
      <footer>
        <a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a>
      </footer>
    </li>{% endif %}{% endfor %}
  <!-- This loops through the site posts -->
    {% assign idx = 0 %}{% assign maximum = 7 %}{% for post in site.posts %}{% if post.stickie == true %}{% continue %}{% elsif post.hidden == true %}{% continue %}{% else %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span><span style="float:right;"> 分类：{% for category in post.categories %}<a class="category" href="{{ site.category }}#{{ category }}-ref">{{ category | prepend: " " }}</a>{% endfor %}</span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      <div class="excerpt">
        <p>{{ post.excerpt | strip_html }}</p>
      </div>
      <footer>
        <a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a>
      </footer>
    </li>{% assign idx = idx | plus: 1 %}{% if idx == maximum %}{% break %}{% endif %}{% endif %}{% endfor %}
  </ul>
</div>