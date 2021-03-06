const log = (message) => {
    $('#log').removeClass('error').text(message);
    console.log(message);
  }
  const error = (message) => $('#log').addClass('error').text(message);
  
  //Connecting to the contract and call the event, functions and variables from the contract
  const address = "0xb38B6F0F7b77Df0fa718776eba940d524eABAD0d";
  const abi = [ 
   { "anonymous": false, 
  "inputs": [{ "indexed": false, "internalType": "address", "name": "player", "type": "address" }, 
  { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], 
  "name": "HighestVote", "type": "event" }, { "inputs": [], "name": "vote", "outputs": [],
   "stateMutability": "payable", "type": "function" },  { "inputs": [], "name": "getDetails", 
    "outputs": [
     { "internalType": "uint256", "name": "_higestVote", "type": "uint256" }, 
     { "internalType": "address", "name": "_highetsPlayer", "type": "address" }, 
     { "internalType": "address", "name": "_beneficiary", "type": "address" }],
      "stateMutability": "view", "type": "function" }];

    const waitForReceipt = (hash, cb) => {
    web3.eth.getTransactionReceipt(hash, (err, receipt) => {
      if (err) return error(err);
      if (!receipt) {
        // Try again in 1 second
        window.setTimeout(() => {
          waitForReceipt(hash, cb);
        }, 1000);
      } else {
        // Transaction went through
        if (!receipt.status) return error('Transaction Failed: Reverted By EVM')
        if (cb) cb(receipt);
      }
    })
  }
  
  $(document).ready(() => {
    // Connect to the blockchain
    if (window.ethereum) {
      web3 = new Web3(ethereum);
      // ask metamask's permissions to access accounts and set default account
      ethereum.request({ method: 'eth_requestAccounts' }).then((res, err) => {
        if (err) return error(err);
        web3.eth.defaultAccount = res[0];
      });
      // handle network changes
      ethereum.on('chainChanged', () => window.location.reload());
      ethereum.on('accountsChanged', (accounts) => {
        web3.eth.defaultAccount = accounts[0];
      });
      if (ethereum.networkVersion != 3) {
        // if network is not ropsten, try switching to ropsten
        ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x3' }],
        }).catch((err) => {
          error(err.message);
        });
  
      }

      //Calling HTML and change it for the current price or winner
      log("Connected to the Ropsten test network.");
      vote = new web3.eth.Contract(abi, address);
      vote.methods.getDetails().call().then((res) => {
        $('#getHighestVote').text(`${res._higestVote / 1e18} ETH`);
        $('#getHighestPlayer').text(res._highetsPlayer);
      }).catch((err) => error(err.message));
    } else {
      error("Unable to find web3. Please run MetaMask or something else that injects web3.");
    }
    
    //Button event 
    $('#vote').click((e) => {
      e.preventDefault();
      if (!web3.eth.defaultAccount) return error("No accounts found. If you're using MetaMask, please unlock it first and reload the page.");
      const bidTxObject = {
        from: web3.eth.defaultAccount,
        value: web3.utils.toWei(document.getElementById("voteAmount").value, "ether"),
      };
      vote.methods.vote().send(bidTxObject, (err, hash) => {
        log("Transaction On its Way...");
        if (err) return error(err.message);
        waitForReceipt(hash, () => {
          log("Transaction succeeded.");
        });
      })
    });
  });