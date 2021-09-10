const mysql = require("mysql");
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodedb'
    
});

connection.connect((error)=>{
    if(error){
        console.log('Errore in coneczione: ' + error);
        return;
    }
    console.log("Coneczione Correcta");

});

module.exports = connection; //para no tener que setear nuevamente, utilixzar mas adelante


