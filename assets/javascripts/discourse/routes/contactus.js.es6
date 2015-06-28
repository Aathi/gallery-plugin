import Ember from 'ember';

let convertToArray = function(model) {
  let list = [];

  for(let key in model) {
    if(model.hasOwnProperty(key)) {
      let rowObject = model[key];
      rowObject.id = key;
      list.pushObject(rowObject);
    }
  }

  return list;
}

export default Ember.Route.extend({
  tamilhub: Ember.inject.service(),

  model() {
    return this.get('tamilhub').fetch('contactusaddresses');
  },

  setupController(controller, model) {
    this._super(controller, convertToArray(model));
  }
});
