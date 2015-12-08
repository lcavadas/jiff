/*!
 * Javascript diff tool for JSON 0.0.1
 * https://github.com/lcavadas/jiff
 *
 * Copyright 2014, Luís Serralheiro
 */
(function ($) {
  $.fn.jsonDiff = function () {
    var _isObject = function (value) {
      return !!value && typeof value === "object" && value !== null;
    };

    var _isNotNull = function (value) {
      return value !== null && value !== undefined;
    };

    var _isArray = function (value) {
      return !!value && typeof value === "object" && Array.isArray(value);
    };

    var _getChangesBetweenArrays = function (a, b, minimal) {
      var changes = {};
      a.forEach(function (elA, idx) {
        if (!b[idx]) {
          changes[idx] = 'removed';
        } else {
          var subChanges = _getChangesBetweenObjects(elA, b[idx], minimal);
          if (!minimal || typeof subChanges !== 'object' || Object.keys(subChanges).length > 0) {
            changes[idx] = subChanges;
          }
        }
      });

      b.forEach(function (val, idx) {
        if (!a[idx]) {
          changes[idx] = 'added';
        }
      });

      return changes;
    };

    var _getChangesBetweenObjects = function (a, b, minimal) {
      var changes = {};
      var prop;

      if (!_isObject(a) || !_isObject(b)) {
        if (a !== b) {
          changes = 'changed';
        }
        return changes;
      }

      for (prop in b) {
        if (b.hasOwnProperty(prop)) {
          if (a.hasOwnProperty(prop)) {
            if (a[prop] !== b[prop]) {
              if (_isObject(a[prop]) && _isObject(b[prop])) {
                var subChanges;
                if (_isArray(a[prop]) && _isArray(b[prop])) {
                  subChanges = _getChangesBetweenArrays(a[prop], b[prop], minimal);
                } else {
                  subChanges = _getChangesBetweenObjects(a[prop], b[prop], minimal);
                }
                if (!minimal || Object.keys(subChanges).length > 0) {
                  changes[prop] = subChanges;
                }
              } else {
                changes[prop] = 'changed';
              }
            }
          } else {
            changes[prop] = 'added';
          }
        }
      }

      for (prop in a) {
        if (a.hasOwnProperty(prop) && !b.hasOwnProperty(prop)) {
          changes[prop] = 'removed';
        }
      }

      return changes;
    };

    var _getDiffInfo = function (a, b) {
      return _getChangesBetweenObjects(a, b, true);
    };

    var _getMergeInfo = function (a, b) {
      var diff = _getChangesBetweenObjects(a, b);
      var result = {};
      var prop;

      for (prop in a) {
        if (a.hasOwnProperty(prop)) {
          if (!_isObject(diff[prop])) {
            if (diff[prop]) {
              result[prop] = {___leftValue: a[prop], ___rightValue: b[prop], ___type: diff[prop]};
              result.___type = 'innerChange';
            }
            else {
              if (!_isObject(a)) {
                result = a;
              }
              result[prop] = a[prop];
            }
          } else {
            result[prop] = _getMergeInfo(a[prop], b[prop], diff[prop]);
            if (result[prop].___type) {
              result.___type = 'innerChange';
            }
          }
        }
      }

      for (prop in diff) {
        if (diff.hasOwnProperty(prop) && !_isObject(diff[prop])) {
          result[prop] = {___leftValue: a[prop], ___rightValue: b[prop], ___type: diff[prop]};
          result.___type = 'innerChange';
        }
      }

      return result;
    };

    return {
      isObject: _isObject,
      isNotNull: _isNotNull,
      extendedDiff: _getChangesBetweenObjects,
      diff: _getDiffInfo,
      merge: _getMergeInfo
    };
  };
}(jQuery));
