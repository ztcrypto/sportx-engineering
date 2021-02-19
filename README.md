# Full-stack Web3 Engineering Assignment

Thank you for your interest in joining the SportX engineering team!

This document is just a quick test to see where your coding and problem solving skills are with something related to dApp development. It’s designed to be straightforward and not take too much of your time.

Since a lot of this position will be JavaScript/Typescript-based app development and integrating with Solidity contracts, we've created a task that, in some capacity, represents the tooling you'll be working with on a day-to-day basis with us.

## Background

"Blind" voting on a public blockchain takes some thought. All data is public so without any extra tricks it's trivial to see who voted what and which side is likely to win. This can greatly bias voters and lead to inefficient decisions.

One way to mitigate this is to use a "commit-reveal" scheme. In such a scheme, eligible voters commit `Hash(x + secret)` in some "commit period" where `x` is their vote choice. For simplicitly, suppose `x` is either 0 or 1 and the `"+"` operator means concatenation. So for example, a user might commit a vote `"Hash(0~mysuperbigsecret)"`. We call this the "commitment".

After the "commit period", voters can reveal their vote by supplying `(x + secret)`, and their `Hash(x + secret)`. This would be `"0~mysuperbigsecret"` and `"Hash(0~mysuperbigsecret)"` respectively, in this case. Using the fact that hash collisions are impossible using a cryptographic hash function, we can cryptographically prove that a user committed to a particular vote by computing the hash of `(x + secret)` and comparing it with the supplied commitment.

Using this technique, it's now impossible to know what a given user committed to before the revealing period unless they told you their secret beforehand, grealty improving the effectiveness of the vote.

## The task

We've written a simple implementation of a commit-reveal vote scheme in Solidity in `CommitReveal.sol`. **Our ask is for you to write a very simple script to wrap it and make it easy for users to participate in the vote.**

The Solidity implementation we wrote is very simple: it has only two choices, "YES" and "NO", the commit phase lasts 2 minutes, and users can vote multiple times. It's based on the blog written by Karl Floresch which we encourage you to check out [here](https://karl.tech/learning-solidity-part-2-voting/) if you're looking for more background. For this simple assignment, there will be only one voter (you).

## Requirements

Using any framework you'd like, please make a linear script that interacts with the contract. In a real implementation, we would have many different voters and a requirement that a voter can only vote once, but this is just a dummy example. Here are the functional requirements:

- If the blockchain is in the commit phrase, the user should be able to see the two choices they can vote for, "YES" (`choice1` in `CommitReveal.sol`) and "NO" (`choice2` in `CommitReveal.sol`) and commit a vote. A user can run this as many times as they want, provided they use a different secret each time. Behind the scenes it should be map "YES" and "NO" to the appropriate "1" or "2"
- If the blockchain is in the reveal phase, the user should be able to reveal a vote by supplying their secret and their vote. A user can run this as many times as they want, provided they reveal a different commit each time.
- If all votes have been revealed, the program should output
  - The winner of the vote
  - How many votes were cast

Things you don't have to do:

- Publish this as an NPM package
- Write any further tests for the contracts or exhaustive tests for your script. The script just needs to work.
- Add any functionality for "switching" between accounts. A user can vote multiple times with different secrets and that is totally fine.
- Deploy this on any public blockchain. Use a local blockchain such as `ganache-cli`.

For interacting with the contracts, you can use `ethers.js`, `web3`, or the native truffle contract wrappers. Up to you.

## Setup

First, install the dependencies. You'll need a local Ethereum blockchain to deploy the contracts and run the contract tests if you want. We recommend `ganache`. You can install ganache with

`npm install -g ganache-cli`

and start it up with

`ganache-cli`

To get the code deployed onto the blockchain, just `truffle migrate` in this repo once `ganache-cli` is up.

If you want to run the tests (not necessary to complete this assignment, just to verify the functionality of the solidity contracts), you'll have to monkey patch the line

`node_modules/@0x/utils/lib/src/provider_utils.js:81`

with

`if (_.includes(supportedProvider.send.toString().replace(' ', '').replace(' ', ''), 'function(payload,callback)')) :`

otherwise you'll run into a `TypeError: Cannot read property 'then' of undefined` as there is some annoying bug with web3 currently.

## Other notes

