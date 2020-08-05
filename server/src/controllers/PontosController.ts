import knex from '../database/connection';
import express, { Request, Response } from 'express';

class PontosController {

    async index(request: Request, response: Response) {
        const {cidade, uf, itens} = request.query;
    
        const itensArray = String(itens).split(',').map(item => Number(item.trim()));

        const pontos = await knex('pontos')
            .join('pontos_itens','pontos.id', '=', 'pontos_itens.id_ponto')
            .whereIn('pontos_itens.id_item', itensArray)
            .where('cidade', String(cidade))
            .where('uf', String(uf))
            .distinct()
            .select('pontos.*');

         const pontosSerializados = pontos.map(ponto => {
            return {
                ...pontos,
                imagem_url: `http://192.168.0.107:3333/uploads/${ponto.imagem}`,
            };
         }); 

        return response.json(pontosSerializados);
    }

    async show(request: Request, response: Response) {
        //const id = request.params.id
        const { id } = request.params;

        const ponto = await knex('pontos').where('id', id).first();

        if (!ponto) {
            return response.status(400).json({ message: 'Ponto não encontrado.' });
        }

        const pontosSerializados =  {
                ...ponto,
                imagem_url: `http://192.168.0.107:3333/uploads/${ponto.imagem}`
         };

        const itens = await knex('itens')
            .join('pontos_itens', 'itens.id', '=', 'pontos_itens.id_item')
            .where('pontos_itens.id_ponto', id).select('itens.titulo');

        return response.json({ ponto: pontosSerializados, itens });
    }

    async create(request: Request, response: Response) {
        const {
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf,
            itens
        } = request.body;

        const trx = await knex.transaction(); //Amarrar a sessão;
        const ponto = {
            imagem: request.file.filename,
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf
        };
        const id = await trx('pontos').insert(ponto);
        const id_pt = id[0];
        const pointItens = itens
        .split(',')
        .map((item:string)=> Number(item.trim()))
        .map((id_item: number) => {
            return {
                id_ponto: id_pt,
                id_item
            } 
        });

        const id_a = await trx('pontos_itens').insert(pointItens);

        await trx.commit();

        return response.json({ id: id[0], ...ponto });
    };
}

export default PontosController;