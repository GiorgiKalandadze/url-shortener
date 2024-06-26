const {MongoClient} = require("mongodb");

class DBManager {
    static async connectToMongo() {
        try {
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            DBManager.setClient(client);
            console.info("### Successfully connected to Mongo");
        } catch (error) {
            console.error("### Error while connecting to Mongo");
            console.error(error);
        }
    }

    static setClient(client) {
        DBManager.client = client;
    }

    static getClient() {
        return DBManager.client;
    }

    static async getAllDatabases() {
        try {
            return await DBManager.client.db().admin().listDatabases();
        } catch (error) {
            throw new Error(`Error retrieving databases: ${error}`);
        }
    }

    static async getAllCollections(databaseName) {
        try {
            return await DBManager.client.db(databaseName).listCollections().toArray();
        } catch (error) {
            throw new Error(`Error retrieving collections: ${error}`);
        }
    }

    static async dropCollection(dbName, collectionName) {
        try {
            await DBManager.client.db(dbName).collection(collectionName).drop();
        } catch (error) {
            throw new Error(`Error dropping collection '${collectionName}': ${error}`);
        }
    }

    static async insertDocument(dbName, collectionName, newDocument) {
        try {
            return await DBManager.client.db(dbName).collection(collectionName).insertOne(newDocument);
        } catch (error) {
            throw new Error(`Error inserting document in collection '${collectionName}': ${error}`);
        }
    }


    static async insertManyDocuments(dbName, collectionName, newDocumentsList) {
        try {
            return await DBManager.client.db(dbName).collection(collectionName).insertMany(newDocumentsList);
        } catch (error) {
            throw new Error(`Error inserting many document in collection '${collectionName}': ${error}`);
        }
    }


    static async getManyDocuments(dbName, collectionName, filter = {}, skip = 0, limit = 20) {
        try {
            const cursor = await DBManager.client.db(dbName).collection(collectionName).find(filter).skip(skip).limit(limit);
            return cursor.toArray();
        } catch (error) {
            throw new Error(`Error getting documents from collection '${collectionName}': ${error}`);
        }
    }


    static async getDocument(dbName, collectionName, filter) {
        try {
            return await DBManager.client.db(dbName).collection(collectionName).findOne(filter);
        } catch (error) {
            throw new Error(`Error getting document from collection '${collectionName}': ${error}`);
        }
    }


    static async updateDocument(dbName, collectionName, filter, newDocument) {
        try {
            return await DBManager.client.db(dbName).collection(collectionName).updateOne(filter, {$set: newDocument});
        } catch (error) {
            throw new Error(`Error getting updating document in collection '${collectionName}': ${error}`);
        }
    }


    static async removeDocument(dbName, collectionName, filter) {
        try {
            return await DBManager.client.db(dbName).collection(collectionName).deleteOne(filter);
        } catch (error) {
            throw new Error(`Error removing document from collection '${collectionName}': ${error}`);
        }
    }


    static async getCountOfDocuments(dbName, collectionName, filter) {
        try {
            return await DBManager.client.db(dbName).collection(collectionName).countDocuments();
        } catch (error) {
            throw new Error(`Error getting count of documents in collection '${collectionName}': ${error}`);
        }
    }
}

module.exports = DBManager;