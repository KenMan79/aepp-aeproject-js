/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
const constants = require('./constants.json');
const utils = require('aeproject-utils');
const execute = utils.execute;
const printError = utils.printError;
const print = utils.print;
const createMissingFolder = utils.createMissingFolder;
const copyFileOrDir = utils.copyFileOrDir;

const sdkVersion = constants.sdkVersion;
const MAX_TIMEOUT = 1000 * 60;

async function run (update) {
    if (update) {
        await updateAEprojectProjectLibraries(sdkVersion);
        return;
    }

    try {
        await createAEprojectProjectStructure();

    } catch (e) {
        printError(e.message)
        console.error(e);
    }
}

const createAEprojectProjectStructure = async (shape) => {
    print('===== Initializing AEproject =====');

    await installLibraries()
    print(`===== Creating project file & dir structure =====`);
    await setupContracts(shape);
    await setupTests(shape);
    await setupIntegrations();
    await setupDeploy(shape);
    setupDocker();
    await addIgnoreFile();

    print('===== AEproject was successfully initialized! =====');
}

const updateAEprojectProjectLibraries = async (_sdkVersion) => {
    print(`===== Updating AEproject files =====`);

    setupDocker();
    await installAEproject()
    await installAeppSDK(_sdkVersion)
    await installYarn()

    print('===== AEproject was successfully updated! =====');
}

const installLibraries = async () => {
    const fileSource = `${ __dirname }${ constants.artifactsDir }/package.json`;
    try {
        copyFileOrDir(fileSource, "./package.json")
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, "./package.json");
            // should pass this 'timeout' to prompt ?!
            let timeout = await utils.timeout(MAX_TIMEOUT);
        } else {
            throw Error(error);
        }
    }

    await installAeppSDK(sdkVersion)
    await installAEproject()
    await installYarn()

    return options;
}

const installAeppSDK = async (_sdkVersion = '') => {
    print('===== Installing aepp-sdk =====');
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${ _sdkVersion }`, '--save-exact']);
}

const installAEproject = async () => {
    print(`===== Installing AEproject locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`aeproject-lib`, '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const installYarn = async () => {
    print(`===== Installing yarn locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['yarn', '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const setupContracts = async (shape) => {

    print(`===== Creating contracts directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeContractTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.contractTemplateFile }`;
    createMissingFolder(constants.contractsDir);

    const destination = shape ? constants.shapeContractFileDestination : constants.contractFileDestination;

    try {
        copyFileOrDir(fileSource, destination)
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, destination)
            await utils.timeout(MAX_TIMEOUT);
        } else {
            throw Error(error);
        }
    }
}

const setupIntegrations = async () => {
    print(`===== Creating integrations directory =====`);
    const fileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.contratsAeppSetting }`;
    createMissingFolder(constants.integrationsDir);
    
    try {
        copyFileOrDir(fileSource, constants.contratsAeppSettingFileDestination)
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, constants.contratsAeppSettingFileDestination)
            await utils.timeout(MAX_TIMEOUT);
        } else {
            throw Error(error);
        }
    }
}

const setupTests = async (shape) => {
    print(`===== Creating tests directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeTestTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.testTemplateFile }`;
    createMissingFolder(constants.testDir, "Creating tests file structure");
    
    try {
        copyFileOrDir(fileSource, shape ? constants.shapeTestFileDestination : constants.testFileDestination)
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, constants.testFileDestination)
            await utils.timeout(MAX_TIMEOUT);
        } else {
            throw Error(error);
        }
    }
}

const setupDeploy = async (shape) => {

    print(`===== Creating deploy directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeDeployTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.deployTemplateFile }`;
    createMissingFolder(constants.deployDir, "Creating deploy directory file structure");
    
    try {
        copyFileOrDir(fileSource, constants.deployFileDestination)
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, constants.deployFileDestination)
            await utils.timeout(MAX_TIMEOUT);
        } else {
            throw Error(error);
        }
    }
}

const setupDocker = () => {
    print(`===== Creating docker directory =====`);
    const dockerFilesSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerTemplateDir }`;
    const copyOptions = {
        overwrite: true
    }

    const dockerNodeYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerNodeYmlFile }`;
    copyFileOrDir(dockerNodeYmlFileSource, constants.dockerNodeYmlFileDestination, copyOptions)
    copyFileOrDir(dockerFilesSource, constants.dockerFilesDestination, copyOptions)

    const dockerCompilerYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerCompilerYmlFile }`;
    copyFileOrDir(dockerCompilerYmlFileSource, constants.dockerCompilerYmlFileDestination, copyOptions)
    copyFileOrDir(dockerFilesSource, constants.dockerFilesDestination, copyOptions)
}

const addIgnoreFile = async () => {
    print(`==== Adding additional files ====`)
    const ignoreFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.gitIgnoreFile }`;
    
    try {
        copyFileOrDir(ignoreFileSource, constants.gitIgnoreFile)
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, ignoreFileSource, constants.gitIgnoreFile)
            await utils.timeout(MAX_TIMEOUT);
        } else {
            throw Error(error);
        }
    }
}

async function prompt (error) {
    const args = [...arguments];
    // [0] - error
    // [1] - function to execute
    // [..] rest = function arguments 

    const funcToExecute = args[1];
    // let timeout = args[args.length - 1];

    let inputData = '';

    // Get process.stdin as the standard input object.
    const input = process.stdin;

    // Set input character encoding.
    input.setEncoding('utf-8');

    // Prompt user to input data in console.
    console.log();
    console.log(`${ error.message }\nDo you want to overwrite '${ error.message.replace(' already exists.', '') }'? (YES/no):`);

    // When user input data and click enter key.
    input.on('data', function (data) {
        inputData += data.toString().trim();
    });

    const INTERVAL_TIME = 400;
    let passedMs = 0;

    let inputInterval = setInterval(function () {

        if (inputData === 'YES' || inputData === 'yes' || inputData === 'Y' || inputData === 'y') {
            clearInterval(inputInterval);
            funcToExecute(...args.slice(2), { overwrite: true });
        } else {
            if (inputData) {
                clearInterval(inputInterval);
                // clearTimeout(timeout)
                console.log(`'${ error.message.replace(' already exists.', '') }' will not be overwritten.`);
            }
        }

        passedMs += INTERVAL_TIME;

        if (passedMs >= MAX_TIMEOUT) {
            clearInterval(inputInterval);
            console.log(`'${ error.message.replace(' already exists.', '') }' will not be overwritten.`);
        }
    }, INTERVAL_TIME);
}

module.exports = {
    run,
    createAEprojectProjectStructure
}