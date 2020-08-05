import Knex from 'knex';

export async function up(knex: Knex) {
    // Cria tabela
    return knex.schema.createTable('pontos_itens', table => {
        table.increments('id').primary();
        table.string('id_ponto').notNullable().references('id').inTable('pontos');
        table.string('id_item').notNullable().references('id').inTable('itens');
    });
}
export async function down(knex: Knex) {
    // Volta atrás
    return knex.schema.dropTable('itens');
}