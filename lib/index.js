var _ = require('lodash');
var parseJS = require('parse-dwayne-html/lib/parse-js').parseJS;
var addOriginals = require('parse-dwayne-html/lib/add-originals');
var constructEvalFunction = require('parse-dwayne-html/lib/construct-eval-function');
var babelTemplate = require('babel-template');
var serializeJS = require('serialize-javascript');

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
          globalVars: _.get(opts, 'globalVars', ['require']),
          keepOriginal: _.get(opts, 'keepOriginal', true)
        });
        var parsed = parseJS(value, parserOpts);
        var parsedJS = parsed.js.slice(1, -2);

        if (parserOpts.keepOriginal) {
          parsedJS = addOriginals(
            serializeJS({
              original: value,
              function: constructEvalFunction(parsed.js)
            }, {
              space: 2
            }),
            parserOpts
          ).slice(0, -1);
        }

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
