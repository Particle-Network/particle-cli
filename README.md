# Particle CLI

The Particle CLI is used to support Particle Network usage from the command line. It is built using [oclif](https://oclif.io/).

## Installation

- NPM: `npm install -g @particle-network/cli`
- Yarn: `yarn global add @particle-network/cli`

## Usage

```shell
Particle Network CLI

VERSION
  @particle-network/cli/0.1.0 darwin-x64 node-v16.14.2

USAGE
  $ particle [COMMAND]

COMMANDS
  autocomplete  display autocomplete installation instructions
  help          Display help for particle.
  sign-message  Sign a message with a keypair
  update        update the particle CLI
```

- Sign message

```shell
USAGE
  $ particle sign-message [MESSAGE] [-k <value>] [-p <value>] [-c evm-chain|solana]

ARGUMENTS
  MESSAGE  The message to sign

FLAGS
  -c, --chain=<option>      [default: evm-chain] The chain type to use for signing
                            <options: evm-chain|solana>
  -k, --keypair=<value>     The keypair to use for signing
  -p, --privateKey=<value>  The private key(hex string) to use for signing

DESCRIPTION
  Sign a message with a keypair

EXAMPLES
  $ particle sign-message 'Particle Network' --chain solana --keypair ./keypair.json
```

## License

[Apache License 2.0](./LICENSE)
