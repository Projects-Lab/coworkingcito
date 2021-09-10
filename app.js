const express = require('express')
const app = express();
const connection = require('./Basedatos/basedatos');
app.set("view engine", "ejs")

//Capturar datos 
app.use(express.urlencoded({extended:false}));
app.use(express.json());


app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));


//6 -Invocamos a bcrypt
const bcrypt = require('bcryptjs');



//Variables session
const session = require('express-session');
app.use(session({
    secret:"secret",  resave: true,  saveUninitialized:true}));



// Vistas

app.get('/login', (req, res)=>{
    res.render('login.ejs');
})
app.get('/register', (req, res)=>{
    res.render('register.ejs');
})


//Autenticacion

app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcrypt.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM usuarios WHERE user = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "DATOS INCORRECTOS",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: 1500,
                        ruta: 'login'    
                    });				
			} else {         
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Exito",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('DEBE ESCRIBIR DATOS!');
		res.end();
	}
});

//AUTH
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'DEBE INGRESAR',			
		});				
	}
	res.end();
});

//LIMPIA TEMPO
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //SALIR
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});


 ///  CRUD

app.get('/create', (req,res)=>{
    res.render('create');
})

app.get('/index2', (req, res)=>{     
    connection.query('SELECT * FROM clientes',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('index2.ejs', {results:results});            
        }   
    })
})

 ///  EDITAR CRUD
app.get('/edit/:id', (req,res)=>{    
    const id = req.params.id;
    connection.query('SELECT * FROM clientes WHERE id=?',[id] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('edit.ejs', {user:results[0]});            
        }        
    });
});

 ///  ELIMINAR DEL CRUD

app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM clientes WHERE id = ?',[id], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/index2');     
        }
    })
});

app.get('/index2', (req, res)=>{     
   
	connection.query('SELECT * FROM clientes',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('index2', {results:results});            
        }   
    })
})

//const crud = require('./controllers/crud');

//app.post('/save', crud.save);
//app.post('/update', crud.update);


 ///  AÑADIR AL CRUD
app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO usuarios SET ?',{user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
    }else{
        res.render('register', {
            alert: true,
            alertTitle: "Registration",
            alertMessage: "¡Succesful Registration!",
            alertIcon: 'success',
            showConfirmButton:false,
            timer:1500,
            ruta:''
        })
    }

    })
})

//GUARDAR
app.post('/save', async (req, res)=>{
//exports.save = (req, res)=>{
    const id = req.body.id;
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const direccion = req.body.direccion;
    const email = req.body.email;
    const celular = req.body.celular;
    const ciudad = req.body.ciudad;
    const departamento = req.body.departamento;

    connection.query('INSERT INTO clientes SET ?',{id:id, nombres:nombres, apellidos:apellidos, 
        direccion:direccion,   email:email, celular:celular, ciudad:ciudad ,departamento:departamento}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            //console.log(results);   
           res.redirect('/index2');         
        }
	
		});
	});

//ACTUALIZAR 
app.post('/update', async (req, res)=>{
//exports.update = (req, res)=>{
    const id = req.body.id;
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const direccion = req.body.direccion;
    const email = req.body.email;
    const celular = req.body.celular;
    const ciudad = req.body.ciudad;
    const departamento = req.body.departamento;

    connection.query('UPDATE clientes SET ? WHERE id = ?',[{nombres:nombres, apellidos:apellidos, 
        direccion:direccion,   email:email, celular:celular, ciudad:ciudad ,departamento:departamento}, id], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/index2');         
        }
	
	});
});




app.listen(3300, (req, res)=>{
    console.log('SERVER RUNNING /3300');
});

module.exports = app;