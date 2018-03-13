'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var R = require('ramda');

//flAp :: [a]-> [a -> b] -> [b]
//flAp :: Apply f =>  f a -> f (a -> b) -> f b
var flAp = R.flip(R.ap);

// composeArr :: [(->r)] -> (->r)
var composeArr = R.apply(R.compose);

// initInArray :: * -> [*]
// initInArray :: [*] -> [*]
// initInArray :: [] -> []
var initInArray = function initInArray(val) {
	return Array.isArray(val) ? val : [val];
}; //normalizamos el formato del los attachments para updatePushManyToSet


// zipManyWith :: (->) -> [[a,b,c, ...], [a,b,c, ...], [a,b,c, ...], ...] -> [ -> [a,a,a], -> [b,b,b], -> [c,c,c], ...]
//Zippea listas
var zipManyWith = function zipManyWith(fn, arr_of_arrs) {

	var max_length_of_zip = R.compose(R.head, //[a, Maybe b, ...] -> [a]
	R.sort(function (a, b) {
		return a > b;
	}), //[a,  Maybe b, ...]
	R.map(function (arr) {
		return arr.length;
	}) // [] -> Int
	)(arr_of_arrs);

	var zipped = function (arr_of_arrs) {
		// [[]] -> [[]]
		var zppd = [];

		var _loop = function _loop(i) {
			zppd[i] = R.map(function (arr) {
				return arr[i];
			}, arr_of_arrs); // [[]] -> take ([ index [] ]) -> zppd by index  [[]] 
		};

		for (var i = 0; i < max_length_of_zip; i += 1) {
			_loop(i);
		}

		return zppd;
	}(arr_of_arrs);

	//[[]] -> [[]]
	return R.map(function (elem) {
		return fn(elem);
	}, zipped);
};

// indexedMap :: Mappable a -> Mappable a index
var indexedMap = R.addIndex(R.map);

var Task = require('data.task');

//parallelTasks :: (-> r) -> [Task] -> Task Error *
var parallelTasks = R.curry(function (operator_fn, arr_of_tasks) {
	var fn = R.curryN(arr_of_tasks.length, operator_fn),
	    tasks = R.ap([flAp], arr_of_tasks);
	return composeArr(tasks)(Task.of(fn));
});

var JsonParseOrFalse = function JsonParseOrFalse(json) {
	try {
		return JSON.parse(json);
	} catch (e) {
		return false;
	}
};

var unboundSlice = Array.prototype.slice;
var toArray = Function.prototype.call.bind(unboundSlice);

var nestedPropToUpperLevel = R.curry(function (prop_path, return_map_as, obj) {
	var prop = R.path(prop_path, obj);
	var new_obj = R.clone(obj);
	new_obj[return_map_as] = prop;
	return new_obj;
});

//doubleMapNestedAndReturnInUpperLevel:: [paths] -> [paths] -> String -> [{prop: nested_target:[{finaltarget:'value'}]}] -> [{String:[mapped_values]}]
var doubleMapNestedAndReturnInUpperLevel = R.curry(function (prop_path, mapped_prop_path, return_map_as, obj_array) {
	return R.map(function (obj) {
		obj[return_map_as] = R.map(function (mapped_prop) {
			return R.pathOr([], mapped_prop_path, mapped_prop);
		}, R.pathOr([], prop_path, obj));
		return obj;
	})(obj_array || []);
});

var pairWith = R.curry(function (id_prop, prop, obj) {
	return [obj[id_prop], obj[prop]];
});
var pairWithObj = R.curry(function (id_prop, props, obj) {
	return [obj[id_prop], R.pick(props, obj)];
});
var pairObjToIdProp = R.curry(function (id_prop, obj) {
	return [obj[id_prop], obj];
});

var objsById = function objsById(id_prop, obj) {
	return R.compose(R.fromPairs, R.map(pairObjToIdProp(id_prop)))(obj);
};

var mergeObj = function mergeObj(k, l, r) {
	return R.merge(l, r);
};

var arrsIntoObjs = R.map(function (x) {
	return R.fromPairs([x]);
});

var toArrIfNotArr = function toArrIfNotArr(x) {
	return R.not(Array.isArray(x)) ? R.of(x) : x;
};

var concatValuesToArrayIfDuplicateKeys = function concatValuesToArrayIfDuplicateKeys(k, l, r) {
	if (!Array.isArray(l)) {
		l = [l];
	}
	if (!Array.isArray(r)) {
		r = [r];
	}
	return R.concat(l, r);
};

var objFromPairs = function objFromPairs(arr) {
	return _defineProperty({}, arr[0], arr[1]);
};

var provisionedFromPairs = function provisionedFromPairs(arr_of_arrs) {
	var arr_of_objs = R.map(objFromPairs, arr_of_arrs);
	return R.map(toArrIfNotArr, R.reduce(R.mergeWithKey(concatValuesToArrayIfDuplicateKeys), {}, arr_of_objs));
};

