const computed = Ember.computed;

export default Ember.Component.extend({
  topicGroup: null,

  maxTopicsCount: 8,
  'on-topic-click': 'playInTV',

  topics: computed('topicGroup.items.[]', 'maxTopicsCount', function() {
    return this.getWithDefault('topicGroup.items', []).slice(0, this.get('maxTopicsCount'));
  }),

  showViewMore: computed('topicGroup.items.[]', 'maxTopicsCount', function() {
    return this.getWithDefault('topicGroup.items.length', []) > this.get('maxTopicsCount');
  }),

  actions: {
    topicClicked(options) {
      this.sendAction('on-topic-click', options);
    }
  }
});
