window.Events = function(){

    this.on = function( eventName, fn ){
        var events = this[eventName];
        if(events) events.push(fn);
        else this[eventName] = [fn];
    }

    this.emit = function( eventName ){
        var events = this[eventName] || [];
        var args = [].slice.call(arguments).slice(1);
        events.forEach(function(event){
            event.apply(null,args);
        });
    }

}