//idsByParentIds :: [{parent_id, id}] -> {some_parent_id: [ids], another_parent_id: [ids]}
var idsByParentIds = function idsByParentIds(parent_id_prop, id_prop, arr) {
	return R.compose(provisionedFromPairs, R.map(pairWith(parent_id_prop, id_prop)))(arr);
};

var logEach = R.forEach(function (el) {
	return console.log(el);
});

var toNumber = R.flip(R.curry(parseInt))(10);

var denullify = function denullify(v) {
	return v === null ? '' : v;
};

var deundefinedify = function deundefinedify(v) {
	return v === undefined ? '' : v;
};

var removeNullsAndUndefineds = R.compose(denullify, deundefinedify);

var lensPropMaker = function lensPropMaker(lens_arr) {
	return R.mergeAll(R.map(function (elem) {
		return _defineProperty({}, elem, R.lensProp(elem));
	}, lens_arr));
};

/**
 * Moves the element at the selected index up or down by the number stated in the direction parameter.
 * Note that: If direction - $index < 0 then the element will be positioned at the end of the array, if the index es bigger than the lenght of the array an udefined element will be created
 * @todo Correct the errors stated in the previous note
 * @param  {Int} direction position relative to the index by which the element will be moved
 * @param  {Int} index    the element
 * @param  {Array} array
 * @return {Array}
 */
var moveInArray = function moveInArray(direction, index, array) {
	return R.insert(index + direction, array[index], R.remove(index, 1, array));
};

//same a moveInArray, but prevents the first element of the array from becoming the last one when direction + index is less than  0
var nonCyclingMoveInArray = function nonCyclingMoveInArray(direction, index, array) {
	if (index + direction < 0 || index + direction > array.length - 1) {
		return array;
	} else {
		return moveInArray(direction, index, array);
	}
};

// A different API for the same operation as moveInArray. 
// removeAndInsert :: event {oldIndex, newIndex} -> [] -> []
var removeAndInsert = R.curry(function (event, list) {
	var moved_elem = list[event.oldIndex];
	var remove = R.remove(event.oldIndex, 1);
	var insert = R.insert(event.newIndex, moved_elem);
	return R.compose(insert, remove)(list);
});

var uppercaseFirst = function uppercaseFirst(s) {
	return R.join('', R.over(R.lensIndex(0), R.toUpper)(s));
};

var diff = function diff(a, b) {
	return a - b;
};
var orderAscending = R.sort(diff);

var sortByFirstItem = R.sortBy(R.prop(0));

/**
 * Logs within a composed function
 * @link http://ramdajs.com/0.22.1/docs/#tap
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
var tapLog = R.tap(function (x) {
	return console.log(x);
});

var logAndReturnSomething = function logAndReturnSomething(message, something) {
	if (process.env.NODE_ENV) {
		console.log(message);
	}
	return something;
};
/**
 *
 * [obj_prop_string] -> [a] -> [a]
 *
 * Sorts alphabetically ignoring case.
 *
 * @example alphabeticalObjSort(path_arr)(arr)
 *
 * @param  {array} path_arr an array of strings
 * @return {array}          sorted array
 */
var alphabeticalObjSort = R.curry(function (path_arr, sortable_objs) {
	return Array.isArray(path_arr) && path_arr.length > 0 ? R.sortBy(R.compose(R.toLower, R.path(path_arr)))(sortable_objs) : logAndReturnSomething('the first argument of alphabeticalObjSort must be and array of length > 0, \'' + path_arr + '\' given', sortable_objs);
});

/**
 *
 * [obj_prop_string] -> [a] -> [a]
 *
 * Sorts numerically.
 * *
 * @param  {array} path_arr an array of strings
 * @return {array}          sorted array
 */
var numericalObjSort = R.curry(function (path_arr, asc_or_desc, sortable_objs) {
	return Array.isArray(path_arr) && path_arr.length > 0 ? R.compose(sortingOrder(asc_or_desc), R.sortBy(R.path(path_arr)))(sortable_objs) : logAndReturnSomething('the first argument of numericalObjSort must be and array of length > 0, \'' + path_arr + '\' given', sortable_objs);
});

var sortingOrder = R.curry(function (asc_or_desc, arr) {
	if (asc_or_desc === 'desc') {
		return R.reverse(arr);
	} else if (asc_or_desc === 'asc') {
		return arr;
	}
	return logAndReturnSomething('th argument \'asc_or_desc\' must receive the string \'asc\' or \'desc\', ' + asc_or_desc + '\' given. No ordering was done', arr);
});

var defaultTo1 = function defaultTo1(val) {
	return val === null || val === undefined ? 1 : val;
};

