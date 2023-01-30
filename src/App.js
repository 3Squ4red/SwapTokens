import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import Proposal from "./Proposal";
import "./App.css";
import { address, abi } from "./contract";
import { ethers } from "ethers";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [isGoerli, setIsGoerli] = useState(false);
  const [swapContract, setSwapContract] = useState();
  const [proposals, setProposals] = useState([]);
  const [token1, setToken1] = useState("");
  const [amount1, setAmount1] = useState("");
  const [token2, setToken2] = useState("");
  const [amount2, setAmount2] = useState("");

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install metamask");
        return;
      }

      const chainId = await ethereum.request({ method: "eth_chainId" });
      if (chainId === "0x5") {
        setIsGoerli(true);

        // getting the account
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setUserAddress(accounts[0]);

        // getting the contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(address, abi, signer);
        setSwapContract(contract);

        // getting all the proposals
        const prp = await contract.getAllProposals();
        console.log("PRP: ", prp);
        setProposals(prp);

        // Account and network listeners
        window.ethereum.on("accountsChanged", function (accounts) {
          setUserAddress(accounts[0]);
        });

        window.ethereum.on("chainChanged", function (networkId) {
          setIsGoerli(networkId === "0x5");
        });
      } else {
        alert("please switch to Goerli network");
        return;
      }
    } catch (error) {
      console.error("ERR connecting to MetaMask", error.message);
    }
  };

  const openProposal = async (e) => {
    e.preventDefault();
    if (!swapContract) return;

    try {
      const tx = await swapContract.open(token1, amount1, token2, amount2);
      await tx.wait();

      const prp = await swapContract.getAllProposals();
      console.log("PRP: ", prp);
      setProposals(prp);

      alert("A new swap proposal created successfully");
      setToken1("");
      setAmount1("");
      setToken2("");
      setAmount2("");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <div>
      {userAddress === "" ? (
        <center>
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        </center>
      ) : isGoerli ? (
        <div className="App">
          <h1>Swap Tokens</h1>
          <form>
            <TextField
              id="outlined-basic"
              label="Token1"
              variant="outlined"
              style={{ margin: "0px 5px" }}
              size="small"
              placeholder="Your token address"
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Amount1"
              variant="outlined"
              style={{ margin: "0px 5px" }}
              size="small"
              placeholder="Amount of your tokens you want to swap"
              type="number"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Token2"
              variant="outlined"
              style={{ margin: "0px 5px" }}
              size="small"
              placeholder="Address of the token you want in return"
              value={token2}
              onChange={(e) => setToken2(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Amount2"
              variant="outlined"
              style={{ margin: "0px 5px" }}
              size="small"
              placeholder="Amount of the tokens you want in return"
              type="number"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={openProposal}>
              Open
            </Button>
          </form>

          <ol className="proposalsList">
            {proposals.map((proposal, i) => {
              if (!proposal.isClosed)
                return (
                  <li key={i} className="listItem">
                    <Proposal
                      setProposals={setProposals}
                      contract={swapContract}
                      currentUser={userAddress}
                      id={proposal.id}
                      proposer={proposal.proposer}
                      token1={proposal.token1}
                      amount1={proposal.amount1}
                      token2={proposal.token2}
                      amount2={proposal.amount2}
                    />
                  </li>
                );
            })}
          </ol>
        </div>
      ) : (
        <div>
          <div className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3">
            Please switch to the Goerli testnet and then reload{" "}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
