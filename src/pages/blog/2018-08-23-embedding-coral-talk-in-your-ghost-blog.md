---
title: Embedding Coral Talk in your Ghost Blog
layout: "../../layouts/BlogPost.astro"
pubDate: 2018-08-23T05:50:15.000Z
modDate: 2018-08-23T07:11:34.000Z
---

Today I changed how I embed the Coral Talk comment system in my blog posts. Previously I had downloaded the Casper theme and edited the *post.hbs* file and inserted the Coral embed script. Then I re-uploaded the customized theme and enabled it in the admin panel. This works of course, but also mean you don't get to enjoy any of the new Casper updates for free. Instead you need to regularly re-customize new versions of Casper. So today I decided to be a bit smarter about it and created this little embed script to add to the Ghost footer (via the admin dashboard):

```html    
<script src="https://talk.snorre.io/static/embed.js" async onload="
  var articles = document.getElementsByClassName('post-full post');
  if (articles.length === 1) {
    var coral = document.createElement('div');
    coral.setAttribute('id', 'coral_talk_stream');
    articles[0].appendChild(coral);
    
    Coral.Talk.render(document.getElementById('coral_talk_stream'), {
      talk: 'https://talk.snorre.io/'
    });
  }
  
"></script>
```

*Removed image*

Code Injection Footer settings screen capture
So essentially I now first get all elements in the dom with the class name "post-full post". Only if such an element is found do I create a div to mount Coral in and render Coral. As long as the Casper theme developers don't change the class names for the article element on the post page this script will continue to do its job.

This embed will only work for Ghost themes using the "post-full post" class name the same way Casper does you would need to change the script to fit your needs.

Note that this setup will cause Ghost to load the Coral Talk embed.js source file on the homepage of your Ghost blog, but simply not mount the app. This is acceptable as your user most likely will navigate to one of your posts and have to load the embed.js file anyway.
