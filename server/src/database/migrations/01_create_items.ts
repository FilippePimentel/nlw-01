import Knex from 'knex';

export async function up(knex: Knex) {
    // Cria tabela
    return knex.schema.createTable('itens', table => {
        table.increments('id').primary();
        table.string('imagem').notNullable();
        table.string('titulo').notNullable();
    });
}
export async function down(knex: Knex) {
    // Volta atrás
    return knex.schema.dropTable('itens');
}