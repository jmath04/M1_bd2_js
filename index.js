require('dotenv').config({overide: true});
const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)
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
    let resultado = tabela.map((item) => item.dataValues);
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
    await City.findAll(
        {attributes: ['city_id', 'city', 'country_id', 'last_update']},
        {include: {
            model: Country,
            attributes: ['country_id', 'country', 'last_update']
        }}
    ).then((result) => {
        mostraTabela(result);
    });
};

async function retornaCountry(){
    await Country.findAll().then((result) => {
        mostraTabela(result);
    });
};

//retornaAddress();
//retornaCity();
//retornaCountry();

async function main() {
    while (true) {
        await new Promise((resolve) => {
            readline.question("\nDigite a tabela (address, city, country) ou 'sair': ", async (tabela) => {
                if (tabela.toLowerCase() === 'sair') {
                    console.log("Encerrando...");
                    readline.close();
                    process.exit(0);
                } else if (tabela === 'address') {
                    await retornaAddress();
                } else if (tabela === 'city') {
                    await retornaCity();
                } else if (tabela === 'country') {
                    await retornaCountry();
                } else {
                    console.log("Opção inválida.");
                }
                resolve();
            });
        });
    }
}

main();
