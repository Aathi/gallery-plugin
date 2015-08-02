
export default Ember.Component.extend({
  classNames: ['social-shares', 'clearfix'],

  facebook: null,
  twitter: null,

  disableFacebookLink: Ember.computed.not('facebook.share'),

  initializeSocials: function() {
    this.setProperties({
      facebook: {},
      twitter: {}
    });
  }.on('init')
});
