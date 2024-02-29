import{_ as s,o as a,c as i,a2 as e}from"./chunks/framework.Pt8yDOQY.js";const g=JSON.parse('{"title":"Record Methods","description":"","frontmatter":{},"headers":[],"relativePath":"record-methods.md","filePath":"record-methods.md"}'),t={name:"record-methods.md"},n=e(`<h1 id="record-methods" tabindex="-1">Record Methods <a class="header-anchor" href="#record-methods" aria-label="Permalink to &quot;Record Methods&quot;">​</a></h1><p>A record object is a wrapper around a row of data from a table.</p><p>As per the previous examples, we&#39;ll assume the table definition looks something like this:</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// define the users table and the columns it contains</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> db</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> connect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  database: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;sqlite://test.db&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  tables: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    users: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      columns: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;id name:required email:required&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// fetch the users table</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> users</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> db.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">table</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;users&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// fetch a record from the users table</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> record</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> users.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">oneRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  email: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;bobby@badgerpower.com&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h2 id="update-set" tabindex="-1">update(set) <a class="header-anchor" href="#update-set" aria-label="Permalink to &quot;update(set)&quot;">​</a></h2><p>The <code>update()</code> method allows you to update any columns in the row that the record represents.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> record.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name:  </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Robert Badger, Esq.&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  email: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;robert@badgerpower.com&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>The data will be updated in both the database table row and the record object. Any other changes in the database row (e.g. a <code>modified</code> column that is set to the current timestamp when a record is modified) will also be reflected in the record.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.name);       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Robert Badger, Esq.</span></span></code></pre></div><h2 id="delete" tabindex="-1">delete() <a class="header-anchor" href="#delete" aria-label="Permalink to &quot;delete()&quot;">​</a></h2><p>The <code>delete()</code> method allows you to delete the row in the table represented by the record.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> record.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">delete</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.deleted)     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// true</span></span></code></pre></div><p>After deleting the record the <code>record.deleted</code> flag will be set <code>true</code>. Any attempt to update the record (or delete it again) will throw a <code>DeletedRecordError</code> with a message of the form <code>Cannot update deleted users record #123</code>.</p><h2 id="relation-name" tabindex="-1">relation(name) <a class="header-anchor" href="#relation-name" aria-label="Permalink to &quot;relation(name)&quot;">​</a></h2><p>This method allows you to access relations for a table. Read more on that in the <a href="./relations.html">relations</a> manual page.</p><p>For example, if your <code>users</code> table has a <code>orders</code> relation defined then you can access the related record(s) like so:</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> orders</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> record.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">relation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;orders&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>The Proxy wrapper also allows you to access it more succinctly as:</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> orders</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> record.orders;</span></span></code></pre></div><h2 id="where-next" tabindex="-1">Where Next? <a class="header-anchor" href="#where-next" aria-label="Permalink to &quot;Where Next?&quot;">​</a></h2><p>In the next few section we&#39;ll look at how you can define your own custom <a href="./record-class.html">record class</a> where you can put additional functionality relating to a record.</p>`,21),l=[n];function h(p,r,d,o,k,c){return a(),i("div",null,l)}const y=s(t,[["render",h]]);export{g as __pageData,y as default};
