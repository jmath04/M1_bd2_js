const {Sequelize , Op, DataTypes, HasMany } = require('sequelize');
const senha = '';
const user = 'root';
const ip = 'localhost';
const sequelize = new Sequelize('sakila', user, senha,{host:ip, dialect:"mysql"});

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

retornaAddress();

