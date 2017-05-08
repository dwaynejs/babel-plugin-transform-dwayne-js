var _ = require('lodash');
var parseJS = require('parse-dwayne-js').parseJS;
var babelTemplate = require('babel-template');

var template = babelTemplate('var FUNC;\n\n');

module.exports = function (opts) {
  var t = opts.types;

  return {
    visitor: {
      TaggedTemplateExpression: function (path, state) {
        var node = path.node;
        var quasi = node.quasi;
        var opts = state.opts;
        var taggedFuncName = _.get(opts, 'taggedJsFuncName', 'js');

        if (
          quasi.quasis.length !== 1
          || quasi.expressions.length
          || node.tag.name !== taggedFuncName
        ) {
          return;
        }

        var value = quasi.quasis[0].value.cooked;
        var unique = path.scope.generateUid(_.get(opts, 'funcName', 'func'));
        var parserOpts = _.assign({}, opts, {
          funcName: unique,
          keepOriginal: _.get(opts, 'keepOriginal', true)
        });
        var parsed = parseJS(value, parserOpts);
        var parsedJS = '(' + parsed.code.replace(/;$/, '') + ')';

        path.replaceWithSourceString(parsedJS);

        if (parserOpts.keepOriginal) {
          path.insertBefore(
            template({
              FUNC: t.identifier(unique)
            })
          );
        }
      }
    }
  };
};
