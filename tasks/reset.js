const path = require("path");
const fs = require("fs");

task("reset", "Resets Hardhat network")
  .setAction(async (taskArgs, hre) => {
    // You can now access the parameter as taskArgs.name
    try {
        await hre.network.provider.send("hardhat_reset")
    } catch (error) {
        console.error('Error occurred:', '\x1b[31m', error, '\x1b[0m');
        process.exit(1);
    }
});
