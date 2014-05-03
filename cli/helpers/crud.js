var Q = require('Q')
var prompt = require('prompt')
var squirrel = require('../../lib/squirrel')
var tableizeRecords = require('./tableizer').tableizeRecords
var loadKeyring = require('./load-keyring')

prompt.message = prompt.delimiter = ''

var getContext = Q.nfbind(squirrel.getContext)
var promptGet = Q.nfbind(prompt.get)

module.exports = function(model, modelName, tableColumns) {
  function create(schema) {
    withContext(function(context) {
      console.log('\nCreating a new', modelName + '.')
      return promptGet(schema)
      .then(function(result) {
        return Q.nfcall(model.create, context, result)
      })
      .then(function(record) {
        console.log('Created', modelName + ':')
        console.log(tableizeRecords([record], tableColumns))
      })
    })
  }

  function list(schema) {
    withContext(function(context) {
      return Q.nfcall(model.index, context, {})
      .then(function(result) {
        console.log(tableizeRecords(result, tableColumns))
      })
    })
  }

  function update(schema) {
    withContext(function(context) {
      return promptGet(schema)
      .then(function(result) {
        return Q.nfcall(model.update, context, result)
      })
      .then(function(record) {
        console.log('Updated', modelName + ':')
        console.log(tableizeRecords([record], tableColumns))
      })
    })
  }

  function del(schema) {
    withContext(function(context) {
      return promptGet(schema)
      .then(function(result) {
        var email = result.email
        return Q.nfcall(model.index, context, { where: { email: email } })
      })
      .then(function(records) {
        if(records && records.length > 0) {
          console.log('Deleting:', tableizeRecords(records, tableColumns))
          return Q.nfcall(model.del, context, records[0].id)
        } else {
          console.log('Could not find', modelName + '.')
        }
      })
    })
  }

  function withContext(promise) {
    var context
    return getContext(loadKeyring)
    .then(function(_context) {
      context = _context
      return promise(context)
    })
    .catch(function(error) {
      console.log('Error:', error)
    })
    .finally(function() {
      if (context) {
        context.client.close()
      }
      process.exit()
    })
  }

  function registerCommands(program, c, r, u, d) {
    program
      .command(modelName + '-create')
      .description('Create a new ' + modelName)
      .action(c)

    program
      .command(modelName + '-list')
      .description('Display a ' + modelName + ' list')
      .action(r)

    program
      .command(modelName + '-update')
      .description('Update a ' + modelName)
      .action(u)

    program
      .command(modelName + '-delete')
      .description('Delete a ' + modelName)
      .action(d)
  }

  return {
    create: create,
    list: list,
    update: update,
    del: del,
    registerCommands: registerCommands
  }
}
