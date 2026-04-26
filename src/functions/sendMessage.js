const { app, output } = require('@azure/functions');

// 🔌 SignalR output binding
const signalROutput = output.generic({
    type: 'signalR',
    name: 'signalRMessages',
    hubName: 'default',
    connectionStringSetting: 'AzureSignalRConnectionString'
});

app.http('sendMessage', {
    methods: ['POST', 'OPTIONS'], // ✅ Important for CORS
    authLevel: 'anonymous',
    route: 'sendMessage',
    extraOutputs: [signalROutput],

    handler: async (request, context) => {

        // 🟡 Handle CORS preflight request
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

        try {
            // 📥 Read incoming message
            const body = await request.json();

            const sender = body.sender || "Anonymous";
            const text = body.text || "";
            const time = body.time || new Date().toLocaleTimeString();

            console.log("📨 Message received:", sender, text);

            // 📡 Send message to SignalR
            context.extraOutputs.set(signalROutput, [
                {
                    target: "newMessage", // MUST match frontend
                    arguments: [
                        {
                            sender: sender,
                            text: text,
                            time: time
                        }
                    ]
                }
            ]);

            // ✅ Return success response
            return {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                jsonBody: {
                    status: "Message sent successfully"
                }
            };

        } catch (error) {
            console.error("❌ Error in sendMessage:", error);

            return {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                jsonBody: {
                    error: "Failed to send message"
                }
            };
        }
    }
});