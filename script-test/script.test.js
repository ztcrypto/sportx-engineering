const { expect } = require("chai");
const PRIVATE_KEY = require("../key.js");

const { newCommitReveal } = require("../script");
describe("CommitRevewal", () => {
  let cr;

  before("Init", async () => {
    cr = await newCommitReveal({
      contractAddress: "0xce7fd34d1e1385fa8795e01bb5f591dfacc58ebe",
      providerUrl:
        "https://rinkeby.infura.io/v3/6aca14da07584e5294654d7319401528",
      privateKey: PRIVATE_KEY,
    });
  });
  it("Should get the total vote count", async () => {
    const total = await cr.totalVotes();
    expect(total).equal(3);
  });
  it("Should get the winner", async () => {
    const winner = await cr.getWinner();
    expect(winner).equal(cr.choice1);
  });

  it("Should get the commitsArray", async () => {
    const commitsArray = await cr.commitsArray();
    expect(commitsArray).length(3);
  });

  it("Should all votes revealed", async () => {
    const commitsArray = await cr.commitsArray();
    const statuses = await Promise.all([
      cr.voteStatus(commitsArray[0]),
      cr.voteStatus(commitsArray[1]),
      cr.voteStatus(commitsArray[2]),
    ]);
    expect(statuses).length(3);
    expect(statuses[0]).equal("Revealed");
    expect(statuses[1]).equal("Revealed");
    expect(statuses[2]).equal("Revealed");
  });
});
