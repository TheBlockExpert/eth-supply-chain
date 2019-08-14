// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    
    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    let supplyChain;
    beforeEach(async () => {
      supplyChain = await SupplyChain.new();
      await supplyChain.addFarmer(originFarmerID);
      await supplyChain.addRetailer(retailerID);
      await supplyChain.addConsumer(consumerID);
    });

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Mark an item as Harvested by calling function harvestItem()
      let result = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        eventEmitted = result.logs[0].event == 'Harvested' ? true: false;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0].toNumber(), sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        // Declare and Initialize a variable for event
        let eventEmitted = false;
        

        // Mark an item as Processed by calling function processtItem()
        let tx = await supplyChain.processItem(upc);
        eventEmitted = tx.logs[0].event == 'Processed' ? true : false;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
        
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        // setup 
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});

        // Declare and Initialize a variable for event
        let eventEmitted = false;

        // Mark an item as Packed by calling function packItem()
        let tx = await supplyChain.packItem(upc,{from: originFarmerID});
        eventEmitted = tx.logs[0].event == 'Packed' ? true : false;
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
        
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});
        await supplyChain.packItem(upc,{from: originFarmerID});
        
        // Declare and Initialize a variable for event
        let eventEmitted = false 

        // Mark an item as ForSale by calling function sellItem()
        let priceInWei = web3.utils.toWei('1', 'ether');
        let tx = await supplyChain.sellItem(upc,priceInWei,{from: originFarmerID});
        eventEmitted = tx.logs[0].event == 'ForSale' ? true : false;
        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
          
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});
        await supplyChain.packItem(upc,{from: originFarmerID});
        let priceInWei = web3.utils.toWei('1', 'ether');
        await supplyChain.sellItem(upc,priceInWei,{from: originFarmerID});
        
        // Declare and Initialize a variable for event
        let eventEmitted = false 

        // Mark an item as Sold by calling function buyItem()
        let balanceDistributorBefore = await web3.eth.getBalance(distributorID);
        let balanceDistributorBeforeBN = web3.utils.toBN(balanceDistributorBefore);
        let balanceFarmerBefore = await web3.eth.getBalance(originFarmerID);
        let balanceFarmerBeforeBN = web3.utils.toBN(balanceFarmerBefore);

        await catchRevert(supplyChain.buyItem(upc, {from: distributorID, value: web3.utils.toWei('0.5',"ether")}));
        let tx = await supplyChain.buyItem(upc,{from: distributorID, value: web3.utils.toWei('2','ether')});

        // console.log(tx.receipt.gasUsed);
        eventEmitted = tx.logs[0].event == 'Sold' ? true : false;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        // Verify the result set
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State');
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
        assert.equal(resultBufferOne[2],distributorID,"OwnerID did not change correctly");
        assert.equal(resultBufferTwo[6],distributorID,"DistributerID did not change correctly");
        
        let balanceDistributorAfter = await web3.eth.getBalance(distributorID);
        let balanceDistributorAfterBN = web3.utils.toBN(balanceDistributorAfter);
        let balanceFarmerAfter = await web3.eth.getBalance(originFarmerID);
        let balanceFarmerAfterBN = web3.utils.toBN(balanceFarmerAfter);

        
        let gasUsedBN = new web3.utils.BN(tx.receipt.gasUsed);
        let gasPrice = await web3.eth.getGasPrice();
        gasPrice = web3.utils.toBN(gasPrice);
        let gasCost = gasUsedBN.mul(gasPrice);
        let productPrice = resultBufferTwo[4];
        let totalCostBN =  productPrice.add(gasCost); 

        let remBalance = balanceDistributorBeforeBN.sub(totalCostBN);
        let balanceFarmerExpectedBN = balanceFarmerBeforeBN.add(productPrice)
         

        assert.equal(balanceFarmerAfterBN.ucmp(balanceFarmerExpectedBN),0, "Farmer didn't get paid");
        //console.log(balanceDistributorAfterBN.cmp(remBalance));
        assert.equal(remBalance.cmp(balanceDistributorAfterBN),1,"Incorrect distributor account balance");
        
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});
        await supplyChain.packItem(upc,{from: originFarmerID});
        let priceInWei = web3.utils.toWei('1', 'ether');
        await supplyChain.sellItem(upc,priceInWei,{from: originFarmerID});
        await supplyChain.buyItem(upc,{from: distributorID, value: web3.utils.toWei('2','ether')});
        
        // Declare and Initialize a variable for event
        let eventEmitted = false 

        // Mark an item as Shipped by calling function shipItem()
        let tx = await supplyChain.shipItem(upc);
        
        
        // Watch the emitted event Shipped()
        eventEmitted = tx.logs[0].event == 'Shipped' ? true : false;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        

        // Verify the result set
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State');
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
              
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});
        await supplyChain.packItem(upc,{from: originFarmerID});
        let priceInWei = web3.utils.toWei('1', 'ether');
        await supplyChain.sellItem(upc,priceInWei,{from: originFarmerID});
        await supplyChain.buyItem(upc,{from: distributorID, value: web3.utils.toWei('2','ether')});
        await supplyChain.shipItem(upc);
        
        // Declare and Initialize a variable for event
        let eventEmitted = false ;
        
        
        // Mark an item as Received by calling function receiveItem()
        tx = await supplyChain.receiveItem(upc,{from: retailerID});
        
        // Watch the emitted event Received()
        eventEmitted = tx.logs[0].event == 'Received' ? true : false;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        

        // Verify the result set
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
        assert.equal(resultBufferOne[2],retailerID,"OwnerID did not change correctly");
        assert.equal(resultBufferTwo[7],retailerID,"retailerID did not change correctly");
             
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});
        await supplyChain.packItem(upc,{from: originFarmerID});
        let priceInWei = web3.utils.toWei('1', 'ether');
        await supplyChain.sellItem(upc,priceInWei,{from: originFarmerID});
        await supplyChain.buyItem(upc,{from: distributorID, value: web3.utils.toWei('2','ether')});
        await supplyChain.shipItem(upc);
        await supplyChain.receiveItem(upc,{from: retailerID});
        
        // Declare and Initialize a variable for event
        let eventEmitted = false ;

        // Mark an item as Sold by calling function buyItem()
        tx = await supplyChain.purchaseItem(upc,{from: consumerID});
        
        // Watch the emitted event Purchased()
        eventEmitted = tx.logs[0].event == 'Purchased' ? true : false;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        

        // Verify the result set
        assert.equal(resultBufferTwo[5], 8, 'Error: Invalid item State');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
        assert.equal(resultBufferOne[2],consumerID,"OwnerID did not change correctly");
        assert.equal(resultBufferTwo[8],consumerID,"retailerID did not change correctly");
        
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {

        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc,{from: accounts[5]});

        // Verify the result set
        assert.equal(resultBufferOne[0].toNumber(), sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        
        
        
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {

        
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes,{from: originFarmerID})
        await supplyChain.processItem(upc, {from: originFarmerID});
        await supplyChain.packItem(upc,{from: originFarmerID});
        await supplyChain.sellItem(upc,productPrice,{from: originFarmerID});
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc,{from: accounts[6]});

        // Verify the result set
        assert.equal(resultBufferTwo[0].toNumber(), sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferTwo[2], productID, 'Error: Invalid productID');
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Invalid product notes');
        assert.equal(resultBufferTwo[4].cmp(web3.utils.toBN(productPrice)),0, 'Error: Invalid product price');
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], 0x00000000000000000000000000000000000000, 'Error: Invalid distributorID');
        assert.equal(resultBufferTwo[7], 0x00000000000000000000000000000000000000, 'Error: Invalid retailerID');
        assert.equal(resultBufferTwo[8], 0x00000000000000000000000000000000000000, 'Error: Invalid consumerID');
        
    })

    

});

