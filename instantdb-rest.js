// instantdb-rest.js
// Simple InstantDB REST API wrapper for Chrome extensions

class InstantDBRest {
    constructor(appId) {
        this.appId = appId;
        this.baseUrl = 'https://api.instantdb.com';
    }

    // Generate a unique ID
    generateId() {
        return crypto.randomUUID();
    }

    // Add/Update data
    async transact(namespace, id, data) {
        try {
            const response = await fetch(`${this.baseUrl}/runtime/mutation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.appId}`
                },
                body: JSON.stringify({
                    'app-id': this.appId,
                    ops: [{
                        op: 'update',
                        ns: namespace,
                        id: id,
                        value: data
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('InstantDB transact error:', error);
            throw error;
        }
    }

    // Query data
    async query(namespace) {
        try {
            const response = await fetch(`${this.baseUrl}/runtime/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.appId}`
                },
                body: JSON.stringify({
                    'app-id': this.appId,
                    query: {
                        [namespace]: {}
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result[namespace] || [];
        } catch (error) {
            console.error('InstantDB query error:', error);
            throw error;
        }
    }

    // Delete data
    async delete(namespace, id) {
        try {
            const response = await fetch(`${this.baseUrl}/runtime/mutation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.appId}`
                },
                body: JSON.stringify({
                    'app-id': this.appId,
                    ops: [{
                        op: 'delete',
                        ns: namespace,
                        id: id
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('InstantDB delete error:', error);
            throw error;
        }
    }
}
