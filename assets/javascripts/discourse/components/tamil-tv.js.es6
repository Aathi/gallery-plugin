var isBlank = Ember.isBlank;

export default Ember.Component.extend({
  classNames: ['primary-tv'],
  attributeBindings: ['data-video-url'],
  'data-video-url': Ember.computed.oneWay('url'),

  url: null,
  post: null,
  autoPlay: true,

  clapprParentId: function() {
    return `clappr-${this.elementId}`;
  }.property('elementId'),

  initializeClappr: function() {
    var url = this.get('url');

    Ember.run.scheduleOnce('afterRender', this, function() {
      var playerElement = this.$(`#${this.get('clapprParentId')}`);
      var player = new Clappr.Player({
        source: 'http://tv-streamer-lon-01.orutv.com/broadcast.m3u8',
        // plugins: { playback: [P2PHLS], container: [P2PHLSStats] },
        plugins: { playback: [P2PHLS] },
        width: '100%',
        height: 500,
        autoPlay: this.get('autoPlay')
      });

      player.attachTo(playerElement);
      p.core.containers[0].getPlugin('p2phlsstats').show();
    });
  }.on('didInsertElement'),

  urlDidChange: function() {
    this.rerender();
  }.observes('url')
})
