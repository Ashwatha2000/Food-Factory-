const result=[
    { food_id: 2, order_price: 140 },
    { food_id: 3, order_price: 140 }
  ];
const req= { '2': 1, '3': 2 };
console.log(Object.keys(req));
for(var i of result){
    console.log(i['food_id'])  
    console.log('j',req[i['food_id']]) 
    console.log(i['food_']* req[i['food_id']])
}