/**
 * If quantity is missing it defaults to 1
 *
 */
var defaultIndexTo1 = function defaultIndexTo1(index) {
	return R.over(R.lensIndex(index), defaultTo1);
};

//sumTotal:: String prop -> String prop ->[{Number price, Int quantity}] -> Number price
var sumTotal = R.curry(function (quantity_prop, sumable_prop) {
	return R.compose(R.sum, R.map(R.compose(R.product, R.map(Number), defaultIndexTo1(0), R.props([quantity_prop, sumable_prop]))));
});

/**
 * Calculates the total price of an array of objects with props price and quantity.
 * If quantity is missing it defaults to 1
 * Includes a function to parse stringed numbers R.ma(Number)
 * @function sumTotalPrice
 * @requires  defaultIndexTo1
 * @requires  _prices_times_quantitites
 * @test http://goo.gl/fcglnD or http://ramdajs.com/repl/#?code=%2F%2Fhelpers%0Avar%20tapLog%20%3D%20R.tap%28x%3D%3Econsole.log%28x%29%29%3B%0Avar%20_%20%3D%20R%0A%0A%2F%2Ffunction%0Avar%20defaultTo1%20%3D%20val%20%3D%3E%20val%20%3D%3D%3D%20null%20%7C%7C%20val%20%3D%3D%3D%20undefined%20%3F%201%20%3A%20val%3B%0Avar%20defaultIndexTo1%20%3D%20index%20%3D%3E%20_.over%28_.lensIndex%28index%29%2C%20defaultTo1%29%3B%0Avar%20_prices_times_quantities%20%3D%20_.map%28_.compose%28_.reduce%28_.multiply%2C%201%29%2C%20_.map%28Number%29%2C%20defaultIndexTo1%281%29%2C%20_.props%28%5B%27price%27%2C%20%27quantity%27%5D%29%20%29%29%0Avar%20sumTotalPrice%20%3D%20_.compose%28_.sum%2C%20_prices_times_quantities%29%3B%20%0AsumTotalPrice%28%5B%7Bprice%3A1%2C%20quantity%3A5%7D%2C%20%7Bprice%3A%221%22%2C%20quantity%3A%20undefined%7D%5D%29%0A
 */
//sumTotalPrice:: [{Number price, Int quantity}] -> Number price
var sumTotalPrice = sumTotal('price', 'quantity');

// additiveFilter:: ['path'] -> [b] -> [{ ['path'] : [b], ...}] -> [{ Path [a] : [b], ...}]
var additiveFilter = R.curry(function (filter_prop_path, categories, categorizable_objs) {
	var notEmpty = function notEmpty(obj) {
		return R.intersection(R.path(filter_prop_path, obj), categories).length > 0 ? true : false;
	};

	if (categories.length === 0) return categorizable_objs;else return R.filter(notEmpty, categorizable_objs);
});

// rangeFilter::  ['path'] ->  [num, num] -> [{ ['path'] : num }] ->[{ ['path'] : num }]
var rangeFilter = R.curry(function (filter_prop_path, from_to_arr, filterable_objs) {
	var both_ends_are_0 = from_to_arr[0] == 0 && from_to_arr[1] == 0,
	    range_is_numerical = isNumber(from_to_arr[0]) && isNumber(from_to_arr[1]),
	    inverted_range = from_to_arr[1] < from_to_arr[0],
	    range_is_incomplete = from_to_arr.length !== 2,
	    inRange = function inRange(obj) {
		return R.path(filter_prop_path, obj) >= from_to_arr[0] && R.path(filter_prop_path, obj) <= from_to_arr[1];
	};

	if ( //si no debe filtrarse por alguna razón
	both_ends_are_0 || !range_is_numerical || inverted_range || range_is_incomplete) {

		return filterable_objs;
	} else {
		return R.filter(function (obj) {
			return R.path(filter_prop_path, obj) === undefined ? obj : inRange(obj);
		}, filterable_objs);
	}
});

//isNumber :: a -> Bool
var isNumber = function isNumber(n) {
	return _typeof(!isNaN(Number(n))) && n !== '' && n !== null && n !== undefined;
};

