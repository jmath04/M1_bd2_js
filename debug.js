import 'dotenv/config';
import fs from 'fs/promises' 
import { Sequelize, Op, DataTypes } from 'sequelize';

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

async function iniciarMigracao() {

    const data = await fs.readFile("people-100000.csv", "utf8");
    
    // Transforma o texto em um array de linhas
    const linhas = data.split("\n").slice(1); 

    console.log(` Processando ${linhas.length} registros...`);

    const registrosParaInserir = linhas.map(linha => {
      const colunas = linha.split(",");
      return {
        index: colunas[0],
        id: colunas[1],
        nome: colunas[2],
        sobrenome: colunas[3],
        sex : colunas[4],
        email : colunas[5],
        phone : colunas[6],
        dateOfBrith : colunas[7],
        jobTitle : colunas[8]
      };
    }).filter(p => p.nome); 

    console.log(" Migração concluída com sucesso!");

    return registrosParaInserir;
}

let inputs = await iniciarMigracao();

console.log(inputs);