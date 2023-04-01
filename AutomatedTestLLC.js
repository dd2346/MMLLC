const {Builder, Browser, By, Key, until, WebElement} = require('selenium-webdriver');

const assert = require('assert');

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

(async function MMtest() {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    // go to Home page
    const homeURL = "https://chaturbate.com/";
    await driver.get(homeURL);


    // hit over 18 'I agree' button
    await driver.findElement(By.id('close_entrance_terms')).click();


    // get list of chat rooms
    const chatRooms = await driver.findElements(By.className("room_list_room roomCard"));


    // pick a random room
    let roomNo = getRandomIntInclusive(0,chatRooms.length-1)


    // get room name
    let chatRoom = await chatRooms[roomNo].findElement(By.className("title")).findElement(By.tagName("a")).getText();
    console.log("Chat room name: " + chatRoom);


    // go into chat room
    await chatRooms[roomNo].click();
    let newURL = await driver.getCurrentUrl();
    assert.strictEqual(newURL, homeURL+chatRoom+"/");
    console.log("Correct chat room name in URL (" + chatRoom + ")");


    // Check elements exist

    // --Sign in button
    await driver.findElement(By.className("creat nooverlay auip_track"));
    console.log("'Sign in' button found");
    
    // --Scan cams 
    let scanCamElement = await driver.findElement(By.className("tabActiveColor transparentBg"));
    console.log("'Scan cam' element found");

    // --Next Cam
    await driver.findElement(By.className("nextCamBgColor tabBorder tabActiveColor"));
    console.log("'Next Cam' element found");

    // --Send Tip
    await driver.findElement(By.className("sendTipButton"));
    console.log("'Send tip' button found");


    // check video stream is playing
    var videoElement = await driver.findElement(By.className("videoPlayerDiv")).findElement(By.tagName("div"));
    var videoClass = await videoElement.getAttribute("class");
    let k = 0;

    while (!videoClass.includes("vjs-playing")) {
      if (k==0) {
        console.log("Waiting for video to start playing...");
      }
      try {
        videoElement = await driver.findElement(By.className("videoPlayerDiv")).findElement(By.tagName("div"));
        videoClass = await videoElement.getAttribute("class");
      }
      catch {
        videoElement = await driver.findElement(By.className("videoPlayerDiv")).findElement(By.tagName("div"));
        videoClass = await videoElement.getAttribute("class");
      }
      k++;
    }

    if (videoClass.includes("vjs-playing")) {
      console.log("The video is playing");
    } else {
      throw "The video is not playing";
    }

    
    // click scan cams 3 times and check cam changes
    for (let i=0; i<3; i++) {
        scanCamElement.click();
        let nextURL = await driver.getCurrentUrl();
        while ((nextURL == (newURL+"?next_in=15")) || (nextURL == newURL)) {
            nextURL = await driver.getCurrentUrl();
            if (nextURL == (newURL+"?next_in=15")) {
              scanCamElement.click();
            }
        }
        await driver.findElement(By.className("section clearfix")).click();
        let newRoom = nextURL.split("/")[3];
        assert.notStrictEqual(newURL, nextURL);
        console.log("Chat room changed successfully to " + newRoom);
        newURL = nextURL;
    }

  } finally {
    await driver.quit();
  }
})();