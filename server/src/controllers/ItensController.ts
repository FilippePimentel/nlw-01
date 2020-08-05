import knex from '../database/connection'
import express, { Request, Response } from 'express';

class ItensController {
 async index (request: Request, response: Response){
    const itens = await knex('itens').select('*');

    const serializedItems = itens.map(item => {
        return {
            id: item.id,
            titulo: item.titulo,
            imagem_url: 'http://192.168.0.107:3333/uploads/' + item.imagem,
        }
    });

    
    return response.json(serializedItems);
 }
}

export default ItensController;