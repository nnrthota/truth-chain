var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/doctor";
var io = require('../server');
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var coinbase = web3.eth.coinbase;
console.log(coinbase);
var balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));

//Authentication Packages
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


router.get('/', function (req, res) {
   res.render( 'login');
})
router.get('/verify', authenticationMiddleware(), function (req, res) {
   res.render( 'verify');
})
router.get('/dashboard',authenticationMiddleware(), function (req, res) {
    var result=[];
  MongoClient.connect(url, function(err, db) {
    db.collection('article').find({}).count(function(err, count) {
    result.push({"article":count});
    });
    db.collection('register').find({}).count(function(err, count) {
    result.push({"register":count});
    });
    db.collection('sessions').find({}).count(function(err, count) {
    result.push({"sessions":count});
    //console.log(result);
    res.render('dashboard', {result: result});
    });
            });
})

router.get('/writer',authenticationMiddleware(), function (req, res) {
   res.render( 'writer');
})
router.get('/reviewer',authenticationMiddleware(), function (req, res) {
   res.render( 'reviewer');
})

router.post('/verify', authenticationMiddleware(), function (req, res1) {
  req.checkBody('contractAddress', 'contractAddress field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res1.render('verify', {errors:"Please check all fields"});
  }else{

    var isAddress = function (address) {
    // function isAddress(address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
}
var isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = web3.sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
}

    if(!isAddress(req.body.contractAddress)){
      res1.render('verify', {errors:"This is not valid Article contract Address"});
    }else{
      var address = req.body.contractAddress;
          abiarticleContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"title","type":"string"},{"name":"writer","type":"string"},{"name":"status1","type":"string"},{"name":"source1","type":"string"},{"name":"comment","type":"string"},{"name":"article","type":"string"}],"name":"addNewArticle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getArticle","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"status1","type":"string"}],"name":"updateArticle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      var Acc = abiarticleContract.at(address);
      Acc.GetCount.call(function (error, Count){
      Acc.getArticle.call(Count-1,function(err, res){
        if(res){
          var array=[{"title":res[0]},{"writer":res[1]},{"status":res[2]},{"source":res[3]},{"comment":res[4]},{"article":res[5]}]
          res1.render('verify', {articles: array, ok:"This Article is Found in Blockchain -Original "});
        }else{
          res1.render('verify', {articles: array, errors:"This Article is Not Found in Blockchain"});
        }
      });
    })
    }

}
});
router.get('/reader',authenticationMiddleware(), function (req, res) {
  var result = [];
MongoClient.connect(url, function(err, db) {
var cursor = db.collection('article').find({});
  cursor.forEach(function(doc, err) {
    result.push(doc);
  }, function() {
    db.close();
        res.render('reader', {articles: result});
  });
          });
});
router.post('/articles/search',authenticationMiddleware(), function(req,res){
  var result = [];
MongoClient.connect(url, function(err, db) {
  var qselect = req.body.search_categories;
  switch(qselect){
    case 'title':
    var query = { 'title': req.body.searchValue };
    break;
    case 'writer':
    var query = { 'writer': req.body.searchValue };
    break;
    case 'status':
    var query = { 'status': req.body.searchValue };
    break;
    case '':
    var query = {};
    break;
  }
var cursor = db.collection('article').find(query);
  cursor.forEach(function(doc, err) {
    result.push(doc);
  }, function() {
    db.close();
        res.render('reader', {articles: result});
  });
          });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
      MongoClient.connect(url, function(err, db){
    var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
    var result = [];
    var query = {'email':username};
    var display={'contractAddress':1}
    var cursor = db.collection('register').find(query,display);
      cursor.forEach(function(doc, err) {
        result.push(doc);
      }, function() {
if(result[0]==undefined){
  return done(null,false, {message:'!!! New to TruthChain? Please SignUp !!!'})
}else{
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var one = new String(password);
  var two = new String(res[2]);
  if( one.valueOf() === two.valueOf()){
        const user_id=result[0]._id;
        return done(null,user_id, {message: ' Successfully Authenticated'})
      }else {
      return done(null,false, {message:'!!! User Credentials are wrong !!!'})
       }
    });
  });
}
 });
});
}
));

