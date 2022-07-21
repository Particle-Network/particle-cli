import { Command, Flags } from '@oclif/core';
import { prompt } from '@oclif/core/lib/cli-ux/prompt';
import { ecsign, isValidPrivate, privateToAddress, stripHexPrefix, toChecksumAddress, toRpcSig } from '@ethereumjs/util';
import * as fs from 'fs';
import { sha256 } from 'js-sha256';
import * as bs58 from 'bs58';

const keythereum = require('keythereum');
const nacl = require('tweetnacl');

export class SignMessage extends Command {
    static description = 'Sign a message with a keypair';

    static examples = [`$ particle sign-message '`];

    static args = [
        {
            name: 'message',
            required: true,
            description: 'The message to sign',
        },
    ];

    static flags = {
        keypair: Flags.file({
            char: 'k',
            required: false,
            description: 'The keypair to use for signing',
        }),
        privateKey: Flags.string({
            char: 'p',
            required: false,
            description: 'The private key(hex string) to use for signing',
        }),
        chain: Flags.string({
            char: 'c',
            required: false,
            description: 'The chain type to use for signing',
            options: ['evm-chains', 'solana'],
            default: 'evm-chains',
        }),
    };

    async run() {
        const { args, flags } = await this.parse(SignMessage);
        if (!flags.keypair && !flags.privateKey) {
            this.error('You must specify a keypair or private key');
        }

        const msgHash = Buffer.from(sha256.arrayBuffer(args.message));
        let address, signature;
        if (flags.chain === 'solana') {
            let keypair;
            if (!!flags.keypair) {
                const data = Buffer.from(JSON.parse(fs.readFileSync(flags.keypair, 'utf8')));
                if (data.length === 64) {
                    keypair = nacl.sign.keyPair.fromSecretKey(data);
                } else if (data.length === 32) {
                    keypair = nacl.sign.keyPair.fromSeed(data);
                } else {
                    this.error('Invalid keypair');
                    return;
                }
            } else {
                keypair = nacl.sign.keyPair.fromSecretKey(Buffer.from(flags.privateKey ?? '', 'hex'));
            }

            address = bs58.encode(keypair.publicKey);
            signature = Buffer.from(nacl.sign.detached(msgHash, keypair.secretKey)).toString('hex');
        } else {
            let privateKey;
            if (!!flags.keypair) {
                const password = await prompt('Enter the keypair passphrase', { type: 'hide', required: false });
                this.log();
                const key = JSON.parse(fs.readFileSync(flags.keypair, 'utf8'));
                privateKey = keythereum.recover(Buffer.from(password), key);
            } else {
                if (!flags.privateKey || !isValidPrivate(Buffer.from(stripHexPrefix(flags.privateKey), 'hex'))) {
                    this.error('Invalid private key');
                    return;
                }
                privateKey = Buffer.from(stripHexPrefix(flags.privateKey), 'hex');
            }

            const sign = ecsign(msgHash, privateKey);

            address = toChecksumAddress('0x' + privateToAddress(privateKey).toString('hex'));
            signature = toRpcSig(sign.v, sign.r, sign.s);
        }

        this.log('Address: ', address);
        this.log('Signature: ', signature);
    }
}
