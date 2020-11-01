// returns a settings object based on predefined Defaults
var Defaults = function( DEFAULTS, s ){

    var s = s || {};

    var settings = {};

    for(var x in s) if( typeof DEFAULTS[x] == 'undefined' ) DEFAULTS[x] = s[x];

    for(var x in DEFAULTS) settings[x] = typeof s[x] == 'undefined' ? DEFAULTS[x] : s[x];

    return settings;

}