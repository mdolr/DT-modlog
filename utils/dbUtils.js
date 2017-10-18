// Removes a row from a table.
module.exports.remove = (db, table, id) => {
    return new Promise((resolve, reject) => {
        __Client.r
            .db(db)
            .table(table)
            .get(id)
            .delete()
            .run(__Client.db)
            .then(resolve)
            .catch(reject);
    });
};

// Inserts a row in a table.
module.exports.insert = (db, table, object) => {
    return new Promise((resolve, reject) => {
        __Client.r
            .db(db)
            .table(table)
            .insert(object)
            .run(__Client.db)
            .then(resolve)
            .catch(reject);
    });
};

// Updates a row in a table.
module.exports.update = (db, table, object) => {
    return new Promise((resolve, reject) => {
        __Client.r
            .db(db)
            .table(table)
            .get(object.id)
            .update(object)
            .run(__Client.db)
            .then(resolve)
            .catch(reject);
    });
};

// Drops a table.
module.exports.tableDrop = (db, table) => {
    return new Promise((resolve, reject) => {
        __Client.r
            .db(db)
            .tableDrop(table)
            .run(__Client.db)
            .then(resolve)
            .catch(reject);
    });
};

// Creates a table.
module.exports.tableCreate = (db, table) => {
    return new Promise((resolve, reject) => {
        __Client.r
            .db(db)
            .tableCreate(table)
            .run(__Client.db)
            .then(resolve)
            .catch(reject);
    });
};


// Gets a row in a table.
module.exports.get = (db, table, id) => {
    return new Promise((resolve, reject) => {
        __Client.r
            .db(db)
            .table(table)
            .get(id)
            .run(__Client.db)
            .then(resolve)
            .catch(reject);
    });
};