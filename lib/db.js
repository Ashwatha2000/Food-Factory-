const { Sequelize } = require('sequelize');
const db ={}
exports.initializeDB = async () =>{
const sqlServerSequelizeConn = new Sequelize('test', 'root','', {
    host: 'localhost',
    port : 3306,
    pool: {
        max: 2,
        min: 1,
    },
    dialect: 'mysql',
});
db.Sequelize = Sequelize;
  db.sqlServerSequelizeConn = sqlServerSequelizeConn;
};
exports.deInitializeDb = async () => {
    if (db.sqlServerSequelizeConn) {
       await db.sqlServerSequelizeConn.close();
    }
  
  };
  exports.db = db;