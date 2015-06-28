import Ember from 'ember';

export default Ember.Object.extend({
  firebaseInstance: 'https://tamilhub.firebaseio.com/',
  ref: null,

  initializeTamilhub: function() {
    var tamilhubRef = new Firebase(this.get('firebaseInstance'));
    this.set('ref', tamilhubRef);
  }.on('init'),

  fetch(url) {
    var urlRef = this.get('ref').child(url);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      urlRef.on('value', function(snapshot) {
        resolve(snapshot.val());
      }, function(error) {
        reject(error);
      });
    });
  }
});