router.post('/login',passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'/', badRequestMessage : 'Missing username or password.',
    failureFlash: true}), function (req, res1) {
})

router.post('/reviewer',authenticationMiddleware(), function (req, res1) {
  req.checkBody('contractAddress', 'contractAddress field cannot be empty').notEmpty();
  req.checkBody('status', 'status field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res1.render('reviewer', {errors:"Please check all fields"});
  }else{
  var contractAddress = req.body.contractAddress;
  var status = req.body.status;
  MongoClient.connect(url, function(err, db){
  var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

      var result = [];
      var  user=req.user;
      var query = new mongo.ObjectID(req.user);
      var display={'contractAddress':1,_id:0}
      var cursor = db.collection('register').find(query,display);
        cursor.forEach(function(doc, err) {
          result.push(doc);
        }, function() {
          db.close();
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var entity = new String('reviewer');
  if(  new String(res[3]).valueOf() === entity.valueOf()){
    abiarticleContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"title","type":"string"},{"name":"writer","type":"string"},{"name":"status1","type":"string"},{"name":"source1","type":"string"},{"name":"comment","type":"string"},{"name":"article","type":"string"}],"name":"addNewArticle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getArticle","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"status1","type":"string"}],"name":"updateArticle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

    var articleContract = abiarticleContract.at(contractAddress);
  articleContract.GetCount.call(function (error, Count){
  articleContract.updateArticle(Count-1, status, {from:coinbase, gas: 4712388,
  gasPrice: 100000000000}, function(error){
  if(error){
     res1.render('reviewer', {errors:'Error While updating article'});
  }else {
    MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var myquery = { "contractAddress": contractAddress };
              var newvalues =  {$set:{ "status":status} };
              db.collection("article").update(myquery, newvalues );
      });
      io.sockets.on('connection',function(socket){
      io.sockets.emit('update', {address:contractAddress,status:status});
      });
    res1.render('reviewer', {ok:'Successfully Reviewed article'});
    }
  })
});
}else{
    res1.render('reviewer', {errors:'You dont have privilage to update article'});
        }
    });
  });
});
});
}
});

