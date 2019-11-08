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
require = require('esm')(module /*, options */) // use to handle es6 import/export

const {
    printError,
    print
} = require('aeproject-utils');

const nodeConfig = require('aeproject-config')
const nodeConfiguration = nodeConfig.nodeConfiguration;

const DEFAULT_NODE_PORT = 3001;

const EnvService = require('../../EnvService')

class Node extends EnvService {
    
    constructor () {
        super('node')
    }

    async run (option) {

        let dockerImage = option.windows ? nodeConfiguration.dockerServiceNodeName : nodeConfiguration.dockerImage;
        dockerImage = nodeConfiguration.dockerServiceNodeName;

        try {
            let running = await super.waitForContainer(dockerImage);

            if (option.info) {
                await super.printInfo(running)
                return
            }

            if (option.stop) {

                // if not running, current env may be windows
                // to reduce optional params we check is it running on windows env
                if (!running) {
                    running = await super.waitForContainer(dockerImage);
                }

                if (!running) {
                    print('===== Node is not running! =====');
                    return
                }

                super.printInitialStopMsg()

                try {
                    await super.stopNode();
                } catch (error) {
                    printError(Buffer.from(error.stderr).toString('utf-8'))
                }

                return;
            }

            if (!await this.shouldProcessStart(running)) return

            super.printStarMsg()

            let startingNodeSpawn = super.start();

            await super.toggleLoader(startingNodeSpawn, dockerImage)

            super.printSuccessMsg()

            if (option.windows) {
                let dockerIp = super.removePrefixFromIp(option.dockerIp);
                await super.fundWallets(dockerIp);
            } else {
                await super.fundWallets();
            }

            print('\r\n===== Default wallets were successfully funded! =====');
        } catch (e) {
            printError(e.message || e);
        }
    }

    async shouldProcessStart (running) {
        if (!super.hasNodeConfigFiles()) {
            print('Process will be terminated!');
            return false
        }

        if (running) {
            print('\r\n===== Node already started and healthy! =====');
            return false
        }

        if (await super.checkForAllocatedPort(DEFAULT_NODE_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_NODE_PORT }] is already allocated! Process will be terminated! =====`);
            printError(`Cannot start AE node, port is already allocated!`);
            return false
        }

        return true
    }

}

const node = new Node()

module.exports = {
    run: async (options) => {
        await node.run(options)
    }
}