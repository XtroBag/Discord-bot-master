import Nodeactyl from "nodeactyl";

async function NodeactylConnect(
  host: string,
  apikey: string,
  serverid: string
) {
  const nodeactyl = new Nodeactyl.NodeactylClient(host, apikey);
  const status = await nodeactyl.getServerStatus(serverid);
  
  if (status === "running") {
    nodeactyl.killServer(serverid).then(() => {
      console.log(
        "[Pterodactyl]",
        "Killed Pterodactyl Server! Now starting it!"
      );

      nodeactyl.startServer(serverid).then(() => {
        console.log("[Pterodactyl]", "Started Pterodactyl Server!");
      });
    });
  }
  if (status === "offline") {
    nodeactyl.startServer(serverid).then(() => {
      console.log("[Pterodactyl]", "Started Pterodactyl Server!");
    });
  }
}

NodeactylConnect(
  "https://control.sparkedhost.us",
  process.env.NodeactylAPIKey,
  process.env.NodeactylServerId
);
