import express, { response, request } from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import {errors} from 'celebrate';

const app = express();

app.use(cors(
//{origin: 'www.frontend.com'}
));
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

app.listen(3333);

/*PARA ABRIR O BANCO DE DADOS CTRL + SHIFT + P -> OPEN DATA BASE DEPOIS DE TER INSTALADO O SQLITE */

/*const users = ['Filippe' , 'Flamengo'];

app.get('/users',(request,response) => {
const search =String( request.query.search);

const filteredUsers = search ? users.filter(user => user.includes(search)) : users;

response.json(filteredUsers);
});

app.get('/users/:id',(request,response)=>{
const id = Number(request.params.id);

const user = users[id];
return response.json(user);
});

app.post('/users',(request,response)=> {

 const data = request.body;

 console.log(data);

const user = {
    nome: data.nome,
    time: data.time
}
return response.json(user);
});
*/
