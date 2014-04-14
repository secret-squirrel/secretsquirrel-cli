#!/usr/bin/env node

var program = require('commander')
var prompt = require('prompt')
var pkg = require('./package.json')
var squirrel = require('./lib/squirrel')
var session = require('./session')

program
  .version(pkg.version)
  .option('--create-keypair', 'Generate a new keypair')
  .option('--create-user', 'Create a new user')
  .option('--get-users', 'Lists users')
  .parse(process.argv)

if(program.createKeypair) {
  // TODO: validation. bits should be at least 2048, and should default to
  // that. passphrase should be of a certain length.
  prompt.get(['bits', 'passPhrase'], function(err, result) {
    var bits = parseInt(result.bits)
    var passPhrase = result.passPhrase
    squirrel.createKeyPair(passPhrase, bits)
  })
} else if(program.createUser) {
  prompt.get(['name', 'email'], function(err, result) {
    var name = result.name
    var email = result.email

    squirrel.createUser(name, email)
  })
} else if(program.getUsers) {
  squirrel.getContext(getPassPhrase, function(err, context) {
    squirrel.getUsers(context)
  })
}

else {
  program.help()
}

function promptForPassPhrase(callback) {
  var schema = {
    properties: {
      passPhrase: { hidden: true }
    }
  }
  prompt.get(schema, function(err, result) {
    if (result.passPhrase) {
      session.fork(result.passPhrase)
    }
    callback(err, result.passPhrase)
  })
}

function getPassPhrase(callback) {
  session.getPassPhrase(function(err, passPhrase) {
    if (err) {
      promptForPassPhrase(callback)
    } else {
      callback(null, passPhrase)
    }
  })
}
