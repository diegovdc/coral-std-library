const expect = require("chai").expect
const R  = require('ramda');// Se usa R.compose para algunas prueba)s
const {
    pairWith,
    isNumber,
    inString,
    alphabeticalObjSort,
    numericalObjSort,
    sortingOrder,
    removeAndInsert,
    idsByParentIds,
    objsById,
    pairObjToIdProp,
    nestedPropToUpperLevel,
    doubleMapNestedAndReturnInUpperLevel,
    sumTotal,
    sumTotalPrice,
    validateEmail,
    //filters
    additiveFilter,
    rangeFilter,
    objTextFilter,
    objArrayTextFilter,
    stringArrayTextFilter,
    multiTextFilter,
    multiTextFilter2,    
    pathHasString,//no testeada por si sóla pero si en objTextFilter y multiTextFilter2
    stringInPathOfObjArray,//no testeada por si sóla pero si en objArrayTextFilter y multiTextFilter2
    substringInStringArray,//no testeada por si sóla pero si en stringArrayTextFilter y multiTextFilter2
}  = require('../src/std-library');

describe('Pure function library', () => {

   it('[pairWith] should create an array of two elements paired from two properties extracted from another object', () => {
      var obj = {color: 'blue', color_id: 1, something: 'else'};
      var color_by_id= pairWith('color_id', 'color', obj);
      expect(color_by_id).to.eql([1, 'blue']);
   });

   describe('[inString]', function() {
        it('turns a test_string in to a RegExp and tests if the other string matches the RegExp. Returns a Boolean value, and is curryable', () => {
            let s = 'experimental';

            let has_ex = inString('ex', s);
            expect(has_ex).to.eql(true);

            let has_men = inString('men', s);
            expect(has_men).to.eql(true);

            let has_false = inString('false', s);
            expect(has_false).to.eql(false);

            //Curryable
            let has_al = inString('al')(s)
            expect(has_al).to.eql(true);
        });
        
        it('accepts special characters', function() {
            let special = '(*'
            let has_special = inString('(*', special)
            expect(has_special).to.eql(true)
        });
   })
    

    it('[alphabeticalObjSort], sorts alphabetically ignoring case. Takes a ramda path_arr. Is curryable/composable', () => {
        let  obj = [
            {   prop: 'dalga', nested: { prop: 'halga' } },
            {   prop: 'falga', nested: { prop: 'galga' } },
            {   prop: 'alga', nested: { prop: 'balga' } },
            {   prop: 'calga', nested: { prop: 'lalga' } }
        ];

        //does not sort
        let no_prop_s = alphabeticalObjSort([])(obj);
        expect(no_prop_s).to.eql(obj);

        let stringed_prop_s = alphabeticalObjSort('prop')(obj);
        expect(stringed_prop_s).to.eql(obj);


        //sorts prop
        let sorted_prop_s = [
            {   prop: 'alga', nested: { prop: 'balga' } },
            {   prop: 'calga', nested: { prop: 'lalga' } },
            {   prop: 'dalga', nested: { prop: 'halga' } },
            {   prop: 'falga', nested: { prop: 'galga' } }
        ];
        let sorted_prop = alphabeticalObjSort(['prop'])(obj)
        expect(sorted_prop_s).to.eql(sorted_prop);

        //sorts nested prop
        let nested_sorted_prop_s = [
            {   prop: 'alga', nested: { prop: 'balga' } },
            {   prop: 'falga', nested: { prop: 'galga' } },
            {   prop: 'dalga', nested: { prop: 'halga' } },
            {   prop: 'calga', nested: { prop: 'lalga' } }
        ];
        let nested_sorted_prop = alphabeticalObjSort(['nested', 'prop'])(obj)
        expect(nested_sorted_prop_s).to.eql(nested_sorted_prop);
    });

    it('[numericalObjSort], sorts an array of objects by a property that contains a number. The property might be nested and shoudl be declared as a path in an array (Ramda style)', () => {
        let numbers= [
            {prop: 57},
            {prop: 200},
            {prop: 56},
            {prop: 67}
        ];
        let sorted_numbers_asc= [
            {prop: 56},
            {prop: 57},
            {prop: 67},
            {prop: 200}
        ];
        let number_sort_asc = numericalObjSort(['prop'], 'asc')(numbers)
        expect(number_sort_asc).to.eql(sorted_numbers_asc);

        let sorted_numbers_desc= [
            {prop: 200},
            {prop: 67},
            {prop: 57},
            {prop: 56}
        ];
        let number_sort_desc = numericalObjSort(['prop'], 'desc')(numbers)
        expect(number_sort_desc).to.eql(sorted_numbers_desc);

    });

    it('[sortingOrder], Allows toggling between a ascending order(default) and an descending order for an array. "asc" for ascending, "desc" for descending. For its proper functioning it should be used after the sorting of an array. It is a wrapper on R.reverse', () => {
        let letters= [
            'a',
            'b',
            'c',
            'd',
        ];
        //Descending
        let letters_desc_s = [
            'd',
            'c',
            'b',
            'a',
        ]
        let letters_desc = sortingOrder('desc')(letters)
        expect(letters_desc).to.eql(letters_desc_s);
        //Ascending
        let letters_asc = sortingOrder('asc')(letters)
        expect(letters_asc).to.eql(letters);

    });

    it('[idsByParentIds] conviniently extracts ids and parents ids from an array of objects and returns an array with parent_ids as keys whose value is a array of the related ids', () => {
            let subcategories = [
            {
                id:1,
                category_id: 1
            },
            {
                id:2,
                category_id: 1
            },
            {
                id:3,
                category_id: 3
            },
            {
                id:4,
                category_id: 2
            }
        ];
        let subcats_by_cat_id  = idsByParentIds('category_id', 'id', subcategories)
        expect(subcats_by_cat_id).to.eql({1:[1, 2], 2:[4], 3:[3]})
    });

    it('[pairObjToIdProp] pairs an object to an id_prop extracted from it', () => {
        let cat = {
            id: 1,
            name: 'meow'
        };
        let cat_by_id = pairObjToIdProp('id', cat)
        expect(cat_by_id).to.eql([1, cat])

    });

    it('[objsById]extracts id prop from objs in an array and returns an object with the id_prop as key and the source object as value', () => {
        let subcategories = [
            {
                id:1,
                category_id: 1
            },
            {
                id:2,
                category_id: 1
            },
            {
                id:3,
                category_id: 3
            },
            {
                id:4,
                category_id: 2
            }
        ];
        let subcats_by_id  = objsById('id', subcategories);

        let objsById_spec = {
            1:  {
                id:1,
                category_id: 1
            },
             2: {
                id:2,
                category_id: 1
            },
            3:  {
                id:3,
                category_id: 3
            },
            4: {
                id:4,
                category_id: 2
            }
        }
        expect(subcats_by_id).to.eql(objsById_spec)
    });

    it('[nestedPropToUpperLevel] toma una propiedad anidada y regresa una copia del objeto con la propiedad en el primer nivel del mismo, si otra propiedad ya existe con el mismo nombre, será sobre escrita', () => {
        let spec = {
            prop: 'hola',
            nested: {
                property: [1,2,3,4,5]
            }
        };

        //test 1 Unnesting
        let unnested_spec = {
            prop: 'hola',
            property: [1,2,3,4,5],
            nested: {
                property: [1,2,3,4,5]
            }
        };
        let unnested = nestedPropToUpperLevel(['nested', 'property'], 'property', spec);
        expect(unnested).to.eql(unnested_spec);

        //test 2 Spec is not modified
        let spec_control = {//igual que spec
            prop: 'hola',
            nested: {
                property: [1,2,3,4,5]
            }
        };
        expect(spec_control).to.eql(spec);
    });

    it('[doubleMapNestedAndReturnInUpperLevel] Recibe un array de objetos con una propiedad que unsegundo array a mappear. Regresa una copia del objeto con la propiedad en el primer nivel del mismo, si otra propiedad ya existe con el mismo nombre, será sobre escrita.', () => {
        //[paths] -> [paths] -> String -> [{prop: nested_target:[{finaltarget:'value'}]}] -> [{String:[mapped_values]}]
        let spec = [
            {
                nested: {
                    target: [{id: 1}, {id:2}]
                }
            },
            {
                nested: {
                    target: [{id: 1}, {id:3}]
                }
            }
        ];

        let unnested_and_mapped = doubleMapNestedAndReturnInUpperLevel(['nested', 'target'], ['id'], 'target_ids',spec);
        let unnested_and_mapped_spec = [
            {
                target_ids:[1,2],
                nested: {
                    target: [{id: 1}, {id:2}]
                }
            },
            {
                target_ids:[1,3],
                nested: {
                    target: [{id: 1}, {id:3}]
                }
            }
        ];
        expect(unnested_and_mapped).to.eql(unnested_and_mapped_spec);

        let empty_spec = doubleMapNestedAndReturnInUpperLevel(['nested', 'target'], ['id'], 'target_ids',[]);
        expect(empty_spec).to.eql([]);

        let undefined_spec = doubleMapNestedAndReturnInUpperLevel(['nested', 'target'], ['id'], 'target_ids',undefined);
        expect(undefined_spec).to.eql([]);
    })

     it('[sumTotal] Takes a numerical prop i.e. price, a quantity prop an array of objects with price and quantity props and returns the total', () => {
        let total = sumTotal('quantity', 'price')([{quantity: 1, price:10}, {quantity: 2, price: 5}]);
        expect(total).to.eql(20);

        let total_2 = sumTotal('quantity', 'price')([{quantity: 1, price:10}, {price: 5}]);
        expect(total_2).to.eql(15);
    });

    it('[sumTotalPrice] Takes an array of objects with price and quantity props and returns the total', () => {
        let total = sumTotalPrice([{quantity: 1, price:10}, {quantity:2, price: 5}]);
        expect(total).to.eql(20);
    });

    it('[validateEmail] Tests if a string is a valid email', () => {
        let email = validateEmail('diego@diego.com');
        expect(email).to.eql(true);
        
        
        //debe contener un TLD
        let no_email1 = validateEmail('diego@aksdj');
        expect(no_email1).to.eql(false);
        
        //el TLD debe ser mayor a un sólo caracter
        let no_email2 = validateEmail('diego@bla.c');
        expect(no_email2).to.eql(false);
        
        //debe contener una arroba
        let no_email3 = validateEmail('diego.com');
        expect(no_email3).to.eql(false);
    });

    describe('[removeAndInsert] :: {oldIndex, newIndex} -> [] -> []', ()  => {
        let smaller_array = ['foo', 'bar', 'baz'];
        let larger_array = ['foo', 'bar', 'baz', 'pftt', 'cu'];

        it('removes element from an index of an array and inserts it at a new index in the same array --returns a new array--', () => {
            expect( ['bar', 'foo', 'baz']).to.eql(removeAndInsert({oldIndex: 0, newIndex: 1}, smaller_array))
            expect( ['foo', 'pftt', 'bar', 'baz', 'cu']).to.eql(removeAndInsert({oldIndex: 3, newIndex: 1}, larger_array))
        });
    })

        describe('Filters', function() {
            it('[additiveFilter] a curryable/composable function that takes a categories array and array of categorizable objects and returns an array of the categorizable objects that have the selected categories. If the categories array is empty, the whole array of categorizable objects should be returned', () => {
                let categorizable_objs = [
                    {with_a:'x', categories:['a'], another_category:['cool']},
                    {with_b:'x', categories:['b'], another_category:[]},
                    {with_n:'x', categories:['n'], another_category:['nice']},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[]},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus']}
                ];

                //Test 1
                let A_cat  = ['a'];
                let itered_A_s = [
                    {with_a:'x', categories:['a'], another_category:['cool']},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[]},
                ];
                let A_s = additiveFilter(['categories'], A_cat, categorizable_objs);
                expect(A_s).to.eql(itered_A_s);

                //Test 2
                let A_B_cat  = ['a', 'b'];
                let filtered_A_B_s = [
                    {with_a:'x', categories:['a'], another_category:['cool']},
                    {with_b:'x', categories:['b'], another_category:[]},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[]},
                ];
                let A_B_s = additiveFilter(['categories'], A_B_cat, categorizable_objs);
                expect(A_B_s).to.eql(filtered_A_B_s);

                //Test 3 Curry
                let A_C_D_cat  = ['a', 'c', 'd'];
                let filtered_A_C_D_s = [
                    {with_a:'x', categories:['a'], another_category:['cool']},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[]},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus']}
                ];
                let A_C_D_s = additiveFilter(['categories'], A_C_D_cat)(categorizable_objs);
                expect(A_C_D_s).to.eql(filtered_A_C_D_s);

                //Test 3.1 Chaining filters
                let Asparragus_cat  = ['asparragus', 'cool'];
                let filtered_A_C_s = [
                    {with_a:'x', categories:['a'], another_category:['cool']},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus']}
                ];

                let A_C_s = R.compose(additiveFilter(['another_category'], Asparragus_cat), additiveFilter(['categories'], A_C_D_cat))(categorizable_objs);
                expect(A_C_s).to.eql(filtered_A_C_s);

                //Test 4: empty array
                let empty_cat  = [];

                let all = additiveFilter(['categories'], empty_cat, categorizable_objs);
                expect(all).to.eql(categorizable_objs);
            });

            it('[rangeFilter] is a curryable/composable function that looks at a property to filter/compare-against, an array with a numerical range and array of filterable objects that must include the specified property. It returns an array of the filterable objects that are withing the specified range. If the range is inverted or if no filter_prop exists it returns the filterable_objs array unfiltered', () => {
                let priced_objs = [
                    {with_a:'x', categories:['a'], another_category:['cool'], price:20},
                    {with_b:'x', categories:['b'], another_category:[], price:30},
                    {with_n:'x', categories:['n'], another_category:['nice'], price:40},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[], price:50},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus'], price:60}
                ];

                //Test 1 - Returns filterable obj when filter_prop is missing
                let non_filterable = [{halo: 'welt'}];
                let halo_welt = rangeFilter(['price'], [0,100], non_filterable);
                expect(halo_welt).to.eql(non_filterable);

                //Test 2 - Returns filterable obj_array when pricerange is inverted
                let inverted_range = rangeFilter(['price'], [50, 0], priced_objs);
                expect(inverted_range).to.eql(priced_objs);

                //Test 2.1 - Returns filterable obj_array when pricerange is  incomplete
                let incomplete_range = rangeFilter(['price'], [50], priced_objs);
                expect(incomplete_range).to.eql(priced_objs);

                //Test 2.2 - Returns filterable obj_array when pricerange has one field is an empty string or a string that is not parseable or null or undefined
                let empty_string_range_a = rangeFilter(['price'], ['', 0], priced_objs);
                expect(empty_string_range_a).to.eql(priced_objs);
                let empty_string_range_b = rangeFilter(['price'], [0, ''], priced_objs);
                expect(empty_string_range_b).to.eql(priced_objs);

                let empty_string_range_null_a = rangeFilter(['price'], [null, 0], priced_objs);
                expect(empty_string_range_null_a).to.eql(priced_objs);

                let empty_string_range_undefined = rangeFilter(['price'], [undefined, 0], priced_objs);
                expect(empty_string_range_undefined).to.eql(priced_objs);

                //Test 2.3 - Returns filterable obj_array when both ends of the price range are 0
                let _0_0 = rangeFilter(['price'], [0, 0], priced_objs);
                expect(_0_0).to.eql(priced_objs);

                //Test 3 - Proper Filtering
                let from_40_to_100s = [
                    {with_n:'x', categories:['n'], another_category:['nice'], price:40},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[], price:50},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus'], price:60}
                ];
                let from_40_to_100 = rangeFilter(['price'], [40, 60], priced_objs);
                expect(from_40_to_100).to.eql(from_40_to_100s);

                //Test 4 - Takes infinity values
                let from_40_to_infinity_s = [
                    {with_n:'x', categories:['n'], another_category:['nice'], price:40},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[], price:50},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus'], price:60}
                ];
                let from_40_to_infinity = rangeFilter(['price'], [40, Infinity], priced_objs);
                expect(from_40_to_infinity).to.eql(from_40_to_infinity_s);

                    //
                let from_minus_infinity_to_infinity_s = [
                    {with_a:'x', categories:['a'], another_category:['cool'], price:20},
                    {with_b:'x', categories:['b'], another_category:[], price:30},
                    {with_n:'x', categories:['n'], another_category:['nice'], price:40},
                    {with_a_b:'x', categories:['a', 'b'], another_category:[], price:50},
                    {with_c_d:'x', categories:['c', 'd'], another_category:['asparragus'], price:60}
                ];
                let from_minus_infinity_to_infinity = rangeFilter(['price'], [-Infinity, Infinity], priced_objs);
                expect(from_minus_infinity_to_infinity).to.eql(from_minus_infinity_to_infinity_s);

                    //
                 let from_minus_infinity_to_40_s = [
                    {with_a:'x', categories:['a'], another_category:['cool'], price:20},
                    {with_b:'x', categories:['b'], another_category:[], price:30},
                    {with_n:'x', categories:['n'], another_category:['nice'], price:40},
                ];

                let from_minus_infinity_to_40 = rangeFilter(['price'], [-Infinity, 40], priced_objs);
                expect(from_minus_infinity_to_40).to.eql(from_minus_infinity_to_40_s);

                //Test 5 - Takes the same value in both extremes of the range
                 let from_40_to_40_s = [
                    {with_n:'x', categories:['n'], another_category:['nice'], price:40},
                ];

                let from_40_to_40 = rangeFilter(['price'], [40, 40], priced_objs);
                expect(from_40_to_40).to.eql(from_40_to_40_s);

                //Test 6 - It can be composed with itself
                let composed_with_itself = R.compose(rangeFilter(['price'], [40, 40]), rangeFilter(['price'], [-Infinity, 40]))(priced_objs);
                expect(composed_with_itself).to.eql(from_40_to_40_s);

                //Test 6.1 - It can be composed with other filters
                let Asparragus_cat  = ['asparragus', 'cool'];
                let just_cool = [
                     {with_a:'x', categories:['a'], another_category:['cool'], price:20},
                ];
                let composed_with_others = R.compose(rangeFilter(['price'], [0, 40]), additiveFilter(['another_category'], Asparragus_cat))(priced_objs);
                expect(composed_with_others).to.eql(just_cool);
            });

            it('[objTextFilter] tests and obj for containing a certain string. It is a curryable/composable function takes a filter_prop_path a string for comparing and a filterable_objs array and returns an array of filtered obj', () => {
                let objs = [
                {title: 'blues'},
                {title: 'rock'},
                {title: 'experimental'},
                {title: 'baroque'},
                {title: 'punk rock'},
                ];

                let unfiltered = objTextFilter(['title'], '')(objs)
                expect(unfiltered).to.eql(objs);

                let by_r_s =  [
                {title: 'rock'},
                {title: 'experimental'},
                {title: 'baroque'},
                {title: 'punk rock'},
                ];

                let r_s = objTextFilter(['title'], 'r')(objs)
                expect(r_s).to.eql(by_r_s);

                let r_s_with_space = objTextFilter(['title'], '     r     ')(objs)
                expect(r_s_with_space).to.eql(by_r_s);
            });
            
            describe('[stringArrayTextFilter]: iterates over an array of objects, where a given path has an array of strings. It iterates over this array searching for a substring match (case insensitive)', function() {
                it('If a match is found it returns the object, else it does not', function() {
                   
                    let arr_of_o = ['hola', 'diego', 'como', 'estas']
                    let objWithO =    {
                        path: {to: arr_of_o}
                    }
                    let arr_of_no_o = ['hula', 'diegi', 'cumu', 'estas']
                    let objWithoutO = {
                        path: {to: arr_of_no_o}
                    }
                    let arr_of_objs = [objWithO,  objWithoutO]

                    expect(stringArrayTextFilter(['path', 'to'], 'o', arr_of_objs)).to.eql([objWithO])
                    expect(stringArrayTextFilter(['path', 'to'], 'hola', arr_of_objs)).to.eql([objWithO])
                    expect(stringArrayTextFilter(['path', 'to'], 'estas', arr_of_objs)).to.eql([objWithO, objWithoutO])
                });
                
                it('returns all the objects in th array if the searched string is an empty string', function() {
                        let arr_of_o = ['hola', 'diego', 'como', 'estas']
                        let objWithO =    {
                            path: {to: arr_of_o}
                        }
                        let arr_of_no_o = ['hula', 'diegi', 'cumu', 'estas']
                        let objWithoutO = {
                            path: {to: arr_of_no_o}
                        }
                        let arr_of_objs = [objWithO,  objWithoutO]

                        expect(stringArrayTextFilter(['path', 'to'], '', arr_of_objs)).to.eql([objWithO, objWithoutO])
                });
            });

            describe('[objArrayTextFilter]: iterates over an array of objects, where a given path (path_to_array) has an array of objects, it then iterates over this objects and searches for a string in the second path (path_to_text)', function() {
                it('returns the object if a match is found, else it does not', function() {
                    let objWithOAndEstas =   R.assocPath(['path', 'to', 'text'], ['hola', 'diego', 'como', 'estas'], {})
                    let objWithoutOAndEstas = R.assocPath(['path', 'to', 'text'], ['hula', 'diegi', 'cumu', 'estas'], {})
                    let arr_of_objs_with_o_or_estas = [objWithOAndEstas,  objWithoutOAndEstas]

                    let objWithOAndVives =   R.assocPath(['path', 'to', 'text'], ['hola', 'diego', 'como', 'vives'], {})
                    let objWithoutOAndVives = R.assocPath(['path', 'to', 'text'], ['hula', 'diegi', 'cumu', 'vives'], {})
                    let arr_of_objs_with_o_or_vives = [objWithOAndVives,  objWithoutOAndVives]

                    let obj1 = R.assocPath(['path', 'to', 'array'], arr_of_objs_with_o_or_estas, {})
                    let obj2 = R.assocPath(['path', 'to', 'array'], arr_of_objs_with_o_or_vives, {}) 
                    let main_array = [obj1,obj2]

                     expect(objArrayTextFilter(['path', 'to', 'array'], ['path', 'to', 'text'], 'estas', main_array)).to.eql([obj1])
                     expect(objArrayTextFilter(['path', 'to', 'array'], ['path', 'to', 'text'], 'vives', main_array)).to.eql([obj2])
                     expect(objArrayTextFilter(['path', 'to', 'array'], ['path', 'to', 'text'], 'diego', main_array)).to.eql([obj1, obj2])

                })

               it('returns all the objects in th array if the searched string is an empty string', function() {
                    let objWithOAndEstas =   R.assocPath(['path', 'to', 'text'], ['hola', 'diego', 'como', 'estas'], {})
                    let objWithoutOAndEstas = R.assocPath(['path', 'to', 'text'], ['hula', 'diegi', 'cumu', 'estas'], {})
                    let arr_of_objs_with_o_or_estas = [objWithOAndEstas,  objWithoutOAndEstas]

                    let objWithOAndVives =   R.assocPath(['path', 'to', 'text'], ['hola', 'diego', 'como', 'vives'], {})
                    let objWithoutOAndVives = R.assocPath(['path', 'to', 'text'], ['hula', 'diegi', 'cumu', 'vives'], {})
                    let arr_of_objs_with_o_or_vives = [objWithOAndVives,  objWithoutOAndVives]

                    let obj1 = R.assocPath(['path', 'to', 'array'], arr_of_objs_with_o_or_estas, {})
                    let obj2 = R.assocPath(['path', 'to', 'array'], arr_of_objs_with_o_or_vives, {}) 
                    let main_array = [obj1,obj2]

                    expect(objArrayTextFilter(['path', 'to', 'array'], ['path', 'to', 'text'], '', main_array)).to.eql([obj1, obj2])
                });
            });

            describe('pathHasString: looks for a substring in the given path', function() {
                    it('returns true if the substring is found', function() {
                        let arr = [
                            { 
                                path:  {
                                    my_string: 'hola'
                                }
                            },
                            {
                                path: {
                                    my_string: 'mundo'
                                }
                            }
                        ]
                        expect(R.map(pathHasString(['path', 'my_string'], 'mundo'), arr)).to.eql([false, true])
                });
            });

            describe('stringInPathOfObjArray: searches in an array of objects inside an object that is inside an array. The array should have a spec like this [ {path.to.array:[{path.to.text}]} ]', function() {
                it('returns true if a string is found', function() {
                    let arr = [
                        { 
                            path:  {
                                to_array: [{path_to_prop:'hola'}, {path_to_prop: 'adios'}]
                            }
                        },
                        {
                            path: {
                                to_array: [{path_to_prop:'hola'}, {path_to_prop: 'mundo'}]
                            }
                        }
                    ]
                    expect(stringInPathOfObjArray(['path', 'to_array'], ['path_to_prop'], 'mundo', arr[0])).to.eql(false)
                    expect(stringInPathOfObjArray(['path', 'to_array'], ['path_to_prop'], 'mundo', arr[1])).to.eql(true)
                    expect(R.map(stringInPathOfObjArray(['path', 'to_array'], ['path_to_prop'], 'mundo'), arr)).to.eql([false, true])
                });
            });

            describe('substringInStringArray: searches for a substring in an array of strings', function() {
                  it('returns true if a substring is found', function() {
                        let arr = [
                              {
                                  path: ['has', 'hat']
                              },
                              {
                                  path: ['has', 'house']
                              }
                          ]
                          expect( substringInStringArray(['path'],'hat', arr[0])).to.eql(true)
                      });
            });

            describe('multiTextFilter: delegates filtering functions to some of the filters described above, nameley: objTextFilter, objArrayTextFilter, and stringArrayTextFilter', function() {
                it(`FilterBy [{path: [], type: 'isPath' || 'isPathInObjArray' || 'isStringArray', filter_by: FilterBy*}] -> TextSearch -> [{*}] -> [{*}]
                    * la propiedad filter_by es requerida solo cuando se trata de un busqueda de tipo 'isPathInObjArray', puesto que este puede anidar objetos de distintos tipos`, function() {
                    let obj1 =  {
                        is_path: 'soy un path',
                        is_string_array: ['hola', 'diego', 'como', 'estas'],
                        is_path_in_obj_array: [ {path2: 'woooo'} ]
                    }

                    let obj2 = {
                        is_path: 'soy otro path',
                        is_string_array: ['hulu', 'diegu', 'cumu', 'vives'],
                        is_path_in_obj_array: [ {path2: 'wuuuuu'} ]
                    }

                    let main_array = [obj1, obj2]

                    let list_of_filter_specs = {
                        specs_for_path: [{
                            path: ['is_path'],
                            type: 'isPath'
                        }],
                        specs_for_string_array: [{
                            path: ['is_string_array'],
                            type: 'isStringArray'  
                        }],
                        specs_for_path_in_obj_array: [{
                            path: ['is_path_in_obj_array'],
                            type: 'isPathInObjArray',
                            path_to_text: ['path2']
                        }]
                    }

                    expect(multiTextFilter(list_of_filter_specs.specs_for_path, 'soy un path', main_array)).to.eql([obj1])
                    expect(multiTextFilter(list_of_filter_specs.specs_for_string_array, 'hulu', main_array)).to.eql([obj2])
                    expect(multiTextFilter(list_of_filter_specs.specs_for_path_in_obj_array, 'wuuu', main_array)).to.eql([obj2])

                });

                it(`can search on more than one place at a time, via the spec array`, function() {
                    let obj1 =  {
                        is_path: 'soy un path',
                        is_string_array: ['hola', 'diego', 'como', 'estas'],
                        is_path_in_obj_array: [ {path2: 'woooo'} ]
                    }

                    let obj2 = {
                        is_path: 'soy otro path',
                        is_string_array: ['hulu', 'diegu', 'cumu', 'vives'],
                        is_path_in_obj_array: [ {path2: 'wuuuuu'} ]
                    }

                    let obj3 =  {
                        is_path: 'soy un path',
                        is_string_array: ['hola', 'diego', 'como', 'estas', 'wuuuu'],
                        is_path_in_obj_array: [ {path2: 'woooo'} ]
                    }

                    let main_array = [obj1, obj2, obj3]

                    let list_of_filter_specs = {
                        specs_for_path_in_obj_array_or_string_array: [
                            {
                                path: ['is_path_in_obj_array'],
                                type: 'isPathInObjArray',
                                path_to_text: ['path2']
                            },
                            {
                                path: ['is_string_array'],
                                type: 'isStringArray'                            
                            }
                        ]
                    }

                    expect(multiTextFilter(list_of_filter_specs.specs_for_path_in_obj_array_or_string_array, 'wuuu', main_array)).to.eql([obj2, obj3])

                });

                it(`can search on more than one place at a time, via the spec array, same version but for our case BB`, function() {
                    let obj1 =  {
                        buddy: {name: 'woooo'},
                        volunteer: null
                    }

                    let obj2 = {
                        volunteer:  {name: 'wuuuuu'},
                        buddy: null
                    }

                    let obj3 =  {
                        volunteer:  {name: 'woooo'},
                        buddy: null
                    }

                    let main_array = [obj1, obj2, obj3]

                    let list_of_filter_specs = {
                        name: [
                            {
                                path: ['buddy', 'name'],
                                type: 'isPath',
                                path_to_text: ['path2']
                            },
                            {
                                path: ['volunteer', 'name'],
                                type: 'isPath'                            
                            }
                        ]
                    }

                    expect(multiTextFilter(list_of_filter_specs.name, 'wuuu', main_array)).to.eql([obj2])
                    expect(multiTextFilter(list_of_filter_specs.name, 'woooo', main_array)).to.eql([obj1, obj3])

                });
            })
            
            describe('multiTextFilter2: delegates filtering functions to some of the filters described above, nameley: objTextFilter, objArrayTextFilter, and stringArrayTextFilter', function() {
                it(`FilterBy [{path: [], type: 'isPath' || 'isPathInObjArray' || 'isStringArray', filter_by: FilterBy*}] -> TextSearch -> [{*}] -> [{*}]
                    * la propiedad filter_by es requerida solo cuando se trata de un busqueda de tipo 'isPathInObjArray', puesto que este puede anidar objetos de distintos tipos`, function() {

                    let obj1 =  {
                        is_path: 'soy un path',
                        is_string_array: ['hola', 'diego', 'como', 'estas'],
                        is_path_in_obj_array: [ {path2: 'woooo'} ]
                    }

                    let obj2 = {
                        is_path: 'soy otro path',
                        is_string_array: ['hulu', 'diegu', 'cumu', 'vives'],
                        is_path_in_obj_array: [ {path2: 'wuuuuu'} ]
                    }

                    let main_array = [obj1, obj2]


                    let isPath = pathHasString(['is_path'])
                    let isStringArray = substringInStringArray(['is_string_array'])
                    let isPathInObjArray = stringInPathOfObjArray(['is_path_in_obj_array'], ['path2'])

            

                    expect(multiTextFilter2([isPath], 'soy un path', main_array)).to.eql([obj1])
                    expect(multiTextFilter2([isStringArray], 'hulu', main_array)).to.eql([obj2])
                    expect(multiTextFilter2([isPathInObjArray], 'wuuu', main_array)).to.eql([obj2])

                });

                it(`can search on more than one place at a time, via the spec array`, function() {
                    let obj1 =  {
                        is_path: 'soy un path',
                        is_string_array: ['hola', 'diego', 'como', 'estas'],
                        is_path_in_obj_array: [ {path2: 'woooo'} ]
                    }

                    let obj2 = {
                        is_path: 'soy otro path',
                        is_string_array: ['hulu', 'diegu', 'cumu', 'vives'],
                        is_path_in_obj_array: [ {path2: 'wuuuuu'} ]
                    }

                    let obj3 =  {
                        is_path: 'soy un path',
                        is_string_array: ['hola', 'diego', 'como', 'estas', 'wuuuu'],
                        is_path_in_obj_array: [ {path2: 'woooo'} ]
                    }

                    let main_array = [obj1, obj2, obj3]

                    let findWooo = [
                        substringInStringArray(['is_string_array']),
                        stringInPathOfObjArray(['is_path_in_obj_array'], ['path2'])
                    ]

                    expect(multiTextFilter2(findWooo, 'wooo', main_array)).to.eql([obj1, obj3])

                });

                it(`can search on more than one place at a time, via the spec array, same version but for our case BB`, function() {
                    let obj1 =  {
                        buddy: {name: 'woooo'},
                        volunteer: null
                    }

                    let obj2 = {
                        volunteer:  {name: 'wuuuuu'},
                        buddy: null
                    }

                    let obj3 =  {
                        volunteer:  {name: 'woooo'},
                        buddy: null
                    }

                    let main_array = [obj1, obj2, obj3]

                    let names = [
                        pathHasString(['buddy', 'name']),
                        pathHasString(['volunteer', 'name']),
                    ]

                    expect(multiTextFilter2(names, 'wuuu', main_array)).to.eql([obj2])
                    expect(multiTextFilter2(names, 'woooo', main_array)).to.eql([obj1, obj3])

                });
            })
        });

});
