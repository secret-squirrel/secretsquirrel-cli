#!/usr/bin/env node

var program = require('commander')
var prompt = require('prompt')
var pkg = require('./package.json')
var squirrel = require('./lib/squirrel')

prompt.message = prompt.delimiter = ''

program.version(pkg.version)

program
  .command('create-keypair')
  .description('Generate a new keypair')
  .action(function() {
    var schema = {
      properties: {
        bits: { 
          minimum: 1024,
          maximum: 4096,
          default: 2048,
          allowEmpty: false,
          message: 'Keysize must be an integer between 1024 and 4096',
          description: 'Enter a keysize: '
        },
        passPhrase: { 
          hidden: true,
          allowEmpty: false,
          minLength: 8,
          maxLength: 64,
          message: 'Passphrase must be between 8 and 64 characters long',
          description: 'Enter a passphrase: '
        }
      }
    }
    prompt.get(schema, function(err, result) {
      if(err) {
        console.log(err)
      } else {
        var bits = parseInt(result.bits)
        var passPhrase = result.passPhrase
        squirrel.createKeyPair(passPhrase, bits, function(err) {
          if(err) {
            console.log(err)
          } else {
            console.log('Keypair saved.')
          }
        })
      }
    })
  })

program
  .command('create-user')
  .description('Create a new user')
  .action(function() {
    squirrel.getContext(getPassPhrase, function(err, context) {
      if(err) {
        console.log(err)
      } else { 
        console.log('\nCreating a new user.')
        var schema = {
          properties: {
            name: {
              allowEmpty: false,
              description: 'Enter a name: '
            },
            email: {
              format: 'email',
              allowEmpty: false,
              description: 'Enter an email: '
            }
          }
        }
        prompt.get(schema, function(err, result) {
          if(err) {
            console.log(err)
            context.client.close()
          } else {
            var name = result.name
            var email = result.email
            squirrel.createUser(context, name, email, function(err, user) {
              if(err) {
                console.log(err)
              } else {
                console.log('create-user completed successfully:')
                console.log(result.result)
              }
              context.client.close()
            })
          }
        })
      }
    })
  })

program
  .command('delete-user')
  .description('Delete a user')
  .action(function() {
    squirrel.getContext(getPassPhrase, function(err, context) {
      if(err) {
        console.log(err)
      } else {
        console.log('\nDeleting a user.')
        var schema = {
          properties: {
            email: {
              allowEmpty: false,
              description: 'Enter the email of the user you wish to delete: '
            }
          }
        }
        prompt.get(schema, function(err, result) {
          if(err) {
            console.log(err)
            context.client.close()
          } else {
            var email = result.email
            squirrel.deleteUser(context, email, function(err) {
              if(err) {
                console.log(err)
              } else {
                console.log('User deleted.')
              }
              context.client.close()
            })
          }
        })
      }
    })
  })

program
  .command('list-users')
  .description('Display a list of users in the system')
  .action(function() {
    squirrel.getContext(getPassPhrase, function(err, context) {
      if(err) {
        console.log(err)
      } else {
        squirrel.getUsers(context, function(err, result) {
          if(err) {
            console.log(err)
          } else {
            console.log(result)
          }
          context.client.close()
        })
      }
    })
  })

program.command('*').action(program.help)
program.parse(process.argv)

if(process.argv.length <= 2) {
  program.help()
}

function getPassPhrase(callback) {
  var schema = {
    properties: {
      passPhrase: { hidden: true, description: "Enter your passphrase: " }
    }
  }
  console.log('You must unlock your private key to perform this operation.')
  prompt.get(schema, function(err, result) {
    callback(err, result.passPhrase)
  })
}
