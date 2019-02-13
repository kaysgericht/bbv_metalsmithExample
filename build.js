var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var handlebars = require('handlebars');
var collections = require('metalsmith-collections');
var discoverPartials = require('metalsmith-discover-partials');
var renameme = require('metalsmith-rename');
var permalinks = require('metalsmith-permalinks');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var fs = require('fs');
var moment = require('moment');
var tags = require('metalsmith-tags');
var beautify = require('metalsmith-beautify');
var slug = require('slug-component');



handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/partials/header.hbs').toString());
handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/partials/footer.hbs').toString());
handlebars.registerPartial('posts-list-item', fs.readFileSync(__dirname + '/layouts/partials/posts-list-item.hbs').toString());
handlebars.registerPartial('posts-list-item-noShort', fs.readFileSync(__dirname + '/layouts/partials/posts-list-item-noShort.hbs').toString());

handlebars.registerHelper('shortDate', function (date) {
    return moment(date).utc().format('M/D YYYY');
});


metalsmith(__dirname)
.use(discoverPartials({
  directory: './layouts/partials',
  pattern: /\.hbs$/
}))

  .use(collections({
    posts: {
      pattern: 'posts/**/*.md',
      sortBy: 'date',
      reverse: true
      },
  }))
  /* .use(tags({
    handle  : 'tags', // yaml key for tag list in you pages
    path    : 'posts/tags', // path for result pages
    template: '/blog-tag.hbs', // template to use for tag listing
    sortBy  : 'date', // provide posts sorted by 'date' (optional)
    reverse : true // sort direction (optional)
})) */
  .use(appendMetadata())
  .source('./src')  
  .use(markdown())
  .use(permalinks({
    pattern: ':collection/:date/:title',
    date   : 'YYYY/MM'
  }))
 /*  .use(beautify({
    "css" : false,
    "js"  : false,
    "html": {
        "wrap_line_length": 80
    }
  })) */
  
  /* .use(
    renameme([
      [/\.md$/, ".html"]
    ])
  ) */
  
  .use(layouts())
  .use(serve({
    port: 8081,
    verbose: true
  }))
  .use(watch({
      paths: {
        "${source}/**/*": true,
        "layouts/**/*": "**/*",
      }
    }))
    .destination('./public')
  .clean(true)  
  .build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('TM built!');
    }
  });

  function appendMetadata(config) {
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();

        metadata.posts.forEach(function (_post) {
            var slugVal = slug(_post.title);
            var datePart = moment(_post.date).utc().format('YYYY/MM');
            _post.url = '/posts/' + datePart + '/' + slugVal;
            var contString = _post.contents.toString();
            _post.shortWords = contString.split(' ').slice(0,20).join(' ') + '...';
        });

        done();
    };
};