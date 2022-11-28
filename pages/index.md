---
layout: default
permalink: /
excerpt: Welcome to my weblog.
---
<div class="home-left">
  <ul class="post-list">{% for post in site.posts limit:10 %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日" }}</abbr></span>
      <span class="right">分类：<a class="category" href="{{ "/category.html" | relative_url }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2><a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h2>
      {{ post.excerpt }}
      <span><a class="readmore" href="{{ post.url | relative_url }}">阅读全文 &raquo;</a></span>
    </li>{% endfor %}
  </ul>
</div>

<div class="home-right">
  <div id="profile">
    <h2>关于</h2>
    <img src="https://avatars0.githubusercontent.com/u/29818825" alt="@{{ site.author.github }}">
    <div><q title="GARNET CROW &quot;le 5 ème anniversaire&quot; L'Histoire de 2000 à 2005 -中村由利">流されていくのは簡単だけれど変わらないでいることっていうのは一番難しい。</q></div>
    <ul>
      <li>
        <svg class="icon">
          <use xlink:href="{{ "/assets/icons/oct.svg#mail" | relative_url }}"></use>
        </svg>
        <a href="mailto:{{ site.author.e-mail }}">{{ site.author.e-mail }}</a>
      </li>
      <li>
        <svg class="icon">
          <use xlink:href="{{ "/assets/icons/oct.svg#key" | relative_url }}"></use>
        </svg>
        <a href="{{ "/pubkey.asc" | relative_url }}" title="PGP fingerprint">EDD222E8860891F6</a>
      </li>
    </ul>
  </div>
  <div id="category">
    <h2 title="{{ site.categories.size }}">分类</h2>
    <ul>{% for category in site.categories %}
      <li><a href="{{ "/category.html" | relative_url }}#{{ category[0] }}">{{ category[0] }}</a>（{{ category[1].size }}）</li>{% endfor %}
    </ul>
  </div>
  <div id="tagcloud">
    <h2 title="{{ site.tags.size }}">标签</h2>{% assign max = site.tags.first[1].size %}{% assign min = max %}{% for tag in site.tags offset:1 %}{% if tag[1].size > max %}{% assign max = tag[1].size %}{% elsif tag[1].size < min %}{% assign min = tag[1].size %}{% endif %}{% endfor %}{% assign diff = max | minus: min %}{% for tag in site.tags %}{% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}{% assign base = temp | divided_by: 4 %}{% assign remain = temp | modulo: 4 %}{% if remain == 0 %}{% assign size = base | plus: 9 %}{% elsif remain == 1 or remain == 2 %}{% assign size = base | plus: 9 | append: '.5' %}{% else %}{% assign size = base | plus: 10 %}{% endif %}{% if remain == 0 or remain == 1 %}{% assign color = 9 | minus: base %}{% else %}{% assign color = 8 | minus: base %}{% endif %}
    <a href="{{ "/tags.html" | relative_url }}#{{ tag[0] }}" style="font-size:{{ size }}pt;color:#{{ color }}{{ color }}{{ color }}">{{ tag[0] }}</a>{% endfor %}
  </div>
  <div id="archive">
    <h2 title="{{ site.posts.size }}">归档</h2>
    <ul>{% assign count = 1 %}{% for post in site.posts %}{% assign yearmonth = post.date | date: '%Y年%m月' %}{% assign prevyearmonth = post.previous.date | date: '%Y年%m月' %}{% if yearmonth == prevyearmonth %}{% assign count = count | plus: 1 %}{% else %}
      <li><a href="{{ "/archive.html" | relative_url }}#{{ yearmonth }}">{{ yearmonth }}</a>（{{ count }}）</li>{% assign count = 1 %}{% endif %}{% endfor %}
    </ul>
  </div>
  <div id="quotes">
    <h2 title="Here are my favorite quotes from someones that inspire me or make me laugh.">引言</h2>
    <ul>
      <li><a href="https://kk.org/thetechnium/103-bits-of-advice-i-wish-i-had-known/" target="_blank"><q title="103 Bits of Advice I Wish I Had Known">Dont keep making the same mistakes; try to make new mistakes.</q><br><span>-Kevin Kelly</span></a></li>
      <li><a href="https://jamesclear.com/why-facts-dont-change-minds" target="_blank"><q title="Why Facts Don't Change Our Minds">Spend as little time as possible talking about how other people are wrong.</q><br><span>-Tyler Cowen</span></a></li>
      <li><a href="http://www.paulgraham.com/hs.html" target="_blank"><q title="What You'll Wish You'd Known">Fouls happen. The thing to do when you get fouled is not to lose your cool. Just keep playing.</q><br><span>-Paul Graham</span></a></li>
      <li><a href="https://lkml.org/lkml/2000/8/25/132" target="_blank"><q title="thread creation is about a thousand times faster than on native Linux">Talk is cheap. Show me the code.</q><br><span>-Linus Torvalds</span></a></li>
      <li><a href="https://www.metzdowd.com/pipermail/cryptography/2008-November/014853.html" target="_blank"><q title="Bitcoin P2P e-cash paper">It's very attractive to the libertarian viewpoint if we can explain it properly. I'm better with code than with words though.</q><br><span>-Satoshi Nakamoto</span></a></li>
      <li><a href="https://www.orwell.ru/library/reviews/dali/english/e_dali" target="_blank"><q title="As I Please 1943-1945, Benefit of Clergy, Some Notes on Salvador Dali">A man who gives a good account of himself is probably lying, since any life when viewed from the inside is simply a series of defeats.</q><br><span>-George Orwell</span></a></li>
    </ul>
  </div>
</div>
