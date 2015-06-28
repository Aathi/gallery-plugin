
export default {
  name: 'register-tamilhub',
  initialize(container, application) {
    var Tamilhub = container.lookupFactory('controller:tamilhub');
    application.register('service:tamilhub', Tamilhub);
  }
};
