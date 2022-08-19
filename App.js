import './App.css';
import {ethers} from 'ethers';
import {useState, useEffect} from 'react';
import abi from './abi.json';


function App() {

  /********** States *********/
  /* inputs */
  const [savingInput, setSavingInput] = useState("");
  const [withdrawInput, setwithdrawInput] = useState();
  const [txNumber, setTxNumber] = useState();

  /* blockchain values */
  const [checkBalance, setBalance] = useState();
  const [moneySaved, setMoneySaved] = useState("");
  const [numberTransactionDone, setNumberTransactionDone] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState();
  const [paymentTime, setPaymentTime] = useState();

  const [error, setError] = useState('');
  /* ******************** */

  useEffect(()=>{
    getBalance();
    getSavedMoney();
  })

  /**** Function to get the Input data ****/
  function getInputSave(e) {
    setSavingInput(e.target.value);
  }
  function getWinthdrawSave(e) {
    setwithdrawInput(e.target.value);
  }
  function getTxNumber(e) {
    setTxNumber(e.target.value);
  }

  /**** Read-only on the blockchain ****/
  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const userConnected = await provider.send("eth_requestAccounts", []);
        let balance = await provider.getBalance(userConnected[0]);
        balance = await balance.toString() / 10 ** 18;
        balance = balance.toString();
        balance = balance.slice(0,6);
        setBalance(balance);
      }
      catch (err) {
        setError(err.message);
        console.log(err);
      }
    }
    else {
      setError('Please install metamask');
    }
  }

  async function getSavedMoney() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let theContract = new ethers.Contract( "0x5778dc345F19f2B16fDA8954de28CADd0C2Beb36" , abi , provider);
        const userConnected = await provider.send("eth_requestAccounts", []);
        let moneySaved_ = await theContract.getMyTotalBalanceAndNumPayments({from: userConnected[0]});
        let r0 = moneySaved_[0].toString();
        r0 = r0.slice(0,16);
        let r1 = moneySaved_[1].toString();
        setMoneySaved(r0 / 10**18);
        setNumberTransactionDone(r1);
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  async function getTxInfo() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let theContract = new ethers.Contract( "0x5778dc345F19f2B16fDA8954de28CADd0C2Beb36" , abi , provider);
        const value = txNumber.toString();
        console.log(value);
        const userConnected = await provider.send("eth_requestAccounts", []);
        const result =  await theContract.getMyPaymentsInfo(value, {from:userConnected[0]});
        setPaymentAmount(result[0].toString() / 10**18);
        setPaymentTime(result[1].toString());
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  /**** Write on the blockchain ****/
  async function sendMoney() {
    setError('');
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let theContract = new ethers.Contract( "0x5778dc345F19f2B16fDA8954de28CADd0C2Beb36" , abi , provider);
      const signer = provider.getSigner();
      try {
        theContract =  await theContract.connect(signer);
        const overrides = {
          value: savingInput,
        }
        await theContract.saveMoney(overrides).then((receip)=>{
          receip.wait().then((response)=>{
            if (response.blockHash) {
              getSavedMoney();
              getBalance();
            }
          })
        })
      }
      catch(err) {
        setError(err.message);
      }
    }
    setSavingInput("");
  }

  async function withdraw() {
    setError('');
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let theContract = new ethers.Contract( "0x5778dc345F19f2B16fDA8954de28CADd0C2Beb36" , abi , provider);
        const signer = provider.getSigner();
        theContract = theContract.connect(signer);
        await theContract.withdraw(withdrawInput).then((receip)=>{
          receip.wait().then(()=>{
              getSavedMoney();
              getBalance();
          })
        })
        setwithdrawInput("");
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  return (
    <div className=''>
      <div className='bg-blue-400 top-0 min-h-screen p-2'>
        <div className='flex justify-around items-center'>
          <img className='max-h-16 md:max-h-32 mt-10' src='./eth_img.png' alt='logo ethereum'></img>
        </div>
        <div className='w-full text-white font-bold text-center mt-8 md:mt-16 mx-2'>
          <p className='text-lg'>Your actual balance</p>
          <p className='font-bold md:text-6xl text-4xl mt-10 text-black'>{checkBalance} ETH</p>
          {error && <p className='m-6 text-lg text-red-600'>{error}</p>}
        </div>
        <div className='w-full text-white font-bold mt-16 '>
          <div className='flex justify-center flex-col md:flex-row m-4'>    

              <input type="number" placeholder=' Save' className='shadow-lg h-10 rounded text-black p-2 shadow-lg m-2'onChange={(e)=>getInputSave(e)}/>
              <button className='bg-blue-400 h-10 p-1 px-5 rounded text-white shadow-lg hover:scale-125 m-2 mx-16 md:mx-2 flex justify-center items-center' onClick={()=>{sendMoney()}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
          

              <input type="number" className='shadow-lg h-10 rounded text-black p-2 shadow-lg m-2' placeholder=' Withdraw' onChange={(e)=>getWinthdrawSave(e)}/>
              <button className='bg-blue-400 h-10 p-1 px-5 rounded text-white shadow-lg hover:scale-125 m-2 mx-16 md:mx-2 flex justify-center items-center' onClick={()=>withdraw()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
 
          </div>
          <div className='flex justify-center flex-col items-center m-4 md:m-14 text-lg text-black'>
            <div>
              <h1>Your saved: {moneySaved} eth</h1>
              <h1>Transaction done: {numberTransactionDone}</h1>
            </div>
          </div>
           
          <div className='mt-4 text-base md:text-2xl md:mt-14 flex justify-center items-center text-xl'>
            <span>Transaction n° </span><input className='rounded p-1 px-5 w-14 text-black text-center shadow-lg mx-2' onChange={(e)=>getTxNumber(e)} type="number"/>
            <button className='bg-blue-400 h-10 p-1 px-5 rounded text-white shadow-lg hover:scale-125' onClick={()=>getTxInfo()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <div className='flex justify-center mt-8 flex-col items-center text-lg text-black'>
            <div>
              <p>Transaction amount: {paymentAmount}</p>
              <p>Transaction time: {paymentTime}</p>
            </div>
          </div>
        </div>

        <div className='text-white relative mt-16 md:mt-0 md:bottom-0 md:fixed md:text-2xl text-xl font-bold m-4 right-0'>Developped by Bastien VDB</div>
      </div>

    </div>
  );
}

export default App;