var escapeSpecialCharacters = function escapeSpecialCharacters(str) {
	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

var inString = R.curry(function (test_string, string) {
	return R.test(new RegExp(escapeSpecialCharacters(test_string), 'i'), string);
});

var trimStringAndRunFnInFilter = function trimStringAndRunFnInFilter(fn, string, filterable_objs) {
	var trimmed = R.trim(string);
	return trimmed !== '' ? R.filter(fn(trimmed), filterable_objs) : filterable_objs;
};

// pathHasString :: Path [string] -> String search -> Obj {path: String} -> Bool
var pathHasString = R.curry(function (prop_path, string, obj) {
	return inString(string, R.path(prop_path, obj));
});

// stringInPathOfObjArray :: [Path string] -> [Path string] -> String -> {path_to_array: [ {path_to_text: String} ]} -> Bool
var stringInPathOfObjArray = R.curry(function (path_to_array, path_to_text, string, obj) {
	return R.compose(R.any(R.equals(true)), R.map(pathHasString(path_to_text, string)), R.pathOr([], path_to_array))(obj);
});

// substringInStringArray :: { path: [String], * } -> Bool
var substringInStringArray = R.curry(function (path, string, obj) {
	return R.compose(inString(string), //buscamos
	R.join(''), //unimos
	//R.map(s => typeof s === 'string' ? s : ''), //TODO aseguramos que sea un string... mejor implementarlo con un Maybe
	R.pathOr([], path) //buscamos el array
	)(obj);
});

var objTextFilter = R.curry(function (filter_prop_path, string, filterable_objs) {
	return trimStringAndRunFnInFilter(pathHasString(filter_prop_path), string, filterable_objs);
});

var objArrayTextFilter = R.curry(function (path_to_array, path_to_text, string, filterable_objs) {
	return trimStringAndRunFnInFilter(stringInPathOfObjArray(path_to_array, path_to_text), string, filterable_objs);
});

var stringArrayTextFilter = R.curry(function (filter_prop_path, string, filterable_objs) {
	return trimStringAndRunFnInFilter(substringInStringArray(filter_prop_path), string, filterable_objs);
});

var multiTextFilter = R.curry(function (filter_specs, string, filterable_objs) {
	var results = R.chain(function (spec) {
		return {
			isPath: objTextFilter,
			isPathInObjArray: R.flip(objArrayTextFilter)(spec.path_to_text),
			isStringArray: stringArrayTextFilter
		}[spec.type](spec.path, string, filterable_objs);
	}, filter_specs);
	return R.uniq(results);
});

var multiTextFilter2 = R.curry(function (filters, string, filterable_objs) {
	return R.filter(function (obj) {
		return R.reduce(function (bool, filter) {
			return filter(string, obj) || bool;
		}, false, filters);
	}, filterable_objs);
});

//validateEmail :: String email -> Bool
var validateEmail = function validateEmail(email) {
	return R.test(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, email);
};

module.exports = {
	parallelTasks: parallelTasks,
	flAp: flAp,
	composeArr: composeArr,
	initInArray: initInArray,
	zipManyWith: zipManyWith,
	indexedMap: indexedMap,
	JsonParseOrFalse: JsonParseOrFalse,
	toArray: toArray,
	nestedPropToUpperLevel: nestedPropToUpperLevel,
	doubleMapNestedAndReturnInUpperLevel: doubleMapNestedAndReturnInUpperLevel,
	pairWith: pairWith,
	pairWithObj: pairWithObj,
	pairObjToIdProp: pairObjToIdProp,
	objsById: objsById,
	mergeObj: mergeObj,
	arrsIntoObjs: arrsIntoObjs,
	toArrIfNotArr: toArrIfNotArr,
	concatValuesToArrayIfDuplicateKeys: concatValuesToArrayIfDuplicateKeys,
	objFromPairs: objFromPairs,
	provisionedFromPairs: provisionedFromPairs,
	idsByParentIds: idsByParentIds,
	logEach: logEach,
	toNumber: toNumber,
	denullify: denullify,
	deundefinedify: deundefinedify,
	removeNullsAndUndefineds: removeNullsAndUndefineds,
	lensPropMaker: lensPropMaker,
	moveInArray: moveInArray,
	nonCyclingMoveInArray: nonCyclingMoveInArray,
	removeAndInsert: removeAndInsert,
	uppercaseFirst: uppercaseFirst,
	diff: diff,
	orderAscending: orderAscending,
	sortByFirstItem: sortByFirstItem,
	tapLog: tapLog,
	logAndReturnSomething: logAndReturnSomething,
	alphabeticalObjSort: alphabeticalObjSort,
	numericalObjSort: numericalObjSort,
	sortingOrder: sortingOrder,
	defaultTo1: defaultTo1,
	defaultIndexTo1: defaultIndexTo1,
	sumTotal: sumTotal,
	sumTotalPrice: sumTotalPrice,
	additiveFilter: additiveFilter,
	rangeFilter: rangeFilter,
	isNumber: isNumber,
	inString: inString,
	pathHasString: pathHasString,
	stringInPathOfObjArray: stringInPathOfObjArray,
	substringInStringArray: substringInStringArray,
	objTextFilter: objTextFilter,
	objArrayTextFilter: objArrayTextFilter,
	stringArrayTextFilter: stringArrayTextFilter,
	multiTextFilter: multiTextFilter,
	multiTextFilter2: multiTextFilter2,
	validateEmail: validateEmail
};