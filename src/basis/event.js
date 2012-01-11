/*!
 * Basis javascript library 
 * http://code.google.com/p/basis-js/
 *
 * @copyright
 * Copyright (c) 2006-2012 Roman Dvornov.
 *
 * @license
 * GNU General Public License v2.0 <http://www.gnu.org/licenses/gpl-2.0.html>
 */

!function(){

 /**
  * @namespace basis.event
  */

  var namespace = 'basis.event';


  //
  // inport names
  //

  var Class = basis.Class;
  var extend = Object.extend;
  var slice = Array.prototype.slice;


  //
  // Main part
  //

  var eventObjectId = 1; // EventObject seed ID
  var events = {};
  var destroyEvent;

  var warnOnDestroy = function(){
    throw 'Object had beed destroed before. Destroy method shouldn\'t be call more than once.'
  };

  function dispatchEvent(eventName){
    var eventFunction = events[eventName];

    if (!eventFunction)
    {
      eventFunction = events[eventName] = 
        /** @cut for more verbose in dev */ Function('eventName', 'slice', 'self', 'return self = function _event_' + eventName + '(' + Array.from(arguments, 1).join(', ') + '){' + 

          function(){
            var handlers = this.handlers_;
            var listenHandler;
            var config;
            var func;

            if (self.listen)
              if (listenHandler = this.listen[self.listenName])
                self.listen.call(this, listenHandler, arguments);

            if (!handlers || !handlers.length)
              return;

            handlers = slice.call(handlers);

            for (var i = handlers.length; i --> 0;)
            {
              config = handlers[i];

              // handler call
              if (func = config.handler[eventName])
                if (typeof func == 'function')
                  func.apply(config.thisObject, arguments);

              // any event handler
              if (func = config.handler['*'])
                if (typeof func == 'function')
                  func.call(config.thisObject, {
                    type: eventName,
                    args: arguments
                  });
            }
          }

        /** @cut for more verbose in dev */ .toString().replace(/\beventName\b/g, '\'' + eventName + '\'').replace(/^function[^(]*\(\)[^{]*\{|\}$/g, '') + '}')(eventName, slice);

      if (LISTEN_MAP[eventName])
        extend(eventFunction, LISTEN_MAP[eventName]);
    }

    return eventFunction;
  };


  //
  // listen scheme
  //

  var LISTEN_MAP = {};
  var LISTEN = {
    add: function(listenName, eventName, propertyName, handler){
      if (!propertyName)
        propertyName = listenName;

      LISTEN_MAP[eventName] = {
        listenName: listenName,
        listen: handler || function(listen, args){
          var object;

          if (object = args[1])  // second argument is oldObject
            object.removeHandler(listen, this);

          if (object = this[propertyName])
            object.addHandler(listen, this);
        }
      };

      var eventFunction = events[eventName];
      if (eventFunction)
        extend(LISTEN_MAP[eventName]);
    }
  };


 /**
  * Base class for event dispacthing. It provides model when it's instance
  * can registrate handlers for events, and call it when event happend. 
  * @class
  */
  var EventObject = Class(null, {

   /**
    * Name of class.
    * @type {string}
    * @readonly
    */
    className: namespace + '.EventObject',

   /**
    * List of event handler sets.
    * @type {Array.<Object>}
    * @private
    */
    handlers_: null,

   /**
    * Fires when object is destroing.
    * NOTE: don't override
    * @param {Basis.EventObject} object Reference for object wich is destroing.
    * @event
    */
    event_destroy: destroyEvent = dispatchEvent('destroy', 'object'),

   /**
    * Related object listeners.
    */
    listen: Class.NestedExtProperty(),

   /** use extend constructor */
    extendConstructor_: true,

   /**
    * @param {Object=} config
    * @constructor
    */
    init: function(config){
      // fast add first handler
      if (this.handler)
      {
        (this.handlers_ || (this.handlers_ = [])).push({
          handler: this.handler,
          thisObject: this.handlerContext || this
        });
      }
    },

   /**
    * Registrates new event handler set for object.
    * @param {Object} handler Event handler set.
    * @param {Object=} thisObject Context object.
    * @return {boolean} Whether event handler set was added.
    */
    addHandler: function(handler, thisObject){
      var handlers = this.handlers_;

      if (!handlers)
        handlers = this.handlers_ = [];

      if (!thisObject)
        thisObject = this;

      ;;;if (!handler && typeof console != 'undefined') console.warn('EventObject#addHandler: `handler` argument is not an object (', handler, ')');
      
      // search for duplicate
      // check from end to start is more efficient for objects which often add/remove handlers
      for (var i = handlers.length, item; i --> 0;)
      {
        item = handlers[i];
        if (item.handler === handler && item.thisObject === thisObject)
        {
          ;;;if (typeof console != 'undefined') console.warn('EventObject#addHandler: Add dublicate handler to EventObject instance: ', this);
          return false;
        }
      }

      // add handler
      return !!handlers.push({ 
        handler: handler,
        thisObject: thisObject
      });
    },

   /**
    * Removes event handler set from object. For this operation parameters
    * must be the same (equivalent) as used for addHandler method.
    * @param {Object} handler Event handler set.
    * @param {Object=} thisObject Context object.
    * @return {boolean} Whether event handler set was removed.
    */
    removeHandler: function(handler, thisObject){
      var handlers = this.handlers_;

      if (!handlers)
        return;

      if (!thisObject)
        thisObject = this;

      ;;;if (!handler && typeof console != 'undefined') console.warn('EventObject#addHandler: `handler` argument is not an object (', handler, ')');

      // search for handler and remove
      // check from end to start is more efficient for objects which often add/remove handlers
      for (var i = handlers.length, item; i --> 0;)
      {
        item = handlers[i];
        if (item.handler === handler && item.thisObject === thisObject)
          return !!handlers.splice(i, 1);
      }

      // handler not found
      return false;
    },

   /**
    * @destructor
    */
    destroy: function(){
      // warn on destroy method call (only in debug)
      ;;;this.destroy = warnOnDestroy;

      if (this.handlers_)
      {
        // fire object destroy event handlers
        destroyEvent.call(this, this);

        // remove all event handler sets
        this.handlers_ = null;
      }
    }
  });


  //
  // export names
  //

  basis.namespace('basis.event').extend({
    LISTEN: LISTEN,

    create: dispatchEvent,
    events: events,

    EventObject: EventObject
  }); 

}(basis);