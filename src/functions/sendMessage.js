const { app, output } = require('@azure/functions');

const signalROutput = output.generic({
    type: 'signalR',
    name: 'signalRMessages',
    hubName: 'default',
    connectionStringSetting: 'AzureSignalRConnectionString'
});

app.http('sendMessage', {
    methods: ['POST', 'OPTIONS'], // 👈 IMPORTANT
    authLevel: 'anonymous',
    route: 'sendMessage',
    extraOutputs: [signalROutput],

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

        const body = await request.json();

        context.extraOutputs.set(signalROutput, [
            {
                target: "newMessage",
                arguments: [
                    {
                        sender: "ravali",
                        text: body.text
                    }
                ]
            }
        ]);

        return {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            jsonBody: { status: "Message sent" }
        };
    }
});