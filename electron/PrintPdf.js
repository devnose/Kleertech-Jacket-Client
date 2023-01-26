const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require("electron");
const axios = require('axios').default;
const { channels } = require("../src/shared/constants");
const fs = require('fs');
const path = require("path");
const os = require('os');
const { resolve } = require("path");
const stream = require('stream');
const { exec } = require("child_process");
const { notification } = require("antd");
const { title } = require("process");
const { Notification } = require("electron/main");

const defaultPrinter = {
  printer: ""
}

console.log('fuckfuckfuck')


Object.defineProperty(defaultPrinter, "getPrinter", {
    get : function () {
      return this.printer; 
    }
}); 

// setting property
Object.defineProperty(defaultPrinter, "setPrinter", {
  set : function (value) {
      this.printer = value;
  }
});




ipcMain.on(channels.GET_JACKET, (event, arg) => {
    console.log(arg);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),  `print-kleer-`)); 
    console.log(tempDir)
    readPrintDir(tempDir,arg.directory, arg.username)

    
}); 


const makeTemp = async () => {

    fs.mkdtemp(path.join(os.tmpdir(), `print-29938-`), (err, folder) => {
         console.log(folder); 
        // readPrintDir(folder); 
            readPrintDir(folder); 
            re
    }); 
}




const readPrintDir = async (tempDir,tenary,username) => {

    const data = { dir: tempDir, directory: tenary, username: username, };
    axios.post("http://localhost:8090/readPrintDir", data).then((res) => {
      if (res.data.success) {
             const files = res.data.files; 
             var counter = 0; 
            for(var x = 0; x < files.length; x++){
                getConvertedPrintFiles(files[x], tempDir, files.length, tenary); 

            }
      //  getConvertedPrintFiles('20222415CO.pdf')

        const data = {
          username: username,
          action: `Printed Job Jacket: ${tenary}`,
        };
        axios.post("http://localhost:8090/logData", data).then((res) => {
        //   console.log(res);
        });
      }
  }); 
    
}; 

var x = 0; 
const getConvertedPrintFiles = async (fileName, tempDir, howManyFiles, tenary) => {


    //sends file name to backend to get data.  

    const receiveFile = await axios.request({
        method: 'GET',
        url: `http://localhost:8090/sendPdfs/${fileName}`,
        responseType: 'arraybuffer',
        responseEncoding: 'binary'

    }); 

    //writing the binary file data back to a file in temp directory 
    try {
        fs.writeFileSync(`${tempDir}\\${fileName}`, receiveFile.data);
        console.log('Success in writing file'); 
        ++x; 
        console.log(x)
        if(x == howManyFiles){
          console.log(true); 
          sendToPrintQue(tempDir, tenary)
          x = 0; 
        }

      } catch (err) {
        console.log('Error in writing file')
        console.log(err)
      }

}



const sendToPrintQue = (tempDir, tenary) => {

  showPrintNotification(tenary); 


  const username = os.userInfo().username; 

  var files = fs.readdirSync(tempDir)
  console.log(files); 

  for(var x = 0; x < files.length; x++){
        if(files[x].includes('.pdf')){

              print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}" `); 

        if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')){

              console.log(files[x]); 
               print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}"`); 
          }
      }
    }
}


const print = (arg) => {
  
  if(process.platform == 'win32'){
      exec(arg, {windowsHide: true}, (e) => {
        if(e){console.log(e); throw e}; 
      }); 
  }

    
}




const setPrinter = (userPrinter) => {
  console.log(userPrinter); 
  defaultPrinter.setPrinter = userPrinter
}

const showPrintNotification = async (tenary) => {
 axios.post('http://localhost:8090/notify', {payload: `Printing ${tenary}`}).then(res => {console.log(res.data)}); 

}



module.exports = {setPrinter}