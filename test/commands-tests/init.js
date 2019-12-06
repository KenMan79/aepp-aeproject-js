const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const utilsPackageJson = require('../../packages/aeproject-utils/package.json')
const aeprojectLibVersion = require('../../packages/aeproject-lib/package.json').version;
const path = require('path')

let executeOptions = {
    cwd: process.cwd() + constants.initTestsFolderPath
};

chai.use(chaiFiles);

const {
    spawn,
    exec
} = require('promisify-child-process');

const executeAndKill = async (cli, command, args = [], options = {}) => {
    try {
        const child = spawn(cli, [command, ...args], options);

        setTimeout(function () {
            process.kill(child.pid)
        }, 4000)

        await child

        let result = child.stdout.toString('utf8');
        result += child.stderr.toString('utf8');
        return result;
    } catch (e) {
        let result = e.stdout ? e.stdout.toString('utf8') : e.message;
        result += e.stderr ? e.stderr.toString('utf8') : e.message;

        return result;
    }
};

// async function executeAndPassInput (cli, command, args = [], options = {}) {
//     let timeout = 0
//     let result = '';
//     var child = spawn(cli, [command, ...args], options);

//     child.stdout.on('data', (data) => {

//         result += data;

//         if (data.includes('Do you want to overwrite')) {
//             timeout += 100

//             setTimeout(() => {
//                 child.stdin.write('y\n')

//             }, timeout);
//         }
//     });

//     child.on('close', function (err, data) {
//         if (err) {
//             console.log("Error executing cmd: ", err);
//             return err
//         } else {
//             child.stdin.end();
//         }
//     });

//     await child;
//     return result;
// }

function spawnProcess (cmd) {
    return spawnLinuxProcess(cmd);
}

function spawnLinuxProcess (cmd) {
    let cmdParts = cmd.split(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g);
    console.log('1 -> ', cmdParts);
    
    let cmdCommands = [];
    for (let command of cmdParts) {
        if (command.startsWith('"') && command.endsWith('"')) {
            command = command.substring(1, command.length - 1);
        }
        cmdCommands.push(command);
    }
    console.log('2 -> cmdCommands -> ', cmdCommands);
    console.log('3 -> cmdCommands.slice(1) -> ', cmdCommands.slice(1));
    
    return spawn('aeproject', ['init', '--update']);
}

async function executeAndPassInput (cli, command, args = [], options = {}) {
    let cliCommand = 'aeproject init --update'
    let localtimeout = 0
    let result = '';
    // var child = spawn(cli, [command, ...args], {
    //     cwd: options.cwd
    // });

    return new Promise((resolve, reject) => {
        let process = null;

        try {
            process = spawnProcess(cliCommand);
            console.log('4 -> process ', process);
            
        } catch (e) {
            console.error(`Error trying to execute command ${ cliCommand } in directory ${ cliCommand }`);
            console.error(e);
            console.log('error', e.message);
            console.log('Finished');
            reject(new Error(e));
        }

        process.stdout.on('data', (data) => {

            result += data.toString('utf-8');
            console.log('5 -> result ', result);
            
            if (data.includes('Do you want to overwrite')) {
                console.log('6. -> data ', data.toString('utf-8'));
                
                localtimeout += 100

                setTimeout(() => {
                    process.stdin.write('y\n')
                }, localtimeout);
            }
        });

        process.stderr.on('data', function (data) {
            console.log('7 -> data', data);
            
            const err = data.toString('utf-8');
            return resolve(err);
        })

        process.on('close', async function (err, data) {
            if (err) {
                console.log("Error executing cmd: ", err);
                reject(err);
            } else {
                const processRespond = {
                    process: process,
                    output: data,
                    result: true
                };

                console.log("8 - > data: ", result)
                // console.log(result)
                // resolve(data);
                resolve(processRespond);
                // result
                // resolve(result);
            }
        });
    });
}

