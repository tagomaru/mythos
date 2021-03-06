const fs = require('fs');
const armlet = require('armlet');

module.exports.Scanner = class Scanner {
  constructor(mythxAddress, mythxpassword) {
    this.client = new armlet.Client({
      password: mythxpassword,
      ethAddress: mythxAddress,
    })
  }

  async fakeRun() {
    return {}
  }

  async run(compiled, contractFile, contractName, timeout, analysisMode) {
    let contractData = compiled.contracts[contractFile][contractName];
    timeout = timeout * 1000;

    const contractSource = fs.readFileSync(contractFile, { encoding: 'utf-8' })

    const data = {
      contractName: contractName,
      abi: contractData['abi'],
      //
      bytecode: contractData['evm']['bytecode']['object'],
      sourceMap: contractData['evm']['bytecode']['sourceMap'],
      //
      deployedBytecode: contractData['evm']['deployedBytecode']['object'],
      deployedSourceMap: contractData['evm']['deployedBytecode']['sourceMap'],
      sourceList: [
        contractFile
      ],
      sources: {
        [contractFile]: {
          source: contractSource,
        }
      },
      analysisMode,
    };

    return new Promise((resolve, reject) => {
      this.client.analyze({
        data,
        timeout,
        clientToolName: "mythos",
      }).then(issues => {
        fs.writeFileSync('./issues.json', JSON.stringify(issues, null, 4), 'utf-8');
        resolve(issues);
      }).catch(err => {
        reject(err);
      })
    });
  }
}
