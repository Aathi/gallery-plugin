const { isNone, computed } = Ember;

let getFirebaseNotificationUrl = function(topic) {
  return topic.get('slug') + '_' + topic.get('id');
};

export default Ember.Component.extend({
  classNames: ['firebase-pusher'],

  tamilhub: Ember.inject.service(),
  topic: null,
  isEdit: computed.notEmpty('topic.id'),
  notify_firebase: false,
  notification_message: '',

  disableNotificationMsg: computed.not('notify_firebase'),

  checkNotifyStatus: function() {
    if(this.get('isEdit')) {
      this.get('tamilhub').fetch('/pushnotifications/' + getFirebaseNotificationUrl(this.get('topic'))).then((json) => {
        this.set('notify_firebase', !isNone(json));

        if(json) {
          this.set('notification_message', json.notification_message);
        }
      });
    }
  }.on('didInsertElement')
});
