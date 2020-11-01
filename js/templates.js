window.Templates = function(){

    this._bind = function(){
        var $templates = document.querySelectorAll('[template]');
        $templates.forEach(function($t){
            var name = $t.getAttribute('template');
            this[name] = function( $t ){
                var $template = $t.cloneNode(true);
                var $bindings = $template.querySelectorAll('[template-bind]');
                $bindings.forEach(function($bind){
                    var name = $bind.getAttribute('template-bind');
                    $template['$'+name] = $bind;
                }.bind($template));
                return $template;
            }.bind(this,$t);
            if($t.parentElement) $t.parentElement.removeChild($t);
        }.bind(this));
    }

    this._bind();

}