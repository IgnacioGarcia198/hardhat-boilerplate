const path = require("path");
const fs = require("fs");

task("deploy", "Runs a custom script with parameters")
  .addParam("contract", "Contract name")
  .setAction(async (taskArgs, hre) => {
    // You can now access the parameter as taskArgs.name
    try {
        await runTask(taskArgs, hre)
    } catch (error) {
        console.error('Error occurred:', '\x1b[31m', error.message, '\x1b[0m');
        process.exit(1);
    }
});

async function runTask(taskArgs, hre) {
    console.log(taskArgs);

    // ethers is available in the global scope
      const [deployer] = await ethers.getSigners();
      console.log("Account balance:", (await deployer.getBalance()).toString());
      const contractNames = taskArgs.contract.split(",")
      console.log(contractNames)
      const addressPathFile = path.join(__dirname, "address_path.txt");
      if (!fs.existsSync(addressPathFile)) {
        throw new Error(`file ${addressPathFile} is missing`);
      }
      const addressPath = fs.readFileSync(addressPathFile, 'utf8').trim();
      console.log("ADDRESS PATH:", addressPath);
      for (const contractName of contractNames) {
          console.log(contractName);
          await deployContractAndSaveAddressToFile(deployer, contractName, addressPath)
      }
}

async function deployContractAndSaveAddressToFile(deployer, contractName, addressPath) {
    console.log(
        "Deploying the contract:", contractName,
        "\nwith the account:", await deployer.getAddress()
    );
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  await contract.deployed();

  console.log("Contract address:", contract.address);
  saveContractAddressToFrontend(contractName, contract.address, addressPath);
}

function saveContractAddressToFrontend(contractName, contractAddress, addressPath) {
    const ktConstantDeclaration = "const val " + contractName.replace(/([A-Z])/g, '_$1').toUpperCase().slice(1)+"_ADDRESS = ";
    console.log(ktConstantDeclaration)
    const newLine = `${ktConstantDeclaration}"${contractAddress}"`;
    if (fs.existsSync(addressPath)) {
        console.log('The file exists.');
        const addressFileText = fs.readFileSync(addressPath, 'utf8').trim();
        const lines = addressFileText.split("\n");
        const filteredLines = lines.filter(item => !item.startsWith(ktConstantDeclaration));
        const filteredText = filteredLines.join("\n");
        console.log("filtered text:", filteredText);
        const newText = filteredText + "\n" + newLine;
        console.log(newText);
        fs.writeFileSync(addressPath, newText);
    } else {
        const package = getPackageLine(addressPath);
        console.log(package);
        const newText = package + "\n\n" + newLine;
        console.log(newText);
        fs.writeFileSync(addressPath, newText);
    }
}

function getPackageLine(addressPath) {
      const directoryPath = path.dirname(addressPath);
      // Find the index of the target folder in the path
      const index = directoryPath.indexOf(`${path.sep}kotlin${path.sep}`);
      const partAfterTargetFolder = index !== -1 ? directoryPath.substring(index + "kotlin".length + 2) : '';
      console.log(partAfterTargetFolder)
      return "package " + partAfterTargetFolder.replace(new RegExp(path.sep, 'g'), '.');
}