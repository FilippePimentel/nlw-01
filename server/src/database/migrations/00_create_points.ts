import Knex from 'knex';

export async function up(knex: Knex) {
    // Cria tabela
    return knex.schema.createTable('pontos', table => {
        table.increments('id').primary();
        table.string('imagem').notNullable();
        table.string('nome').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('cidade').notNullable();
        table.string('uf', 2).notNullable();
    });
}
export async function down(knex: Knex) {
    // Volta atrás
    return knex.schema.dropTable('pontos');
}