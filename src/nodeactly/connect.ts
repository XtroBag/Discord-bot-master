import { NodeactylClient } from "nodeactyl";

async function NodeactylConnect(
  host: string,
  apikey: string,
  serverid: string
) {
  const nodeactyl = new NodeactylClient(host, apikey);
  const status = await nodeactyl.getServerStatus(serverid);
  
  if (status === "running") {
    try {
    await nodeactyl.stopServer(serverid).catch()
    } catch (err) {
      console.log(err)
    }
  //  await nodeactyl.startServer(serverid).catch(err => console.log(err))

  }
  if (status === "offline") {
    await nodeactyl.startServer(serverid).then(() => {
      console.log("[Pterodactyl]", "Started Pterodactyl Server!");
    });
  }
}

NodeactylConnect(
  "https://control.sparkedhost.us",
  process.env.NodeactylAPIKey,
  process.env.NodeactylServerId
);
