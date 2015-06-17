var isEmpty = Ember.isEmpty;

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['gallery-topic-item'],
  attributeBindings: ['data-video-url'],
  'data-video-url': Ember.computed.oneWay('_clapprUrl'),

  topic: null,

  _clapprUrl: null,
  _post: null,

  clapprParentId: function() {
    return `clappr-${this.elementId}`;
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
      }
    }.bind(this));
  }.on('didInsertElement'),

  initializeClappr: function(url) {
    Ember.run.scheduleOnce('afterRender', this, function() {
      new Clappr.Player({
        source: url,
        parentId: `#${this.get('clapprParentId')}`,
        width: 256,
        height: 225
      });
    });
  },//.on('didInsertElement')

  actions: {
    playInTV() {
      debugger;
      var body = $('html, body');
      body.animate({scrollTop:0}, '100', 'swing');

      this.sendAction('action', this.get('_clapprUrl'), this.get('_post'));
    }
  }
});
