require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "london",
    },
  },
  networks: {
    etherlink: {
      url: process.env.ETHERLINK_RPC_URL,
      // accounts: [process.env.CONTROL_OWNER, process.env.VALIDATOR],
      accounts: [process.env.SIGNER]
    },
  },
};
