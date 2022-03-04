const create_user = `INSERT INTO user_login (email,password)
VALUES (:mail, :hash)`;
const create_order = `INSERT INTO order_history(order_mail, 
order_list, order_date) VALUES (:email,
'[:orderList]',:date)`;

module.exports ={
    signup: create_user,
    userHistory: create_order
};