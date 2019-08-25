---
layout: default
title: mistydew's blog
permalink: /blog/
excerpt: Welcome to mistydew's blog!
---

<div class="home-left">
  <h1 class="page-heading">Posts</h1>
  <ul class="post-list">
  <!-- This loops through the site posts for sticky -->
{% for post in site.posts %}{% if post.stickie == true %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }} [Sticky]</span>
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
    </li>
{% endif %}{% endfor %}
  <!-- This loops through the site posts -->
{% assign idx = 0 %}{% assign maximum = 7 %}{% for post in site.posts %}{% if post.stickie == true %}{% continue %}{% elsif post.hidden == true %}{% continue %}{% else %}
    <li>
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
    </li>
{% assign idx = idx | plus: 1 %}{% if idx == maximum %}{% break %}{% endif %}{% endif %}{% endfor %}
  </ul>
</div>
<div class="home-right">
  <script src='https://www.intensedebate.com/widgets/acctComment/412180/10' defer="defer" type='text/javascript'> </script>
  <blockquote class="bio">
    <h2><a href="{{ site.about }}">mistydew</a></h2>
    <div>
      <a href="https://github.com/{{ site.github }}" target="_blank"><img class="border" height="128" width="128" alt="@mistydew" src="https://avatars0.githubusercontent.com/u/29818825"></a>
    </div>
    {% assign count = 0 %}
    {% for post in site.posts %}
      {% assign count = count | plus: 1 %}
    {% endfor %}
    <ul>
      <li>posts: <a href="{{ site.archive }}">{{ count }}</a></li>
      <li>bio: blockchain developer</li>
      <li>gpg key: <a href="{{ site.pgpkey }}">here</a></li>
      <li>fingerprint: {{ site.fingerprint }}</li>
    </ul>
  </blockquote>
  <script type='text/javascript' defer='defer' src='https://www.intensedebate.com/widgets/blogStats/412180'></script>
</div>