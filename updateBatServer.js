const config = require('./config.json');
const Nodeactyl = require('nodeactyl');
const colors = require('colors');
const nodeactyl = new Nodeactyl.NodeactylClient("https://control.sparkedhost.us", '748c5454');

(async () => {
    const status = await nodeactyl.getServerStatus('748c5454');

    if (status === 'running') {
        nodeactyl.killServer(config.pterodactylID).then(() => {
            console.log("[Pterodactyl]", "Killed Pterodactyl Server! Now starting it!".blue)
        nodeactyl.startServer(config.pterodactylID).then(() => {
            console.log("[Pterodactyl]", "Started Pterodactyl Server!".green)
        }).catch(err => {
            return console.log("[Pterodactyl]", `Failed to start server! Error: ${err}`.red)
        })
        }).catch(err => {
            return console.log("[Pterodactyl]", `Failed to stop server! Error: ${err}`.red)
        })
    }
})()