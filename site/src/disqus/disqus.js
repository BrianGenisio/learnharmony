// Based on this: https://gist.github.com/danlucraft/6448537

class Disqus {
  constructor(shortname, baseUrl) {
    this.shortname = shortname;
    this.baseUrl = baseUrl;
    this.loaded = false;
  }

  reload(pageName, title, debug) {
    var identifier = pageName;
    var url = 'http://learnharmony.org/#' + pageName;

    if (this.loaded) {
      return this.resetDisqus(identifier, url, title);
    } 

    var body = `var disqus_shortname = "${this.shortname}"; var disqus_title = "${title}"; var disqus_identifier = "${identifier}"; var disqus_url = "${url}";`;

    if (debug) {
      body +=  "var disqus_developer  = 1;";
    }

    this.appendScriptTagWithBody(body);             
    this.loadDisqus();
           
    this.loaded = true;
  }

  // This code comes from Disqus
  loadDisqus() {
    var dsq = document.createElement('script'); 
    dsq.type = 'text/javascript'; 
    dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  }

  resetDisqus(identifier, url, title) {
    DISQUS.reset({
      reload: true,
      config: function () {  
        this.page.identifier = identifier;
        this.page.url        = url;
        this.page.title      = title;
      }
    });
  }

  appendScriptTagWithBody(body) {
    var dso   = document.createElement("script");
    dso.type  = "text/javascript";
    dso.async = true;
    dso.text  = body;
    document.getElementsByTagName('body')[0].appendChild(dso);
  }
}

export default Disqus;