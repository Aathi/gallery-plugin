export default Ember.Component.extend({
  url: null,
  parentId: null,

  initializeClappr: function() {
    var url = this.get('url');
    var parentId = this.get('parentId');

    Ember.run.scheduleOnce('afterRender', this, function() {
      new Clappr.Player({
        source: url,
        parentId: '#' + parentId
      });
    })
  }.on('didInsertElement')
})
