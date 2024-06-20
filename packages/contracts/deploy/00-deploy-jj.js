const { ethers, network } = require("hardhat");
const fs = require("fs").promises;

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();


    const { blocksToAct, costToRoll, costToReroll } = 
    {
        blocksToAct: 40,
        costToRoll: 100, // ethers.parseEther("1"),
        costToReroll: 25, // ethers.parseEther("0.5")
    }

    const JackpotJunction = await deploy("JackpotJunction", {
        from: deployer,
        args: [blocksToAct, costToRoll, costToReroll],
        automine: true,
        log: true
    });

    log(`JackpotJunction (${network.name}) deployed to ${JackpotJunction.address}`);

    // Verify the contract on Etherscan for networks other than localhost
    // if (network.config.chainId !== 31337) {
    //     await hre.run("verify:verify", {
    //         address: JackpotJunction.address,
    //         constructorArguments: [blocksToAct, costToRoll, costToReroll],
    //     });
    // }
}