router.post('/article',authenticationMiddleware(), function (req, res1) {
  req.checkBody('writerName', 'writerName field cannot be empty').notEmpty();
  req.checkBody('status', 'status field cannot be empty').notEmpty();
  req.checkBody('source', 'source field cannot be empty').notEmpty();
  req.checkBody('createarticle', 'article field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res1.render('writer', {errors:"Please check all fields"});
  }else{
  MongoClient.connect(url, function(err, db){
  var title = req.body.title;
  var writerName = req.body.writerName;
  var status = req.body.status;
  var source = req.body.source;
  var comment = req.body.comment;
  var article = req.body.createarticle;
  var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      var result = [];
      var  user=req.user;
      var query = new mongo.ObjectID(req.user);
      var display={'contractAddress':1,_id:0}
      var cursor = db.collection('register').find(query,display);
        cursor.forEach(function(doc, err) {
          result.push(doc);
        }, function() {
          db.close();
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var writer = new String('writer');
  if(  new String(res[3]).valueOf() === writer.valueOf()){
    abiarticleContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"title","type":"string"},{"name":"writer","type":"string"},{"name":"status1","type":"string"},{"name":"source1","type":"string"},{"name":"comment","type":"string"},{"name":"article","type":"string"}],"name":"addNewArticle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getArticle","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"status1","type":"string"}],"name":"updateArticle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

articleCode=("60606040526000600160006101000a81548160ff021916908360ff160217905550341561002b57600080fd5b610da28061003a6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630ab93971146100675780631b6e9558146100965780632553455d14610242578063ad2e3ceb146104fd575b600080fd5b341561007257600080fd5b61007a610566565b604051808260ff1660ff16815260200191505060405180910390f35b34156100a157600080fd5b610240600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061057d565b005b341561024d57600080fd5b610266600480803560ff169060200190919050506106f4565b6040518080602001806020018060200180602001806020018060200187810387528d818151815260200191508051906020019080838360005b838110156102ba57808201518184015260208101905061029f565b50505050905090810190601f1680156102e75780820380516001836020036101000a031916815260200191505b5087810386528c818151815260200191508051906020019080838360005b83811015610320578082015181840152602081019050610305565b50505050905090810190601f16801561034d5780820380516001836020036101000a031916815260200191505b5087810385528b818151815260200191508051906020019080838360005b8381101561038657808201518184015260208101905061036b565b50505050905090810190601f1680156103b35780820380516001836020036101000a031916815260200191505b5087810384528a818151815260200191508051906020019080838360005b838110156103ec5780820151818401526020810190506103d1565b50505050905090810190601f1680156104195780820380516001836020036101000a031916815260200191505b50878103835289818151815260200191508051906020019080838360005b83811015610452578082015181840152602081019050610437565b50505050905090810190601f16801561047f5780820380516001836020036101000a031916815260200191505b50878103825288818151815260200191508051906020019080838360005b838110156104b857808201518184015260208101905061049d565b50505050905090810190601f1680156104e55780820380516001836020036101000a031916815260200191505b509c5050505050505050505050505060405180910390f35b341561050857600080fd5b610564600480803560ff1690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610b71565b005b6000600160009054906101000a900460ff16905090565b610585610bbf565b868160000181905250858160200181905250848160400181905250838160600181905250828160800181905250818160a00181905250428160c0018181525050428160e001818152505080600080600160009054906101000a900460ff1660ff1681526020019081526020016000206000820151816000019080519060200190610610929190610c29565b50602082015181600101908051906020019061062d929190610c29565b50604082015181600201908051906020019061064a929190610c29565b506060820151816003019080519060200190610667929190610c29565b506080820151816004019080519060200190610684929190610c29565b5060a08201518160050190805190602001906106a1929190610c29565b5060c0820151816006015560e082015181600701559050506001600081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff1602179055505050505050505050565b6106fc610ca9565b610704610ca9565b61070c610ca9565b610714610ca9565b61071c610ca9565b610724610ca9565b6000808860ff1681526020019081526020016000206000016000808960ff1681526020019081526020016000206001016000808a60ff1681526020019081526020016000206002016000808b60ff1681526020019081526020016000206003016000808c60ff1681526020019081526020016000206004016000808d60ff168152602001908152602001600020600501858054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108495780601f1061081e57610100808354040283529160200191610849565b820191906000526020600020905b81548152906001019060200180831161082c57829003601f168201915b50505050509550848054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108e55780601f106108ba576101008083540402835291602001916108e5565b820191906000526020600020905b8154815290600101906020018083116108c857829003601f168201915b50505050509450838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109815780601f1061095657610100808354040283529160200191610981565b820191906000526020600020905b81548152906001019060200180831161096457829003601f168201915b50505050509350828054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a1d5780601f106109f257610100808354040283529160200191610a1d565b820191906000526020600020905b815481529060010190602001808311610a0057829003601f168201915b50505050509250818054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610ab95780601f10610a8e57610100808354040283529160200191610ab9565b820191906000526020600020905b815481529060010190602001808311610a9c57829003601f168201915b50505050509150808054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610b555780601f10610b2a57610100808354040283529160200191610b55565b820191906000526020600020905b815481529060010190602001808311610b3857829003601f168201915b5050505050905095509550955095509550955091939550919395565b806000808460ff1681526020019081526020016000206002019080519060200190610b9d929190610cbd565b50426000808460ff168152602001908152602001600020600701819055505050565b61010060405190810160405280610bd4610d3d565b8152602001610be1610d3d565b8152602001610bee610d3d565b8152602001610bfb610d3d565b8152602001610c08610d3d565b8152602001610c15610d3d565b815260200160008152602001600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610c6a57805160ff1916838001178555610c98565b82800160010185558215610c98579182015b82811115610c97578251825591602001919060010190610c7c565b5b509050610ca59190610d51565b5090565b602060405190810160405280600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610cfe57805160ff1916838001178555610d2c565b82800160010185558215610d2c579182015b82811115610d2b578251825591602001919060010190610d10565b5b509050610d399190610d51565b5090565b602060405190810160405280600081525090565b610d7391905b80821115610d6f576000816000905550600101610d57565b5090565b905600a165627a7a7230582093d5749acc971b0490d15605d1ee9d3ec44b21c903a56bcb830e3c48b9f8d4fb0029");


abiarticleContract.new("", {from:coinbase, data: articleCode, gas: 3000000},function(err, deployedContract){
   if(!err) {
      if(!deployedContract.address) {
          //console.log(deployedContract.transactionHash)
      } else {
          var articleContract = abiarticleContract.at(deployedContract.address);
     articleContract.addNewArticle(title, writerName, status, source, comment, article, {from:coinbase, gas: 4712388,
 gasPrice: 100000000000}, function(error){
       if(error){
           res1.render('writer', {errors:'Error While creating doctor',user:req.user});
       }else {
               MongoClient.connect(url, function(err, db) {
               if (err) throw err;
               var myobj = {
                  contractAddress:deployedContract.address,
                  title:title,
                  writer: writerName,
                  status: status,
                  source: source,
                  comment: comment,
                  article:article
               }
                db.collection("article").insertOne(myobj, function(err, doc) {
               if (err) {
                   throw err;
               }
               });
            });
          }
       })
     }
   }
 });
 res1.render('writer',{ok:'Successfully created article'});
}else{
    res1.render('writer', {errors:'You dont have privilage to create article'});
        }
    });
  });
});
});
}
});

