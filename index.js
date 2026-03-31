require('dotenv').config({overide: true});
const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)

function pergunta(texto) {
    return new Promise((resolve) => {
        readline.question(texto, (resposta) => {
            resolve(resposta.trim());
        });
    });
}

const {Sequelize , Op, DataTypes, HasMany } = require('sequelize');
const sequelize = new Sequelize('sakila', process.env.USER_DB, process.env.SENHA,{host:process.env.IP, dialect:"mysql"});

const Address = sequelize.define(
    'address',
    {
        'address_id':{type: DataTypes.INTEGER, primaryKey: true},
        'address':{type: DataTypes.STRING},
        'address2':{type: DataTypes.STRING},
        'district':{type: DataTypes.STRING},
        'city_id':{type: DataTypes.INTEGER},
        'postal_code':{type: DataTypes.STRING},
        'phone':{type: DataTypes.STRING},
        location:{type: DataTypes.GEOMETRY('POINT')},
        'last_update':{type: DataTypes.DATE}
    },
    {
        tableName: 'address',
        timestamps: false
    }
);

const City = sequelize.define(
    'city',
    {
        'city_id':{type: DataTypes.INTEGER, primaryKey: true},
        'city':{type: DataTypes.STRING},
        'country_id':{type: DataTypes.INTEGER},
        'last_update':{type: DataTypes.DATE}
    },
    {
        tableName: 'city',
        timestamps: false
    }
);

const Country = sequelize.define(
    'country',
    {
        'country_id':{type: DataTypes.INTEGER, primaryKey: true},
        'country':{type: DataTypes.STRING},
        'last_update':{type: DataTypes.DATE}
    },
    {
        tableName: 'country',
        timestamps: false
    }
);
Country.hasMany(City, {foreignKey: 'country_id'});
City.belongsTo(Country, {foreignKey: 'country_id'});
City.hasMany(Address, {foreignKey: 'city_id'});
Address.belongsTo(City, {foreignKey: 'city_id'});


function mostraTabela(tabela){
    let resultado = tabela.map((item) => {
        const data = item.dataValues;

        if (data.address_id !== undefined) {
            let cidade = null;
            let pais = null;

            if (data.city) {
                cidade = data.city.city;

                if (data.city.country) {
                    pais = data.city.country.country;
                }
            }

            return {
                address_id: data.address_id,
                address: data.address,
                city: data.city.city,
                city_id: data.city_id
            };

        }

        if (data.city_id !== undefined) {
            let pais = null;

            if(data.country) {
                pais = data.country.country;
            }

            return {
                city_id: data.city_id,
                city: data.city,
                country: pais,
                country_id: data.country_id
            }; 

        }

        if (data.country_id !== undefined) {
            return {
                country_id: data.country_id,
                country: data.country
            };
        }

        return {}; 
            
    });
    
    console.table(resultado);
};

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

async function retornaCity(){
    await City.findAll({
        attributes: ['city_id', 'city', 'country_id', 'last_update'],
        include: {
            model: Country,
            attributes: ['country_id', 'country', 'last_update']
        }
    }).then((result) => {
        mostraTabela(result);
    });
};

async function retornaCountry(){
    await Country.findAll().then((result) => {
        mostraTabela(result);
    });
};

async function criaCountry() {
    const nome = await pergunta("Nome do país: ");

        if (!nome) {
        console.log("Nome inválido!");
        return;
    }

    const existente = await Country.findOne({
        where: { country: nome }
    });

    if (existente) {
        console.log("País já existe!");
        return;
    }

    await Country.create({
        country: nome,
        last_update: new Date()
    });

    console.log("País criado!");
}

async function criaCity() {

    const nomeCidade = await pergunta("Nome da cidade: ");
    const nomePais = await pergunta("Nome do país: ");

    if (!nomeCidade || !nomePais) {
        console.log("Dados inválidos!");
        return;
    }

    const pais = await Country.findOne({
        where: { country: nomePais }
    });

    if (!pais) {
        console.log("País não existe! Deseja criar? (s/n)");
        const resposta = await pergunta("Resposta: ");
        if (resposta === 's') {
            await criaCountry();
        } else {
            console.log("Operação cancelada.");
            return;
        }
    }

    const existente = await City.findOne({
        where: { city: nomeCidade }
    });

    if (existente) {
        console.log("Cidade já existe!");
        return;
    }

    await City.create({
        city: nomeCidade,
        country_id: pais.country_id,
        last_update: new Date()
    });

    console.log("Cidade criada!");
}

