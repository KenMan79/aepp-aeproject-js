export type KeyPair = {
    publicKey: string,
    secretKey: string
}


export type ParsedContractFunction = {
    name?: string,
    args?: Array<string>,
    returnType?: any
}

export type AciFunctions = {
    name?: string,
    arguments?: Array<{
        name?: string,
        type?: Array<any>
    }>,
    returns?: any,
    stateful?: boolean
}

type deployInfo = {
    transaction: string;
    address: string;
}

export type DeployedContract = {
    aci: string
    deployInfo: deployInfo
}

export type Contractinstance = {
    /**
    * Deploy contract
    * @param {Array} initState Contract init function arguments array
    * @param {Object} [options={}] options Options object
    * @param {Boolean} [options.skipArgsConvert=false] Skip Validation and Transforming arguments before prepare call-data
    * @return {ContractInstance} Contract ACI object with predefined js methods for contract usage
    */
    deploy(initState: Array<string | number>, options?: object): DeployedContract
}

export type Info = {
    deployerType?: string;
    publicKey?: string;
    nameOrLabel?: string
    transactionHash?: string;
    status?: boolean,
    gasPrice?: number;
    gasUsed?: number;
    result?: string;
    networkId: string;
    error?: string;
    initState?: Array<string | number>;
    options?: Object
}

export type TxInfo = {
    callerId?: string,
    callerNonce?: number,
    contractId?: string,
    gasPrice?: number,
    gasUsed?: number,
    height?: number,
    log?: Array<any>,
    returnType?: string,
    returnValue?: string
}


export type Client = {

    /**
    * Obtain a transaction info based on its hash
    * @function getTxInfo
    * @instance
    * @abstract
    * @category async
    * @rtype (hash: String) => tx: Object
    * @param {number} hash - Transaction hash
    * @return {Object} Transaction
    */
    getTxInfo(hash: number): Promise<object>;


    /**
    * Generate contract ACI object with predefined js methods for contract usage
    * @function getContractInstance
    * @param {String} source Contract source code
    * @param {Object} [options] Options object
    * @param {Object} [options.aci] Contract ACI
    * @return {ContractInstance} JS Contract API
    * @example
    * const contractIns = await client.getContractInstance(sourceCode)
    * await contractIns.compile()
    * await contractIns.deploy([321])
    * const callResult = await contractIns.call('setState', [123])
    * const staticCallResult = await contractIns.call('setState', [123], { callStatic: true })
    */
    getContractInstance(source: string, options?: object): Promise<Contractinstance>;

    /**
     * Call contract function
     * @function contractCall
     * @param {String} source Contract source code
     * @param {number} address Contract address
     * @param {String} name Name of function to call
     * @param {Array} args Argument's for call function
     * @param {Object} options Transaction options (fee, ttl, gas, amount, deposit)
     * @return {Promise<Object>} Result object
     */
    contractCall(source: string, address: string, name: string, args: Array<number | string>, options: object): Promise<Object>
}