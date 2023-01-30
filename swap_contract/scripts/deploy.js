async function main() {
  const Swap = await ethers.getContractFactory("Swap");
  const swap = await Swap.deploy();

  await swap.deployed();

  console.log(`Swap deployed to ${swap.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
