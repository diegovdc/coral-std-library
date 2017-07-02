const R = require('ramda')

//flAp :: [a]-> [a -> b] -> [b]
//flAp :: Apply f =>  f a -> f (a -> b) -> f b
const flAp = R.flip(R.ap)

// composeArr :: [(->r)] -> (->r)
const composeArr = R.apply(R.compose)

// initInArray :: * -> [*]
// initInArray :: [*] -> [*]
// initInArray :: [] -> []
const initInArray = val => Array.isArray(val) ? val : [val]//normalizamos el formato del los attachments para updatePushManyToSet


// zipManyWith :: (->) -> [[a,b,c, ...], [a,b,c, ...], [a,b,c, ...], ...] -> [ -> [a,a,a], -> [b,b,b], -> [c,c,c], ...]
//Zippea listas
const zipManyWith = (fn, arr_of_arrs) => {
	
	let max_length_of_zip = R.compose(
		R.head, //[a, Maybe b, ...] -> [a]
		R.sort((a,b) => a > b),//[a,  Maybe b, ...]
		R.map(arr => arr.length)// [] -> Int
	)(arr_of_arrs )


	let zipped = (function(arr_of_arrs) {// [[]] -> [[]]
		let zppd = []
		for (let i = 0; i < max_length_of_zip; i+=1) {
			zppd[i] = R.map(arr=> arr[i] ,arr_of_arrs)// [[]] -> take ([ index [] ]) -> zppd by index  [[]] 
		}

		return zppd
	}) (arr_of_arrs)

			//[[]] -> [[]]
	return 	R.map(elem => fn(elem), zipped)
}

// indexedMap :: Mappable a -> Mappable a index
const indexedMap =  R.addIndex(R.map)

module.exports = {
	flAp, 
	composeArr,
	initInArray,
	zipManyWith,
	indexedMap
}