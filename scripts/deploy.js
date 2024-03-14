// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory("TestContract");
  const contract = await Contract.deploy();
  await contract.deployed();

  console.log("Contract address:", contract.address);

  // We also save the contract's artifacts and address in the frontend directory
  //saveFrontendFiles(token);
  saveContractAddressToFrontend(contract.address);
}

function saveContractAddressToFrontend(contractAddress) {
    const fs = require("fs");
    const replace = require('replace-in-file');
    const addressPathFile = path.join(__dirname, "address_path.txt");
    const addressPath = fs.readFileSync(addressPathFile, 'utf8').trim();
    console.log("ADDRESS PATH:", addressPath);

    const regex = new RegExp('".*"', 'i');
    const options = {
      //dry: true,
      //Single file
      files: addressPath,

      //Replacement to make (string or regex)
      from: regex,
      to: '"'+contractAddress+'"',
    };
    //console.log(options)
    try {
      const changedFiles = replace.sync(options);
      const list = JSON.parse(changedFiles);
      const file = list[0].file
      const changed = hasChanged
      if (!hasChanged) {
        console.log("Error:", file, "could not be changed");
      }
      //console.log('Modified files:', changedFiles);
    }
    catch (error) {
      console.error('Error occurred:', error);
    }

    //fs.writeFileSync(addressPathFile, contractAddress);
}

/*function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//saveContractAddressToFrontend("contractAddress")
