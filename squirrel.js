#!/usr/bin/env node

var argv = require('yargs').argv
var path = require('path')
var keyring = require('./keyring')
var server = require('./server')

var app = path.basename(process.argv[1])
var command = argv._[0]

switch(command) {
  case 'create-keypair':
    var keyPair = keyring.createKeyPair()
    keyring.saveToKeyRing(keyPair)
    break

  case 'ping': // for testing the server.
    server.ping()
    break

  case 'add-key':
    readKey('id_rsa.pub', server.addPublicKey)
    break

  default:
    usage()
    break
}

function readKey(file, next) {
  keyring.readKey(file, function(err, key) {
    if(err) {
      console.log('[ERROR] Unable to read key file: ' + err)
      usage()
    } else {
      next(key)
    }
  })
}

function usage() {
  console.log('node ' + app + ' <command> [options]')
  console.log('\tcreate-keypair:')
  console.log('\tGenerate a new RSA private key at ~/.squirrel/id_rsa')
}
