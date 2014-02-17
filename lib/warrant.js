function AccessError(type, description){
  this.type = type;
  this.description = description;
  this.code = 401;
};


function Authorization(access, error_cb){
  this.access = access;
  this.errorCallback = error_cb || function(type, desc){
    return new AccessError(type, desc);
  };
};

Authorization.prototype.hasPermission = function(permissions){
  for( var i in this.access){
    if( permissions.indexOf( this.access[i]) == -1){
      return false;
    }
  }
  return true;
};

Authorization.prototype.fromExpressRequest = function(req, res, next){
  
  var user;
  if( req.session){
    user = req.session.user;
  }else {
    user = req.user;
  }
  
  var err;
  if( !user){
    err = this.errorCallback( 'Access denied.', 'No user in session.');
  }else if( !user.permissions||!user.permissions.length) {
    err = this.errorCallback( 'Access denied.', 'User in session has no permissions granted.');
  }else if( !this.hasPermission( user.permissions)) {
    err = this.errorCallback( 'Access denied.', 'User does not have permission.');
  }
  
  if( err){
    res.send(err.code,err);
  }else {
    next();
  }
};


function Warrant(errorHandler){
  this.errorHandler = errorHandler;
};

Warrant.prototype.canAccess = function(permissions, error_cb){
  var auth = new Authorization(permissions, error_cb || this.errorHandler);
  return function(req,res,next){
    auth.fromExpressRequest( req, res, next);
  };
};




var warrant = module.exports = function(opts){
  return new Warrant();
};
