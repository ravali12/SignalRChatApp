const { app, input } = require('@azure/functions');

const inputSignalR = input.generic({
    type: 'signalRConnectionInfo',
    name: 'connectionInfo',
    hubName: 'default',
    connectionStringSetting: 'AzureSignalRConnectionString',
});

app.http('negotiate', {
    methods: ['GET', 'POST', 'OPTIONS'], // 👈 IMPORTANT
    authLevel: 'anonymous',
    route: 'negotiate',
    extraInputs: [inputSignalR],

    handler: async (request, context) => {

        // ✅ Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            };
        }

        // ✅ Normal response
        const signalRInfo = context.extraInputs.get(inputSignalR);

        return {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            jsonBody: signalRInfo
        };
    }
});