- We've already written the migration script with pre-defined choices (see `1_initial_migration.js`) and there are some helper npm scripts in `package.json` in case you don't want to install truffle globally.
- `truffle-config.js` is already configured to point to your local ganache on port `8545`.
- The `test` folder includes some example code to interact with the contracts using the `truffle-contract` wrappers if you need some hints. **You don't have to use truffle to interact with the contracts as mentioned above**.
- To help with transitioning from the commit phase to the reveal phase, we've provided some example code in the `test` folder. Ganache has a special command called `evm_increaseTime` which can artifically set the next block's timestamp and `@0xproject` provides a nice wrapper around this command. Alternatively you can just wait. Just remember that once you go forward in time you can't go back. Yu'll need to restart your `ganache-cli` to do that.

All you have to do is write your script.

## What we're looking for

We're interested in your coding style, your familarity with developer tooling for smart contracts or your ability to learn the tooling, and your JavaScript/TypeScript proficiency.

## How to complete this challenge

Fork this repo, and _make your new repo private_. Write your code in a sub-folder in this repo, and edit this `README` to include instructions on how to use your script. Feel free to change anything in the repo except for the `CommitReveal.sol` contract.

Send `andrew@sportx.bet` the _private_ GitHub link when you're done.

Good luck!

## Task Explained

You can import `script/index.js` to create an instance of wrapper for CommitReveal Smart Contract to interact.

```
const { newCommitReveal } = require("../script");
...

const cr = await newCommitReveal({
    contractAddress: "0x991968Cedd8e6566cafDA185Bc5EdB849cc0765e",
    // providerUrl: "http://localhost:8545",
    // privateKey: "YOUR_PRIVATE_KEY",
    // provider: new ethers.providers.JsonRpcProvider(),
  });
```

You can initialize the instance by a providerUrl and wallet Private key or existing web3 provider or metamask ex as parameters.

Choices are possible to be got like below.

```
  const [choice1, choice2] = cr.getChoices(); // YES NO
```

On commit period, you can vote on one of choices.

```
  const secret1 = "mybigsecret1";
  const secret2 = "mybigsecret2";
  const secret3 = "mybigsecret3";

  const hash1 = await cr.vote(choice1, secret1);
  const hash2 = await cr.vote(choice1, secret2);
  const hash3 = await cr.vote(choice2, secret3);
```

Returned value of `vote` method is hashed secret.
You can use this as a public key to reveal later.

After the commit period, you can reveal the votes.

```
   await cr.reveal(choice1, secret1, hash1);
   await cr.reveal(choice1, secret2, hash2);
   await cr.reveal(choice2, secret3, hash3);
```

After all votes are revealed, you can get totalVote counts, winner information.

```
  console.log(await cr.commitsArray());
  console.log(await cr.totalVotes());
  console.log(await cr.getWinner());
```

You can also switch account to vote with a different address

```
  cr.switchAccount("YOUR_PRIVATE_KEY");
```

Full code below! to test on local, you can run `ganache-cli` and migrate the contract, run the code right after migration like below(because of commit period).

**You need to copy the deployed contract address and intialize the instance by that contract address.**

```
  // Promisify setTimeout
  function later(delay) {
    return new Promise(function (resolve) {
      setTimeout(resolve, delay);
    });
  }

  const cr = await newCommitReveal({
    contractAddress: "0x991968Cedd8e6566cafDA185Bc5EdB849cc0765e",
    // providerUrl: "http://localhost:8545",
    // privateKey: "YOUR_PRIVATE_KEY",
    provider: new ethers.providers.JsonRpcProvider(),
  });
  const choice1 = cr.choice1;
  const choice2 = cr.choice2;

  const secret1 = "mybigsecret1";
  const secret2 = "mybigsecret2";
  const secret3 = "mybigsecret3";

  const hash1 = await cr.vote(choice1, secret1);
  const hash2 = await cr.vote(choice1, secret2);
  const hash3 = await cr.vote(choice2, secret3);
  await later(1000 * 120);

  await cr.reveal(choice1, secret1, hash1);
  await cr.reveal(choice1, secret2, hash2);
  await cr.reveal(choice2, secret3, hash3);

  // cr.switchAccount( "YOUR_PRIVATE_KEY");

  console.log(await cr.commitsArray());
  console.log(await cr.totalVotes()); // 3
  console.log(await cr.getWinner()); // YES
```

### Test

Because this script is independent, I made a test script to interact with deployed rinkeby contract to check total votes, winner and vote status.
You can run by this command `npm run test-script`

### Deployment

Contract deployed on public rinkeby testnet and verified.
https://rinkeby.etherscan.io/address/0xce7fd34d1e1385fa8795e01bb5f591dfacc58ebe

As its commit period was 120s and already voted, revealed, you can check total votes, voteSatus and winner.
It's also possible to get the information by interacting with my script.
You only need to provide an infra or alchemy web3 provider.

### Further improvements

- You can add typescript for strict typing and documentation.
- Make as an individual sdk and publish on NPM.
