const abi = require("./CommitReveal.json");
const { ethers, utils, Wallet } = require("ethers");

class CommitReveal {
  constructor({ contractAddress, providerUrl, privateKey, provider }) {
    this.contractAddress = contractAddress;

    if (providerUrl && privateKey) {
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
      this.wallet = new Wallet(privateKey).connect(this.provider);
    } else if (provider) {
      this.provider = provider;
      this.wallet = this.provider.getSigner(0);
    } else {
      this.provider = new ethers.providers.JsonRpcProvider();
      this.wallet = this.provider.getSigner(0);
    }

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  async init() {
    const choices = await Promise.all([
      this.contract.choice1(),
      this.contract.choice2(),
    ]);
    this.choice1 = choices[0];
    this.choice2 = choices[1];
  }

  vote = async (choice, secret) => {
    try {
      let vote;
      if (choice === this.choice1) vote = `1~${secret}`;
      else if (choice === this.choice2) vote = `2~${secret}`;
      else throw Error("Choice not exist");
      const commit = utils.keccak256(utils.toUtf8Bytes(vote));
      await this.contract.commitVote(commit);
      const commitsArray = await this.contract.getVoteCommitsArray();
      const voteStatus = await this.contract.voteStatuses(commit);
      console.log(commit, commitsArray, voteStatus);
      return commit;
    } catch (err) {
      return err;
    }
  };

  voteStatus = async (hash) => {
    const status = await this.contract.voteStatuses(hash);
    return status;
  };

  commitsArray = async () => {
    const commitsArray = await this.contract.getVoteCommitsArray();
    return commitsArray;
  };

  reveal = async (choice, secret, hash) => {
    try {
      let vote;
      if (choice === this.choice1) vote = `1~${secret}`;
      else if (choice === this.choice2) vote = `2~${secret}`;
      else throw Error("Choice not exist");
      await this.contract.revealVote(vote, hash);
      const voteStatus = await this.contract.voteStatuses(hash);
      console.log(voteStatus);
    } catch (err) {
      return err;
    }
  };

  getChoices = async () => {
    return [this.choice1, this.choice2];
  };

  totalVotes = async () => {
    const total = await this.contract.numberOfVotesCast();
    return parseInt(utils.formatUnits(total, 0));
  };

  getWinner = async () => {
    try {
      const winner = await this.contract.getWinner();
      return winner;
    } catch (err) {
      return err;
    }
  };

  switchAccount = (privateKey) => {
    this.wallet = new Wallet(privateKey).connect(this.provider);
    this.contract = new ethers.Contract(this.contractAddress, abi, this.wallet);
  };
}

const newCommitReveal = async function ({
  contractAddress,
  providerUrl,
  privateKey,
  provider,
}) {
  const cr = new CommitReveal({
    contractAddress,
    providerUrl,
    privateKey,
    provider,
  });
  await cr.init();
  return cr;
};
module.exports = { newCommitReveal };
