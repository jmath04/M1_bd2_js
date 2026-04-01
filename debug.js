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
        'jobID' : {type: DataTypes.STRING, field: 'job_ID'}
    }
);
const jobs = sequelize.define(
  'jobs',
  {
    'jobID': {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field:'job_ID'},
    'jobTitle': {type: DataTypes.STRING, field:'job_Title'}
  }
);

people.hasMany(jobs,{foreingkey:'job_ID'});

await sequelize.sync({force:true});


async function iniciarMigracao() {

    const data = await fs.readFile("people-100000.csv", "utf8");
    
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

async function insereJob(jobNome){
    jobs.create({
      jobTitle: jobNome
    })
};

function mostraTabela(tabela){
    const tabularData = tabela.map(result => result.get({plain:true}));
    console.table(tabularData);
};

async function mostraJobs(){
  let result = await jobs.findAll();
  mostraTabela(result);
}
async function retornaAddress(){
    const result =  await Address.findAll(
        {include: {
            model: City,
            include: {
                model: Country
            }
        }}
    );
    mostraTabela(result);
};

async function populaTabela(tabela){
    for( let i = 0; i < tabela.length; i++){
        tabela[i].index = tabela[i].index.replace(/"/g,'');
        tabela[i].index = parseInt(tabela[i].index);
        tabela[i].jobTitle = tabela[i].jobTitle.replace(/""/g,'');
        await insereJob(tabela[i].jobTitle);
        tabela[i].jobTitle = i;
        console.log(tabela[i]);
        break;
    }
    mostraJobs();
}



populaTabela(inputs);