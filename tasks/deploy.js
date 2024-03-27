const path = require("path");
const fs = require("fs");

task("deploy", "Deploys a given contract")
  .addParam("contract", "Contract name")
  .setAction(async (taskArgs, hre) => {
    // You can now access the parameter as taskArgs.name
    try {
        await hre.run('compile');
        await runTask(taskArgs, hre)
    } catch (error) {
        console.error('Error occurred:', '\x1b[31m', error, '\x1b[0m');
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
      const basePath = fs.readFileSync(addressPathFile, 'utf8').trim();
      const addressPath = basePath + "/Address.kt"
      const abiPath = basePath + "/Abi.kt"
      console.log("ADDRESS PATH:", addressPath);
      for (const contractName of contractNames) {
          console.log(contractName);
          const contractAddress = await deployContract(deployer, contractName)
          saveContractAddressToFrontend(contractName, contractAddress, addressPath);
          const oneLineAbi = getOneLineAbi(contractName, abiPath);
          saveContractAbiToFrontend(contractName, oneLineAbi, abiPath);
      }
}

async function deployContract(deployer, contractName) {
    console.log(
        "Deploying the contract:", contractName,
        "\nwith the account:", await deployer.getAddress()
    );
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  await contract.deployed();

  console.log("Contract address:", contract.address);
  return contract.address
}

function saveContractAddressToFrontend(contractName, contractAddress, addressPath) {
    console.log("Writing address to frontend file...");
    writeAddressOrAbi(contractName, addressPath, contractAddress, false);
}

function getOneLineAbi(contractName, abiPath) {
    const jsonFilePath = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    const rawContract = fs.readFileSync(jsonFilePath, 'utf8');
    const fileContract = JSON.parse(rawContract)
    const abi = fileContract.abi
    return JSON.stringify(abi);
}

function saveContractAbiToFrontend(contractName, oneLineAbi, abiPath) {
    console.log("Writing ABI to frontend file...");
    writeAddressOrAbi(contractName, abiPath, oneLineAbi, true);
}

function writeAddressOrAbi(contractName, filePath, abiOrAddress, isAbi) {
    const declarationEnd = isAbi ? "_ABI = " : "_ADDRESS = ";
    const ktConstantDeclaration = "const val " + contractName.replace(/([A-Z])/g, '_$1').toUpperCase().slice(1) + declarationEnd;
    const newLine = `${ktConstantDeclaration}"""${abiOrAddress}"""`;
    if (fs.existsSync(filePath)) {
        console.log('file exists, adding to file if needed...');
        const fileText = fs.readFileSync(filePath, 'utf8').trim();
        const lines = fileText.split("\n");
        const filteredLines = lines.filter(item => !item.startsWith(ktConstantDeclaration));
        const filteredText = filteredLines.join("\n");
        const newText = filteredText + "\n" + newLine;
        fs.writeFileSync(filePath, newText);
    } else {
        console.log('file does not exist, creating...');
        const package = getPackageLine(filePath);
        const newText = package + "\n\n" + newLine;
        fs.writeFileSync(filePath, newText);
    }
}

function getPackageLine(addressPath) {
      const directoryPath = path.dirname(addressPath);
      const index = directoryPath.indexOf(`${path.sep}kotlin${path.sep}`);
      const partAfterTargetFolder = index !== -1 ? directoryPath.substring(index + "kotlin".length + 2) : '';
      return "package " + partAfterTargetFolder.replace(new RegExp(path.sep, 'g'), '.');
}