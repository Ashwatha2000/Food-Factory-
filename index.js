var express = require("express");
const mysql = require("mysql");
const query = require('./raw_query');
const bcrypt = require('bcryptjs');
const { initializeDB , db} = require('F:/food_factory_app/lib/db.js');
const orderList=[];
let email="";

var app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.all('/',(req,res) => { 
    res.sendFile('F:/food_factory_app/views/signin.html');
})
app.all('/home',(req,res) => { 
  res.sendFile('F:/food_factory_app/views/home.html');
})
app.all('/checkout',(req,res) => { 
  res.sendFile('F:/food_factory_app/views/checkout.ejs');
})
app.all('/login',(req,res) => {
    res.sendFile('F:/food_factory_app/views/login.html');
})
app.all('/order',(req,res) => {
  res.sendFile('F:/food_factory_app/views/order.html');
})

app.post('/signin',async (req,res) => { 
    await initializeDB();
    const mail = req.body.uname;
    const password = req.body.pwd;
    result =  await db.sqlServerSequelizeConn.query(
        "SELECT email FROM user_login WHERE email= :mail", {
          type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
          raw: true,
          replacements: {
            mail
          },
        },
      );
    console.log('sign',result)
    if (result.length!=0){
        res.redirect(307,'/login')
    }
    else{
        console.log('enter')
        bcrypt.genSalt(10, async function (err, Salt) {
            // The bcrypt is used for encrypting password.
            bcrypt.hash(password, Salt, async function (err, hash) {
                if (err) {
                    return console.log('Cannot encrypt');
                }
                result =  await db.sqlServerSequelizeConn.query(
                    query.signup, {
                    type: db.sqlServerSequelizeConn.QueryTypes.INSERT,
                    raw: true,
                    replacements: {
                        mail, hash
                    },
                    },
                );
                
                // hashedPassword = hash;
                console.log('sign',hash);
            })
        })
        console.log('sign',mail,password);
        res.send("Signed in");
    }
});

app.post('/login-post',async (req,res) => { 
    await initializeDB();
    const mail = req.body.mail;
    const password = req.body.pass;
    email=mail;
    result =  await db.sqlServerSequelizeConn.query(
        "SELECT password FROM user_login WHERE email= :mail", {
          type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
          raw: true,
          replacements: {
            mail
          },
        },
      );
    if (result){
      const validPassword = await bcrypt.compare(password,result[0].password);
      if (validPassword){
        console.log("Valid:",validPassword);
        res.redirect(307,'/home');
      }
      else{
        res.send("Wrong password. Try again.")
      }
    }
});

app.post('/deactivate-user',async (req,res) => {
    await initializeDB();
    const mail= req.body.mail
    const password = req.body.pass
    result =  await db.sqlServerSequelizeConn.query(
        "SELECT password FROM user_login WHERE email= :mail", {
          type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
          raw: true,
          replacements: {
            mail
          },
        },
      );
    console.log('log',result)
    bcrypt.compare(password, result[0].password,
        async function (err, isMatch) {
        if (isMatch) {
            console.log('Encrypted password is: ', password);
            console.log('Decrypted password is: ', result[0].password);
            await db.sqlServerSequelizeConn.query(
                "DELETE FROM user_login WHERE email= :mail", {
                  type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
                  raw: true,
                  replacements: {
                    mail
                  },
                },
              );  
        }
        if (!isMatch) {
            res.send("Failed")
        }
    })
    res.send("Deleted User");
});

app.post('/create-order',async (req,res) => {
  await initializeDB();
  console.log("-----------------------------------------",email);
  orderList.push(parseInt(req.body[Object.keys(req.body)]));
  console.log(req.body[Object.keys(req.body)]);
  console.log("order",orderList);
});

app.get('/checkout-cart',async (req,res) => {
  let cartTotal=0;
  let ts=Date.now();
  let date_obj=new Date(ts);
  let date= date_obj.getFullYear()+ "-" + (date_obj.getMonth()+1) + "-" + date_obj.getDate();
  console.log("date",date)
  console.log(orderList);
  await initializeDB();
  result =  await db.sqlServerSequelizeConn.query(
    query.userHistory, {
    type: db.sqlServerSequelizeConn.QueryTypes.INSERT,
    raw: true,
    replacements: {
        email, orderList,date
    },
    },
  );
  result =  await db.sqlServerSequelizeConn.query(
    `SELECT food_id,order_price FROM food WHERE food_id in (${orderList}) `, {
    type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
    raw: true,
    }
  );
  console.log("result",result);
  count_ids = orderList.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
  for(var i of result){
    cartTotal += i['order_price'] * count_ids[i['food_id']];
  }
  console.log("req",cartTotal);
  console.log("order",orderList);
  res.render("views/checkout.ejs",cartTotal);
  // res.redirect(307,"/checkout")
});

app.get('/history-user',async (req,res) => {
  await initializeDB();
  result =  await db.sqlServerSequelizeConn.query(
    `SELECT order_list,order_date FROM order_history WHERE order_mail='${email}' `, {
    type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
    raw: true,
    }
  );
  console.log(result);
  res.send(result);
});

app.get('/ing-count',async (req,res) => {
  await initializeDB();
  result =  await db.sqlServerSequelizeConn.query(
    `SELECT prod_id,prod_name,quantity FROM ing_quantity WHERE quantity <= 10 `, {
    type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
    raw: true,
    })
  res.send(result);
  });

app.get('/vendor',async (req,res) => {
  await initializeDB();
  result =  await db.sqlServerSequelizeConn.query(
    `SELECT prod_id,prod_name,vendor FROM ing_quantity WHERE vendor ='KAV store' `, {
    type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
    raw: true,
    }
  );
  console.log(result);
  res.send(result);
});
app.get('/cost-prod',async (req,res) => {
  await initializeDB();
  result =  await db.sqlServerSequelizeConn.query(
    `SELECT food_id,food_name FROM food WHERE cost_prod > order_price `, {
    type: db.sqlServerSequelizeConn.QueryTypes.SELECT,
    raw: true,
    }
  );
  console.log(result);
  res.send(result);
});

app.listen(8010, () => console.log('Hello world app listening on port}!'))
