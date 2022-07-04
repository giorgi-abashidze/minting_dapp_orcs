import React, { useEffect, useState, usedispatchRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`

  border-radius: 50px;
  border: none;
  background-color: var(--button-bg);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 130px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  },
  :hover {
    background-color: var(--button-hover);
  },
`;

export const InputButton = styled.button`
  padding-left:10px;
  padding-right:10px;
  border-radius: 40px;
  border: none;
  min-height:30px;
  background-color: var(--button-bg);
  font-weight: bold;
  color: var(--secondary-text);
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  },
  :hover {
    background-color: var(--button-hover);
  },
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--button-bg);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor:pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
  :hover {
    background-color: var(--button-hover);
  },
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 250px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`

  width: 60px;
  transition: width 0.5s;
  margin:10px;
`;

export const StyledLink = styled.a`
  
  color: var(--link-text-hover);
  text-decoration: underline;
  :hover{
    color: var(--link-text);
  }
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [checkingUsages, setCheckingUsages] = useState(false);
  const [feedback, setFeedback] = useState(`Max mint amount is 50.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [freeMintUsages, setFreeMintUsages] = useState(``);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let costFree = CONFIG.WEI_COST_FREE;
    let gasLimit = CONFIG.GAS_LIMIT;

    setClaimingNft(true);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);

    blockchain.smartContract.methods.freeMintsOf(blockchain.account).call()

    .then((freeMints) => {
      console.log("Free mints: ", freeMints);
      let payable = mintAmount - freeMints;

      if(payable < 0){
        payable = 0;
      }

      let totalCostWei = String(cost * mintAmount);

      if(payable == 0){
        totalCostWei = String(costFree * mintAmount);
      }
      else{
        totalCostWei = String(cost * payable + ((mintAmount - payable) * costFree));
      }

      let totalGasLimit = String(gasLimit * mintAmount);
      console.log("Cost: ", totalCostWei);
      console.log("Gas limit: ", totalGasLimit);
    
 
      blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      }).catch( (err) => {
        console.log(err);
        setFeedback("Something went wrong, try again later.");
        setClaimingNft(false);
      });
      
    }).catch((err) => {
      console.log(err);
      setFeedback("Something went wrong, try again later.");
      setClaimingNft(false);
    });

    

    
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  const openTwitter = () => {    
    window.open("https://twitter.com/goblinforestwtf");
  }

  const openOpensea = () => {    
    window.open("https://opensea.io/collection/polyorcsnft");
  }

  const checkUsages = ()  => {    
     
     if(checkingUsages){
        return;
     }

    

     let inp = document.getElementById("itemId");
     let input = inp.value;
     if(input == ""){
        return;
     }
     setCheckingUsages(true);
     try{
      let itemId = parseInt(input);
      blockchain.smartContract.methods.freeMintUsagesOfToken(itemId).call().
      then((res) =>{
        setFreeMintUsages(res);
        setCheckingUsages(false);
      }).catch((err) => {
        setFreeMintUsages("Error");
        setCheckingUsages(false);
      })
     }
     catch(err){
      setFreeMintUsages("please enter only number");
      setCheckingUsages(false);
     }
    
  }

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <ResponsiveWrapper  jc="center" ai="center" style={{ padding: 24,textAlign:"center",width:"auto" }}>
         
          <StyledImg onClick={openOpensea} style={{cursor:"pointer"}} alt={"logo"} src={"/config/images/opensea.png"} />

        </ResponsiveWrapper>
       
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        
        {blockchain.account !== "" &&
                blockchain.smartContract !== null ? 
                  <div>
                  <s.SpacerSmall></s.SpacerSmall>
                  <s.TextDescription style={{textAlign:"center"}}>
                    Read "About Free Mint" section and
                  </s.TextDescription>
                  <s.TextDescription style={{textAlign:"center"}}>
                    Check goblinforest item free mint usage here
                  </s.TextDescription>
                  <s.SpacerSmall></s.SpacerSmall>
                  <ResponsiveWrapper flex={1} jc="center" ai="center" style={{textAlign:"center",width:"auto" }}>
                  <input type="text" style={{width:"100%"}} class="myInput" placeholder="goblinforest item id" id="itemId"/>
                  <s.SpacerSmall></s.SpacerSmall>
                  <InputButton onClick={checkUsages}>Check</InputButton>
                    </ResponsiveWrapper>
                    <s.SpacerSmall></s.SpacerSmall>
                  <s.TextDescription style={{textAlign:"center"}}>{freeMintUsages}</s.TextDescription>
                  </div>
                
                : ""
              }
        
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} >
        <s.Container
            flex={1}
            jc={"center"}
            ai={"center"}
            style={{
            padding: 24,
            borderRadius: 0,
            border: "none",
            boxShadow: "none",
            }}
          >
            <s.TextTitle style={{textAlign:"center"}}>{
              <p>About Free Mint</p>
          
            
            }
            </s.TextTitle>
            <s.SpacerSmall></s.SpacerSmall>
            <s.TextDescription style={{textAlign:"center"}}>{
              
              <div>
                <p>You can mint item for free if you own goblinforest items,</p>
                <p>goblinforest item is for single use only, once item used for free mint,
                  you can't use same item to mint for free again.
                </p>
                <s.SpacerSmall></s.SpacerSmall>
                <p>Make sure to check free mint usages of token before you buy goblinforest.
                </p>
                <p>You can check it after connect your wallet, you will see check button on top of page.
                </p>
                <p>
                  basic goblinforest item have limit of 1 item free mint. 
                  </p>
                  <p>
                  1/1 goblinforest item have limit of 3 item free mint. 
                  </p>
                 
              </div>
            
            }</s.TextDescription>
          </s.Container>
            
         
        
          <s.Container
            flex={1}
            jc={"center"}
            ai={"center"}
            style={{
            padding: 24,
            borderRadius: 0,
            border: "none",
            boxShadow: "none",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 22,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
             
              {blockchain.account !== "" &&
                blockchain.smartContract !== null ? (data.totalSupply+ "/"+CONFIG.MAX_SUPPLY)
                : ""
              }
            </s.TextTitle>
           
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 17,
                fontWeight: "bold",
                color: "var(--secondary)",
              }}
            >
             
              {blockchain.account !== "" &&
                blockchain.smartContract !== null ? "You have "+(data.freeMints)+" Free item mints."
                : ""
              }
            </s.TextTitle>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Sold out.
                </s.TextTitle>
          
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
         
        
      
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      Connect
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
          
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
              
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "Busy..." : "Mint"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
       
         
        </ResponsiveWrapper>
        <s.SpacerMedium />
        
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
        
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
           I reserved 444 Orcs for my self, soo.. maxSupply is 4444
           but mintable is 4000.
          </s.TextDescription>
          <s.SpacerSmall />
         
          <s.SpacerMedium />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet).
          </s.TextDescription>
          
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
