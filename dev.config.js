module.exports = {
    apps: [{
        name: "plazma-portal",
        script: "npm",
        args: "run dev",
        watch: true,
        env: {
            NODE_ENV: 'development',
            PORT: 4000,
        }
    }]
};
