---
layout: default
title: mistydew's blog
permalink: /blog/
excerpt: Welcome to mistydew's blog!
---

<div class="home-left">
  <h1 class="page-heading">Posts</h1>
  <ul class="post-list">
    <!-- This loops through the site posts for sticky -->{% for post in site.posts %}{% if post.stickie == true %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }} [Sticky]</span>
      <span style="float:right;">分类：{% for category in post.categories %}<a class="category" href="{{ site.category }}#{{ category }}-ref">{{ category | append: " " }}</a>{% endfor %}</span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      <div class="excerpt">
        <p>{{ post.excerpt | markdownify }}</p>
      </div>
      <footer>
        <a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a>
      </footer>
    </li>{% endif %}{% endfor %}
    <!-- This loops through the site posts -->{% assign idx = 0 %}{% assign maximum = 7 %}{% for post in site.posts %}{% if post.stickie == true %}{% continue %}{% else %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
      <span style="float:right;">分类：{% for category in post.categories %}<a class="category" href="{{ site.category }}#{{ category }}-ref">{{ category | append: " " }}</a>{% endfor %}</span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      <div class="excerpt">
        <p>{{ post.excerpt | markdownify }}</p>
      </div>
      <footer>
        <a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a>
      </footer>
    </li>{% assign idx = idx | plus: 1 %}{% if idx == maximum %}{% break %}{% endif %}{% endif %}{% endfor %}
  </ul>
</div>
<div class="home-right">
  <script src='https://www.intensedebate.com/widgets/acctComment/{{ site.site_id }}/4' defer="defer" type='text/javascript'> </script>
  <blockquote class="profile">
    <h2><a href="{{ site.about }}" title="{{ site.name }}">mistydew</a></h2>
    <div>
      <a href="https://github.com/{{ site.github }}" target="_blank"><img class="border" height="128" width="128" alt="@mistydew" src="/assets/images/avatar/29818825.png"></a>
    </div>
    <ul>{% assign count = 0 %}{% for post in site.posts %}{% assign count = count | plus: 1 %}{% endfor %}
      <li>posts: <a href="{{ site.archive }}">{{ count }}</a></li>
      <li>bio: {{ site.bio }}</li>
    </ul>
    <details>
    <summary>Visitor Globe</summary>
      <script type="text/javascript" id="clstr_globe" src="//cdn.clustrmaps.com/globe.js?d=JrjIqzcv6nkydvFOGDo8JSZsX3CYQGHu4lRaijCeLnI"></script>
    </details>
  </blockquote>
  <script type='text/javascript' defer='defer' src='https://www.intensedebate.com/widgets/blogStats/{{ site.site_id }}'></script>
</div>