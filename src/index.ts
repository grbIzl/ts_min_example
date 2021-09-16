import { ApiPromise, WsProvider } from "@polkadot/api";
import yargs from "yargs";

async function createApi(url: string) {
  const provider = new WsProvider(url);

  console.log("API creation");

  const apiRequest = await Promise.race([
    ApiPromise.create({ provider }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 3000)
    ),
  ]).catch(function (err) {
    console.log("API creation error");
    throw Error(`Timeout error: ` + err.toString());
  });
  console.log("API creation finished");
  return apiRequest as ApiPromise;
}

async function test_func (ws_url: string) {
  console.log("Test func");
  const api = await createApi(ws_url);
  console.log("Api created");
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
  process.exit(0);
}

function run() {
  yargs(process.argv.slice(2))
    .command({
      command:
        "test [ws_url]",
      describe:
        "Test test",
      builder: (yargs) =>
        yargs
          .positional("ws_url", {
            type: "string",
            describe: "path to websocket api point",
            default: "ws://localhost:8080",
          }),
      handler: async (
        args: yargs.Arguments<{
          ws_url: string;
        }>
      ): Promise<void> =>
        test_func(
          args.ws_url
        ),
    })
    .parserConfiguration({
      "parse-numbers": false,
      "parse-positional-numbers": false,
    })
    .demandCommand(1, "Choose a command from the above list")
    .strict()
    .help().argv;
}

try {
  run();
  console.log("Finished");
} catch (err) {
  console.log("Error");
  console.error(err);
  process.exit(1);
}