describe.only('AEproject Init', () => {
    before(async () => {
        fs.ensureDirSync(`.${ constants.initTestsFolderPath }`)
    });

    it('Should init project successfully', async () => {
   
        await execute(constants.cliCommands.INIT, [], executeOptions)

        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageJson }`), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageLockJson }`), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeNodeYml }`), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeCompilerYml }`), "docker-compose.compiler.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.testContractPath }`), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.deployScriptsPath }`), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsPath }`), "example contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsAeppSettings }`), "contracts aepp settings file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerEntryPoint }`), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode1 }`), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode2 }`), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode3 }`), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerHealthCheck }`), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxCors }`), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxDefault }`), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxWs }`), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerKeys }`), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
    });

    xit("Should update aeproject minor version successfully", async () => {
        await execute(constants.cliCommands.INIT, [], executeOptions);

        let projectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        projectPackageJson['dependencies']['aeproject-lib'] = "^2.0.0";

        await fs.writeFile(executeOptions.cwd + constants.testsFiles.packageJson, JSON.stringify(projectPackageJson))
        await executeAndPassInput('aeproject', constants.cliCommands.INIT, [constants.cliCommandsOptions.UPDATE], executeOptions)

        delete require.cache[require.resolve(executeOptions.cwd + constants.testsFiles.packageJson)];
        let updatedProjectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);

        const aeprojectLibInProject = updatedProjectPackageJson.dependencies['aeproject-lib'];

        assert.isTrue(aeprojectLibInProject.includes(aeprojectLibVersion), "aeproject-lib is not updated properly");
    })

    it("Should NOT update aeproject to next major version", async () => {
        // await execute(constants.cliCommands.INIT, [], executeOptions);

        let projectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        projectPackageJson['dependencies']['aeproject-lib'] = "^1.0.3";

        await fs.writeFile(executeOptions.cwd + constants.testsFiles.packageJson, JSON.stringify(projectPackageJson))
        await executeAndPassInput('aeproject', constants.cliCommands.INIT, [constants.cliCommandsOptions.UPDATE], executeOptions)

        delete require.cache[require.resolve(executeOptions.cwd + constants.testsFiles.packageJson)];
        let updatedProjectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);

        const aeprojectLibInProject = updatedProjectPackageJson.dependencies['aeproject-lib'];

        assert.isNotTrue(aeprojectLibInProject.includes(aeprojectLibVersion), "aeproject-lib is not updated properly");
    })

    it.only('Should update project successfully', async () => {
        // await execute(constants.cliCommands.INIT, [], executeOptions)

        // Arrange
        const editedNodeContent = "edited node content"
        const editedCompilerContent = "edited compiler content"
        const editedDockerConfigContent = "edited content in docker config"
        // const expectedUpdateOutput = "===== AEproject was successfully updated! =====";
        
        let projectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        projectPackageJson['dependencies']['aeproject-lib'] = "^2.0.0";

        // Act
        fs.writeFile(executeOptions.cwd + constants.testsFiles.dockerComposeNodeYml, editedNodeContent)
        fs.writeFile(executeOptions.cwd + constants.testsFiles.dockerComposeCompilerYml, editedCompilerContent)
        fs.writeFile(executeOptions.cwd + constants.testsFiles.aeNodeOneConfig, editedDockerConfigContent)
        
        fs.writeFile(executeOptions.cwd + constants.testsFiles.packageJson, JSON.stringify(projectPackageJson))
        
        
        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, [constants.cliCommandsOptions.UPDATE], executeOptions)
        console.log('9 -> result ', result);
        
        // assert.isTrue(result.includes(expectedUpdateOutput), 'project has not been updated successfully')

        // assert
        let editedDockerComposeNodeYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeNodeYml, 'utf8')
        let editedDockerComposeCompilerYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeCompilerYml, 'utf8')
        let editedDockerAeNodeYaml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.aeNodeOneConfig, 'utf8')

        // clear cache of the old require, as once it caches, it will be referred to the old one in memory
        delete require.cache[require.resolve(executeOptions.cwd + constants.testsFiles.packageJson)];
        let updatedProjectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        const aeprojectLibVersionInProject = updatedProjectPackageJson.dependencies['aeproject-lib'];

        const sdkVersion = utilsPackageJson.dependencies['@aeternity/aepp-sdk'];
        const sdkVersionInProject = projectPackageJson.dependencies['@aeternity/aepp-sdk'];

        assert.notEqual(editedDockerComposeNodeYml, editedNodeContent);
        assert.notEqual(editedDockerComposeCompilerYml, editedCompilerContent);
        assert.notEqual(editedDockerAeNodeYaml, editedDockerConfigContent);

        assert.equal(sdkVersion, sdkVersionInProject, "sdk version is not updated properly");
        assert.isTrue(aeprojectLibVersionInProject.includes(aeprojectLibVersion), "aeproject-lib is not updated properly");

        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageJson }`), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageLockJson }`), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeNodeYml }`), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeCompilerYml }`), "docker-compose.compiler.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.testContractPath }`), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.deployScriptsPath }`), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsPath }`), "example contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerEntryPoint }`), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode1 }`), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode2 }`), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode3 }`), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerHealthCheck }`), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxCors }`), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxDefault }`), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxWs }`), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerKeys }`), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
    });

    xit('Should terminate init process and re-inited project successfully', async () => {

        let expectedResult = [
            `===== Installing aepp-sdk =====`,
            `===== Installing AEproject locally =====`,
            `===== Installing yarn locally =====`,
            `===== Creating project file & dir structure =====`,
            `===== Creating contracts directory =====`,
            `===== Creating tests directory =====`,
            `===== Creating integrations directory =====`,
            `===== Creating deploy directory =====`,
            `===== Creating docker directory =====`,
            `==== Adding additional files ====`,
            `===== AEproject was successfully initialized! =====`
        ];

        await executeAndKill('aeproject', constants.cliCommands.INIT, [], executeOptions)

        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, [], executeOptions);

        assert.isOk(result.trim().includes(`Do you want to overwrite './package.json'? (YES/no):\u001b[22m \u001b[90m…\u001b[39m y\u001b7\u001b8`), `'Init' command do not produce expected result (prompt for user action)`);

        for (let line of expectedResult) {
            assert.isOk(result.trim().includes(line.trim()), `There is missing initialization action.`);
        }

        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageJson }`), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageLockJson }`), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeNodeYml }`), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeCompilerYml }`), "docker-compose.compiler.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.testContractPath }`), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.deployScriptsPath }`), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsPath }`), "example contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsAeppSettings }`), "contracts aepp settings file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerEntryPoint }`), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode1 }`), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode2 }`), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode3 }`), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerHealthCheck }`), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxCors }`), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxDefault }`), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxWs }`), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerKeys }`), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
    });

    // after(async () => {
    //     fs.removeSync(`.${ constants.initTestsFolderPath }`);
    // })
})