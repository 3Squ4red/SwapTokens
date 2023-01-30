import "./Proposal.css";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  CardActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";

const Proposal = ({
  setProposals,
  contract,
  currentUser,
  id,
  proposer,
  token1,
  amount1,
  token2,
  amount2,
}) => {
  const [token1Name, setToken1Name] = useState("");
  const [token1Sym, setToken1Sym] = useState("");
  const [token2Name, setToken2Name] = useState("");
  const [token2Sym, setToken2Sym] = useState("");

  useEffect(() => {
    getTokenNames();
  }, []);

  const getTokenNames = async () => {
    const t1 = await contract.getTokenDetails(token1);
    setToken1Name(t1.name);
    setToken1Sym(t1.symbol);
    const t2 = await contract.getTokenDetails(token2);
    setToken2Name(t2.name);
    setToken2Sym(t2.symbol);
  };

  return (
    <Card className="card">
      <CardContent className="cc">
        <Typography
          sx={{ fontSize: 24 }}
          variant="h5"
          color="text.primary"
          gutterBottom
        >
          Proposer: {proposer}
        </Typography>
        <Typography variant="h6" component="div">
          <Divider />
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          You'll get {amount1.toNumber()} {token1Name} (
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/token/${token1}`}
          >
            {token1Sym}
          </a>
          )
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          You'll give {amount2.toNumber()} {token2Name} (
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/token/${token2}`}
          >
            {token2Sym}
          </a>
          )
        </Typography>
      </CardContent>
      <CardActions className="cardActions">
        <Button
          size="small"
          onClick={async () => {
            try {
              const tx = await contract.cancel(id);
              await tx.wait();

              // Update the proposals list
              const prp = await contract.getAllProposals();
              setProposals(prp);

              alert("You successfully cancelled your proposal!");
            } catch (e) {
              console.error(e.message);
              alert(e.message);
            }
          }}
          disabled={currentUser.toLowerCase() !== proposer.toLowerCase()}
        >
          Cancel
        </Button>
        <Button
          size="small"
          onClick={async () => {
            try {
              const tx = await contract.close(proposer, id);
              await tx.wait();

              // Update the proposals list
              const prp = await contract.getAllProposals();
              setProposals(prp);

              alert("You successfully closed a proposal!");
            } catch (e) {
              console.error(e.message);
              alert(e.message);
            }
          }}
          disabled={currentUser.toLowerCase() === proposer.toLowerCase()}
        >
          Accept
        </Button>
      </CardActions>
    </Card>
  );
};

export default Proposal;
