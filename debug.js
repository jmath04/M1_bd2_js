require('dotenv').config();
const fs = require('fs').promises; // Use .promises para poder usar await
const { Sequelize, Op, DataTypes } = require('sequelize');

const sequelize = new Sequelize('testes_BD2', process.env.USER_DB, process.env.SENHA, {
  host: process.env.IP, 
  dialect: "mysql"
});

const people = sequelize.define(
    'people',
    {
        'index': {type: DataTypes.INTEGER, primaryKey: true, field:'index'},
        'userID': {type: DataTypes.STRING, field: 'user_id'},
        'firstName': {type: DataTypes.STRING, field: 'frist_name'},
        'lastName': {type: DataTypes.STRING, field:'last_name'},
        'sex': {type: DataTypes.STRING, field:'sex'},
        'email': {type: DataTypes.STRING, field:'email'},
        'phone': {type: DataTypes.STRING, field:'phone'},
        'dateOfBirth': {type: DataTypes.DATE, field:'date_of_birth'},
        'jobTitle' : {type: DataTypes.STRING, field: 'job_title'}
    }
);

async function rodarTeste() {
  try {
    await sequelize.sync({alter:true})
    const CSV = await fs.readFile("people-100000.csv", "utf8");
    console.log("Conteúdo lido.");
    console.log(CSV)
    
  } catch (err) {
    console.error("Erro ao ler arquivo:", err);
  }
}

rodarTeste();
