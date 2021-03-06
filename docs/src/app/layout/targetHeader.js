basis.require('basis.ui');
basis.require('basis.ui.button');

var viewPrototype = resource('views/prototype/prototype.js').fetch();
var prototypeMapPopup = resource('prototypeMapPopup.js');

module.exports = new basis.ui.Node({
  template: resource('template/targetHeader.tmpl'),
  binding: {
    kind: 'data:',
    path: 'data:path || ""',
    title: {
      events: 'update',
      getter: function(node){
        return (node.data.title || '') + (/^(method|function|class)$/.test(node.data.kind) ? app.core.getFunctionDescription(node.data.obj).args.quote('(') : '');
      }
    },
    hasTarget: {
      events: 'rootChanged',
      getter: function(node){
        return node.delegate != node.root;
      }
    }
  },

  childClass: basis.ui.button.Button.subclass({
    binding: {
      caption: function(button){
        return button.delegate.viewHeader;
      }
    },
    click: function(){
      if (this.delegate === viewPrototype)
        prototypeMapPopup().show(this.element);
      else
        this.delegate.parentNode.scrollTo(this.delegate.element);
    }
  })
});