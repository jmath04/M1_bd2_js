import 'dotenv/config';
import fs from 'fs/promises' 
import { Sequelize, Op, DataTypes, JSONB } from 'sequelize';
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

const rl = createInterface({ input, output });

function pergunta(texto) {
    return new Promise((resolve) => {
        rl.question(texto, (resposta) => {
            resolve(resposta.trim());
        });
    });
}


const sequelize = new Sequelize('testes_BD2', process.env.USER_DB, process.env.SENHA, {
  host: process.env.IP, 
  dialect: "mysql"
});

const people = sequelize.define(
    'people',
    {
        'index': {type: DataTypes.INTEGER, primaryKey: true, field:'index'},
        'userID': {type: DataTypes.STRING, field: 'user_id'},
        'firstName': {type: DataTypes.STRING, field: 'first_name'},
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

jobs.hasMany(people,{foreignKey:'job_ID'});
people.belongsTo(jobs, {foreignKey:'job_ID'});

await sequelize.sync({force:true});


async function iniciarMigracao() {

    const data = await fs.readFile("people-100000.csv", "utf8");
    
    const linhas = data.split("\n").slice(1); 

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
        dateOfBirth : colunas[7],
        jobTitle : colunas[8]
      };
    }).filter(p => p.nome); 

    console.log(" Migração concluída com sucesso!");

    return registrosParaInserir;
}

async function insereJobFINDORCREATE(jobNome){
    const [job, created] = await jobs.findOrCreate({
        where: { jobTitle: jobNome },
        defaults: { jobTitle: jobNome }
    });
    return job.jobID;  
}

async function insereJob(jobNome){   
    let result = await jobs.findAll({
        attributes: ['jobTitle','jobID']
    });
    
    for( let i = 0; i < result.length; i++){
        if (jobNome === result[i].dataValues.jobTitle){
            return result[i].dataValues.jobID;
        }
    }
    let newJob = await jobs.create({
    jobTitle: jobNome
    })
    return newJob.dataValues.jobID;
};

async function inserePeople(pessoa){
    await people.create({
        index: pessoa.index,
        userID: pessoa.id,
        firstName: pessoa.nome,
        lastName: pessoa.sobrenome,
        sex: pessoa.sex,
        email : pessoa.email,
        phone : pessoa.phone,
        dateOfBirth: pessoa.dateOfBirth,
        jobID: pessoa.jobTitle
    })
}

function mostraTabela(tabela){
    const tabularData = tabela.map(result => result.get({plain:true}));
    console.table(tabularData);
};

async function mostraJobs(){
  let result = await jobs.findAll();
  mostraTabela(result);
}

async function JOIN(listaDePessoas) {

    const resultadoExibicao = listaDePessoas.map(pessoa => {
        const p = pessoa.get({ plain: true });
        
        const dadosDoJob = p.job; 

        return {
            index: p.index,
            userID: p.userID,
            firstName: p.firstName,
            lastName: p.lastName,
            sex: p.sex,
            email: p.email,
            phone: p.phone,
            dateOfBirth: p.dateOfBirth,
            // Pegando os dados de dentro do include 'job'
            jobID: dadosDoJob ? dadosDoJob.jobID : 'N/A',
            jobTitle: dadosDoJob ? dadosDoJob.jobTitle : 'Sem cargo'
        };
    });

    console.table(resultadoExibicao);
}

async function mostraPeople(){
  let result = await people.findAll();
  mostraTabela(result);
}


async function populaTabela(tabela){
    for( let i = 0; i < tabela.length; i++){
        tabela[i].index = tabela[i].index.replace(/"/g,'');
        tabela[i].index = parseInt(tabela[i].index);
        tabela[i].jobTitle = tabela[i].jobTitle.replace(/"/g,'');
        tabela[i].jobTitle = tabela[i].jobTitle.replace(/\r/g,'');
        let title = await insereJobFINDORCREATE(tabela[i].jobTitle);
        tabela[i].jobTitle = title;
        inserePeople(tabela[i]);
    }
}


async function ByName() {
    const term = await pergunta("Digite o nome para buscar:");
    
    let results = await people.findAll({
        where: {
            [Op.or]: [
                { firstName: { [Op.like]: `%${term}%` } },
                { lastName: { [Op.like]: `%${term}%` } }
            ]
        },
        include: [jobs] 
    });

    if (results.length > 0) {
        mostraTabela(results);
    } else {
        console.log("Nenhum registro encontrado para este nome.");
    }
    return;
}

async function ByJob() {
    const term = await pergunta("Digite o cargo para buscar:");
    let results = await people.findAll({
        include: {
            model: jobs,
            attributes: ['jobID','jobTitle'],
            where: {
                jobTitle: { [Op.like]: `%${term}%` }
            }
        }
    });

    if (results.length > 0) {
        //console.log(results);
        JOIN(results);
    } else {
        console.log("Nenhum registro encontrado para este cargo.");
    }
}

async function main() {

    while (true) {

        console.log("\n1 - Buscar por nome");
        console.log("2 - Buscar por trabalho");
        console.log("0 - Sair");

        const opcao = await pergunta("Escolha uma opção: ");

        if (opcao === '0') {
            console.log("Encerrando...");
            rl.close();
            process.exit(0);
        }

        if (opcao === '1') {
            await ByName();
        }

        else if (opcao === '2') {
            await ByJob();
        }

        else {
            console.log("Opção inválida.");
        }
    }
}

let inputs = await iniciarMigracao();

await populaTabela(inputs);

await main();