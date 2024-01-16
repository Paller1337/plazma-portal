module.exports = {
    apps: [{
        name: "plazma-portal",
        script: "npm",
        args: "run start",
        watch: true,
        env: {
            NODE_ENV: 'production',
            PORT: 4000,
        }
    }]
};
