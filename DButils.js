const ConnectionPool = require('tedious-connection-pool');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

var poolConfig = {
    min: 2,
    max: 5,
    log: true
};
const connectionconfig =
    {
        userName: 'group1101',
        password: 'AviElad308',
        server: 'assignment3webdevstudents.database.windows.net',
        options:
            {
                database: 'Assignment3db'
                , encrypt: true
            }
    };

var pool = new ConnectionPool(poolConfig, connectionconfig);
pool.on('error', function (err) {
    if (err) {
        console.log(err);

    }
});
console.log('connection on');

exports.execQuery = function (query) {
    return new Promise(function (resolve, reject) {
        try {
            var ans = [];
            var properties = [];

            //acquire a connection
            pool.acquire(function (err, connection) {
                if (err) {
                    console.log('acquire ' + err);
                    reject(err);
                }
                console.log('connection on');

                var dbReq = new Request(query, function (err, rowCount) {
                    if (err) {
                        console.log('Request ' + err);
                        reject(err);
                    }
                });

                dbReq.on('columnMetadata', function (columns) {
                    columns.forEach(function (column) {
                        if (column.colName != null)
                            properties.push(column.colName);
                    });
                });
                dbReq.on('row', function (row) {
                    var item = {};
                    for (i = 0; i < row.length; i++) {
                        item[properties[i]] = row[i].value;
                    }
                    ans.push(item);
                });

                dbReq.on('requestCompleted', function () {
                    console.log('request Completed: ' + dbReq.rowCount + ' row(s) returned');
                    console.log(ans);
                    connection.release();
                    resolve(ans);

                });
                connection.execSql(dbReq);

            });
        }
        catch (err) {
            reject(err)
        }
    });

};
