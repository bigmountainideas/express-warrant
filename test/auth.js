var warrant = require('../')
  , express = require('express')
  , request = require('supertest')
;

function bootstrap(){
  var app = express();

  app.use(express.bodyParser());
  
  return app;
}


function success(req,res){
  res.send('Access granted.');
}

describe('Warrant', function(){
  

  it('should respond with 401, no user object.', function(done){
  
    var app = bootstrap();
  
    app.get('/user', warrant().canAccess([ 'user_info']));
  
    request(app)
      .get('/user')
      .expect(401,/No user in session/i,done);
    
  })
  
  it('should respond with 401, user has no permission.', function(done){
  
    var app = bootstrap();
    
    app.use( function(req,res,next){
      req.user = {
        permissions: []
      };
      next();
    });
    
    app.get('/user',warrant().canAccess([ 'user_info']));
    
    request(app)
    .get('/user')
    .expect(401,/User in session has no permissions granted/i,done);
    
  })
  
  
  it('should respond with 200, access granted.', function(done){
  
    var app = bootstrap();
    
    app.use( function(req,res,next){
      req.user = {
        permissions: ['user_info']
      };
      next();
    });
    
    app.get('/user',warrant().canAccess([ 'user_info']),success);
    
    request(app)
    .get('/user')
    .expect(200,done);
    
  })
  
  
  
})