async function criaAddress(params) {

    const endereco = await pergunta("Endereço: ");
    const nomeCidade = await pergunta("Nome da cidade: ");

    if (!endereco || !nomeCidade) {
        console.log("Dados inválidos!");
        return;
    }

    const cidade = await City.findOne({
        where: { city: nomeCidade }
    });

    if (!cidade) {
        console.log("Cidade não existe! Deseja criar? (s/n)");
        const resposta = await pergunta("Resposta: ");
        if (resposta === 's') {
            await criaCity();
        } else {
            console.log("Operação cancelada.");
            return;
        }
    }

    const existente = await Address.findOne({
        where: { address: endereco }
    });

    if (existente) {
        console.log("Endereço já existe!");
        return;
    }

    await Address.create({
        address: endereco,
        district: "Centro",
        city_id: cidade.city_id,
        last_update: new Date()
    });

    console.log("Endereço criado!");
}

/*
PARTE 2

MAPEAR AS TABELAS -- Acredito que MySQL o nome das tabelas será Jobs -- People 
const Job = sequelize.define(
    'Job',
    {
        'JobTitle':{type: DataTypes.STRING, unique: true},
    },
    {
        tableName: 'Jobs',
        timestamps: false
    }
);

const Persona = sequelize.define(
    'Persona',
    {
        'csv_index': {type: DataTypes.INTEGER}, //N tenho certeza se precisa -- N pensei ainda como vamos fazer a concersao do csv para mysql
        'user':{type: DataTypes.STRING},
        'first_name':{type: DataTypes.STRING},
        'last_name':{type: DataTypes.STRING},
        'sex':{type: DataTypes.STRING},
        'email':{type: DataTypes.STRING},
        'phone':{type: DataTypes.STRING},
        'date_birth':{type: DataTypes.DATEONLY}
    },
    {
        tableName: 'People',
        timestamps: false
    }
);
Job.hasMany(Persona, {foreignKey: 'job_id'});
Persona.belongsTo(Job, {foreignKey: 'job_id'});
*/

/*
BUSCAR_NOME

async function ByName(){
    const temp = await pergunta("Nome a ser procurado:");
    let res_temp = await Persona.findAll({
        where: {
            [Op.or]:[
                {first_name: {[Op.like]:`%${temp}%`}},
                {last_name: {[Op.like]:`%${temp}%`}}
            ]
        },
        include: [Job]
    });
    if (res_temp.length){
        //funcaoMOSTRAR 
    }else{
        console.log ("S/ Registro")
    }
}
*/

/*Possivel main () - Juntar PT1 e PT2
async function main() {
    while (true) {    
        console.log("\n====== TRABALHO BANCO DE DADOS ======");
        console.log("1 - PARTE 1 (Sakila)");
        console.log("2 - PARTE 2 (People.csv)");
        console.log("0 - Sair");

        const op_main = await pergunta("Escolha uma opção: ");
        
        if (op_main === '0') break;
        
        if (principal === '1') {
            console.log("\n[PARTE 1] 1-Listar | 2-Inserir"); 
            const op = await pergunta("Opção: "); 

            if (op === '1') { 
                const tabela = await pergunta("Qual tabela (address, city, country): ");
                if (tabela === 'address') {
                    await retornaAddress();
                } else if (tabela === 'city') {
                    await retornaCity();
                } else if (tabela === 'country') {
                    await retornaCountry();
                } else {
                    console.log("Tabela inválida.");
                }
            } 
            else if (op === '2') { 
                const tabela = await pergunta("Inserir em qual (country, city, address): ");
                if (tabela === 'country') {
                    await criaCountry();
                } else if (tabela === 'city') {
                    await criaCity();
                } else if (tabela === 'address') {
                    await criaAddress();
                } else {
                    console.log("Opção inválida.");
                }
            }
        } 
        
        else if (op_main === '2') {
            console.log("\n[PARTE 2] 1-Importar CSV | 2-Buscar Nome | 3-Buscar Job"); 
            const op2 = await pergunta("Opção: ");
            if (op2 === '1') {
                FuncaoX
            } else if (op2 === '2') {
                FuncaoY
            } else if (op2 === '3') {
                FuncaoM
            } else {
                console.log("Opção inválida.");
            }
        }
    }
}
*/

async function main() {

    while (true) {

        console.log("\n1 - Listar dados");
        console.log("2 - Inserir dados");
        console.log("0 - Sair");

        const opcao = await pergunta("Escolha uma opção: ");

        if (opcao === '0') {
            console.log("Encerrando...");
            readline.close();
            process.exit(0);
        }

        if (opcao === '1') {

            const tabela = await pergunta("Qual tabela (address, city, country): ");

            if (tabela === 'address') {
                await retornaAddress();
            } else if (tabela === 'city') {
                await retornaCity();
            } else if (tabela === 'country') {
                await retornaCountry();
            } else {
                console.log("Tabela inválida.");
            }
        }

        else if (opcao === '2') {

            const tabela = await pergunta("Inserir em qual (country, city, address): ");

            if (tabela === 'country') {
                await criaCountry();
            } else if (tabela === 'city') {
                await criaCity();
            } else if (tabela === 'address') {
                await criaAddress();
            } else {
                console.log("Opção inválida.");
            }
        }

        else {
            console.log("Opção inválida.");
        }
    }
}
main();
