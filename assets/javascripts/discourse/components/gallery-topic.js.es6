let isEmpty = Ember.isEmpty;

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['gallery-topic-item-container'],
  attributeBindings: ['data-video-url'],
  'data-video-url': Ember.computed.oneWay('_clapprUrl'),

  topic: null,

  _clapprUrl: null,
  _ytUrl: null,
  _post: null,

  videoParentId: function() {
    return `gallery-${this.elementId}`;
  }.property('elementId'),

// This will be removed, once fixed at api
  fetchTopicDetails: function() {
    const topicId = this.get('topic.id');

    Discourse.ajax(`/t/${topicId}.json`).then(function(json) {
      let posts = json.post_stream.posts;
      if(!isEmpty(posts)) {
        let post = posts[0];

        if(!isEmpty(post.link_counts)) {
          let url = post.link_counts[0].url;
          if(url.split('.').pop() === 'mp4') {
            this.setProperties({
              _clapprUrl: url,
              _post: post
            });
            this.initializeClappr(url);
          }
        }

        if(post.cooked.indexOf('data-youtube-id') !== -1) {
          this.initializeYT(post.cooked);
        }
      }
    }.bind(this));
  }.on('didInsertElement'),

  initializeClappr(url) {
    Ember.run.scheduleOnce('afterRender', this, function() {
      new Clappr.Player({
        source: url,
        parentId: `#${this.get('videoParentId')}`,
        width: 256,
        height: 225
      });
    });
  },//.on('didInsertElement')

  initializeYT(cooked) {
    let $cooked = $(cooked);
    let filteredYT = $cooked.filter('.lazyYT');

    this.set('_ytUrl', filteredYT.prop('outerHTML'));

    filteredYT = filteredYT.attr({
      'data-width': '256',
      'data-height': '225'
    });

    let lazyYTContainer = $(`#${this.get('videoParentId')}`).append(filteredYT);
    let lazyYT = $('.lazyYT', lazyYTContainer);
    lazyYT.lazyYT();
  },

  actions: {
    playInTV() {
      let body = $('html, body');
      let videoUrl = this.get('_ytUrl') || this.get('_clapprUrl');
      body.animate({scrollTop:0}, '100', 'swing');

      this.sendAction('action', {
        url: videoUrl,
        isYTVideo: !Ember.isBlank(this.get('_ytUrl')),
        post: this.get('_post'),
        topic: this.get('topic')
      });
    }
  }
});
