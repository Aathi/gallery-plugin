const { isNone, computed } = Ember;

let getFirebaseNotificationUrl = function(topic) {
  return topic.get('slug') + '_' + topic.get('id');
};

export default Ember.Component.extend({
  tamilhub: Ember.inject.service(),
  topic: null,
  isEdit: computed.notEmpty('topic.id'),
  push_video_to_firebase: false,
  video_url: null,

  disableVideoUrl: computed.not('push_video_to_firebase'),

  checkTopicStatus: function() {
    if(this.get('isEdit')) {
      this.get('tamilhub').fetch('/tvvideos/' + getFirebaseNotificationUrl(this.get('topic'))).then((json) => {
        this.set('push_video_to_firebase', !isNone(json));

        if(json) {
          this.set('video_url', json.video_url);
        }
      });
    }
  }.on('didInsertElement')
});
