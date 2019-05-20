const ConnectionPool = require('tedious-connection-pool');
const DButilsAzure = require('./DButils');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const db =
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
const connect = new Connection(db);