
export default {
  name: 'register-social-services',
  initialize(container, application) {
    var Facebook = container.lookupFactory('controller:facebook');
    application.register('service:facebook', Facebook);
  }
};
