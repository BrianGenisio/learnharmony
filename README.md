# LearnHarmony.org

This is the code for the website [LearnHarmony.org](http://LearnHarmony.org).  It is a static site with a custom Markdown/FrontMatter build step.  Everything has been written using ES6 modules.  I deploy the site to GitHub Pages using `npm run publish` command, which uses webpack sends it to the `docs` folder.  

# Running

If you want to run the site locally, just do the following:

```js
npm install
npm start
```

That will watch for changes and rebuild the static assets.  It will also start a local server for you to point your browser at and test with.

# Building Content
If you change anything in the `content` folder, you need to re-build the content using `npm run content`

# Contributing

Yes, I happily take contributions.  Please make sure that running `start and build` comes out without errors.  There are no unit tests right now, but there may be in the future.  This project is hooked up to [Travis CI](https://travis-ci.org/BrianGenisio/learnharmony) but it will not automatically deploy.

# Want to chat?

There is a chat room set up.  There isn't a lot of activity there, but if you join and write a message, I'll get notified.

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/BrianGenisio/learnharmony?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
