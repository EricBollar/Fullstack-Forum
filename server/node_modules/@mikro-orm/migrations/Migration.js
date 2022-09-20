"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration = void 0;
class Migration {
    constructor(driver, config) {
        this.driver = driver;
        this.config = config;
        this.queries = [];
    }
    async down() {
        throw new Error('This migration cannot be reverted');
    }
    isTransactional() {
        return true;
    }
    addSql(sql) {
        this.queries.push(sql);
    }
    reset() {
        this.queries.length = 0;
        this.ctx = undefined;
    }
    setTransactionContext(ctx) {
        this.ctx = ctx;
    }
    async execute(sql) {
        return this.driver.execute(sql, undefined, 'all', this.ctx);
    }
    getKnex() {
        return this.driver.getConnection('write').getKnex();
    }
    getQueries() {
        return this.queries;
    }
}
exports.Migration = Migration;