router.post('/register', function (req, res) {
  req.checkBody('fullIdentity', 'fullIdentity field cannot be empty').notEmpty();
  req.checkBody('email', 'email field cannot be empty').notEmpty();
  req.checkBody('password', 'password field cannot be empty').notEmpty();
  req.checkBody('role', 'Please select Role').notEmpty();
  req.checkBody('secretcode', 'Secret code field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res.render('register', {errors:"Please check this field"});
  }else{
  MongoClient.connect(url, function(err, db) {
  var result = [];
  var query = {'email':req.body.email};
  var display={'contractAddress':1}
  var cursor = db.collection('register').find(query,display);
    cursor.forEach(function(doc, err) {
      result.push(doc);
    }, function() {
    if(result[0]==undefined){
    if(req.body.secretcode == 11421){
      web3.eth.defaultAccount= coinbase;
      var fullIdentity = req.body.fullIdentity;
      var email=req.body.email;
      var pass=req.body.password;
      var role=req.body.role;
      var abiContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      idCode = ("60606040526000600160006101000a81548160ff021916908360ff160217905550341561002b57600080fd5b6108e58061003a6000396000f300606060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630ab939711461005c5780635768dd881461008b5780636c3aa54d146101b1575b600080fd5b341561006757600080fd5b61006f610394565b604051808260ff1660ff16815260200191505060405180910390f35b341561009657600080fd5b6101af600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506103ab565b005b34156101bc57600080fd5b6101d5600480803560ff169060200190919050506104ac565b6040518080602001806020018060200180602001858103855289818151815260200191508051906020019080838360005b83811015610221578082015181840152602081019050610206565b50505050905090810190601f16801561024e5780820380516001836020036101000a031916815260200191505b50858103845288818151815260200191508051906020019080838360005b8381101561028757808201518184015260208101905061026c565b50505050905090810190601f1680156102b45780820380516001836020036101000a031916815260200191505b50858103835287818151815260200191508051906020019080838360005b838110156102ed5780820151818401526020810190506102d2565b50505050905090810190601f16801561031a5780820380516001836020036101000a031916815260200191505b50858103825286818151815260200191508051906020019080838360005b83811015610353578082015181840152602081019050610338565b50505050905090810190601f1680156103805780820380516001836020036101000a031916815260200191505b509850505050505050505060405180910390f35b6000600160009054906101000a900460ff16905090565b6103b36107ab565b84816000018190525083816020018190525082816040018190525081816060018190525080600080600160009054906101000a900460ff1660ff16815260200190815260200160002060008201518160000190805190602001906104189291906107ec565b5060208201518160010190805190602001906104359291906107ec565b5060408201518160020190805190602001906104529291906107ec565b50606082015181600301908051906020019061046f9291906107ec565b509050506001600081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff160217905550505050505050565b6104b461086c565b6104bc61086c565b6104c461086c565b6104cc61086c565b6000808660ff1681526020019081526020016000206000016000808760ff1681526020019081526020016000206001016000808860ff1681526020019081526020016000206002016000808960ff168152602001908152602001600020600301838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105c15780601f10610596576101008083540402835291602001916105c1565b820191906000526020600020905b8154815290600101906020018083116105a457829003601f168201915b50505050509350828054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561065d5780601f106106325761010080835404028352916020019161065d565b820191906000526020600020905b81548152906001019060200180831161064057829003601f168201915b50505050509250818054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106f95780601f106106ce576101008083540402835291602001916106f9565b820191906000526020600020905b8154815290600101906020018083116106dc57829003601f168201915b50505050509150808054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107955780601f1061076a57610100808354040283529160200191610795565b820191906000526020600020905b81548152906001019060200180831161077857829003601f168201915b5050505050905093509350935093509193509193565b6080604051908101604052806107bf610880565b81526020016107cc610880565b81526020016107d9610880565b81526020016107e6610880565b81525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061082d57805160ff191683800117855561085b565b8280016001018555821561085b579182015b8281111561085a57825182559160200191906001019061083f565b5b5090506108689190610894565b5090565b602060405190810160405280600081525090565b602060405190810160405280600081525090565b6108b691905b808211156108b257600081600090555060010161089a565b5090565b905600a165627a7a72305820daaf990c1d1c20b0328cd1b612bd84a0e4736bde934ed34f61e17864041df0a10029");

      abiContract.new("", {from:coinbase, data: idCode, gas: 3000000},function(err, deployedContract){
        if(!err) {
           if(!deployedContract.address) {
               //console.log(deployedContract.transactionHash)
           } else {
               var identityContract = abiContract.at(deployedContract.address);
          identityContract.newAccount(fullIdentity, email, pass, role, {from:coinbase, gas: 4712388,
      gasPrice: 100000000000}, function(error){
            if(error){
                //console.log(error);
                res.render('register', {errors:'Error While creating Identity '});
            }else {
                    if (err) throw err;
                    var myobj = {
                      contractAddress:deployedContract.address,
                       fullIdentity: fullIdentity,
                       email: email,
                       role: role
                    }
                     db.collection("register").insertOne(myobj, function(err, doc) {
                    if (err) {
                        throw err;
                    }
                    else{
                    res.redirect('/');
                    }

                    });
               }
            })
        }
      }
      });
    }else{
      res.render('register', {error:'Please provide correct secret code to Register'});
    }

}else{
res.render('register', {error:'This Email is already Registred!!! Please Login to continue'});
}
});
});
}

});

router.get('/register', function (req, res) {

  res.render('register');

});

router.get('/logout', function(req, res){
  //req.flash('success_msg', 'You are logged out');
	req.logout();
  req.session.destroy(function() {
  res.status(200).clearCookie('connect.sid', {path: '/'}).json({status: "Success"});
  res.redirect('/');
});

	res.redirect('/');
});
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});
function authenticationMiddleware () {
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
	    if (req.isAuthenticated()) return next();
	    res.redirect('/')
	}
}

module.exports = router;
